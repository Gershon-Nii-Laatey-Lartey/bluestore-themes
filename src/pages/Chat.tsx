
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { adAnalyticsService } from "@/services/adAnalyticsService";

const Chat = () => {
  const { sellerId } = useParams();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const roomId = searchParams.get('roomId');
  const createOnMessage = searchParams.get('createOnMessage');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [chatRoom, setChatRoom] = useState<any>(null);
  const [sellerName, setSellerName] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [productImage, setProductImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const ChatSkeleton = () => (
    <div className="h-screen flex flex-col">
      {/* Mobile Header Skeleton */}
      {isMobile && (
        <div className="bg-white border-b p-4">
          <div className="animate-pulse flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages Skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs ${index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-500'} rounded-lg p-3`}>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Input Skeleton */}
      <div className="border-t p-4">
        <div className="animate-pulse flex space-x-2">
          <div className="flex-1 h-10 bg-gray-200 rounded"></div>
          <div className="w-10 h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (user && sellerId) {
      initializeChat();
    }
  }, [user, sellerId]);

  useEffect(() => {
    if (chatRoom) {
      fetchMessages(chatRoom.id);
    }
  }, [chatRoom]);

  const findOrCreateChatRoom = async () => {
    if (!user || !sellerId) return null;

    try {
      let existingRoom = null;

      // If roomId is provided, use that room
      if (roomId) {
        const { data: room } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (room) {
          return room;
        }
      }

      // Look for existing room between these users for this product
      const { data: roomsByParticipants } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`and(buyer_id.eq.${user.id},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${user.id})`)
        .eq('product_id', productId || '');

      if (roomsByParticipants && roomsByParticipants.length > 0) {
        existingRoom = roomsByParticipants[0];
        return existingRoom;
      }

      // If no existing room found, create new one
      const { data: newRoom, error } = await supabase
        .from('chat_rooms')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          product_id: productId || '',
        })
        .select()
        .single();

      if (error) throw error;
      return newRoom;
    } catch (error) {
      console.error('Error finding/creating chat room:', error);
      return null;
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      setMessagesLoading(true);
      
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('id, message_text, sender_id, receiver_id, sent_at, read')
        .eq('room_id', roomId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const initializeChat = async () => {
    if (!user || !sellerId) return;

    try {
      setLoading(true);

      // Find or create chat room
      const room = await findOrCreateChatRoom();
      if (!room) {
        toast({
          title: "Error",
          description: "Failed to initialize chat",
          variant: "destructive"
        });
        return;
      }

      setChatRoom(room);

      // Fetch seller and product details
      if (productId) {
        const { data: productData } = await supabase
          .from('product_submissions')
          .select('title, images')
          .eq('id', productId)
          .single();

        if (productData) {
          setProductTitle(productData.title);
          setProductImage(productData.images?.[0] || '');
        }
      }

      // Fetch seller name
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', sellerId)
        .single();

      if (sellerData) {
        setSellerName(sellerData.full_name);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !chatRoom || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: chatRoom.id,
          sender_id: user.id,
          receiver_id: sellerId,
          message_text: message.trim()
        });

      if (error) throw error;

      // Track message for analytics if productId is available
      if (productId) {
        adAnalyticsService.trackMessage(productId).catch(error => {
          console.error('Error tracking message:', error);
        });
      }

      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading || messagesLoading) {
    return <ChatSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please log in to chat</h2>
          <p className="text-gray-600">You need to be logged in to start a conversation.</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Mobile Header - Chat Description Card */}
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {productImage && (
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={productImage} 
                  alt={productTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {sellerName || 'Seller'}
              </h3>
              {productTitle && (
                <p className="text-sm text-gray-500 truncate">
                  {productTitle}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Messages - with bottom padding to account for fixed input bar */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                <p className="text-gray-500">Send a message to begin chatting</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender_id === user.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.message_text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.sent_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Fixed Message Input Bar at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 border-t p-4 bg-white shadow-lg">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      <div className="flex h-screen">
        {/* Sidebar */}
        {!isMobile && (
          <div className="w-80 border-r bg-gray-50">
            <ChatSidebar currentRoomId={chatRoom?.id} />
          </div>
        )}
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b p-4 bg-white">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="md:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              {productImage && (
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={productImage} 
                    alt={productTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {sellerName || 'Seller'}
                </h3>
                {productTitle && (
                  <p className="text-sm text-gray-500 truncate">
                    {productTitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-500">Send a message to begin chatting</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender_id === user.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{msg.message_text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.sent_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="border-t p-4 bg-white">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
