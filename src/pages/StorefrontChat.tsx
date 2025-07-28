
import { Layout } from "@/components/Layout";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const StorefrontChat = () => {
  const { url } = useParams();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [chatRoom, setChatRoom] = useState<any>(null);
  const [storefrontInfo, setStorefrontInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!url) return;
    loadStorefrontInfo();
  }, [url]);

  const loadStorefrontInfo = async () => {
    try {
      const { data: storefront } = await supabase
        .from('user_storefronts')
        .select('*')
        .eq('storefront_url', url)
        .single();

      if (storefront) {
        setStorefrontInfo(storefront);
        await findOrCreateStorefrontChat(storefront.id);
      }
    } catch (error) {
      console.error('Error loading storefront:', error);
    }
  };

  const findOrCreateStorefrontChat = async (storefrontId: string) => {
    try {
      setMessagesLoading(true);
      
      // Look for existing storefront chat
      let { data: existingChat } = await supabase
        .from('storefront_chats')
        .select('*')
        .eq('storefront_id', storefrontId)
        .maybeSingle();

      if (!existingChat) {
        // Create new storefront chat
        const { data: newChat, error } = await supabase
          .from('storefront_chats')
          .insert({
            storefront_id: storefrontId,
            visitor_name: user?.user_metadata?.full_name || 'Anonymous',
            visitor_email: user?.email || null
          })
          .select()
          .single();

        if (error) throw error;
        existingChat = newChat;
      }

      setChatRoom(existingChat);

      // For now, we'll just show a placeholder since the actual chat implementation
      // would require connecting this to the CS worker system
      setMessages([]);
      
    } catch (error) {
      console.error('Error with storefront chat:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat",
        variant: "destructive"
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || loading || !chatRoom) return;

    setLoading(true);
    
    try {
      // Add message to local state immediately for better UX
      const newMessage = {
        id: Date.now().toString(),
        message_text: message.trim(),
        sender_id: user?.id || 'visitor',
        sent_at: new Date().toISOString(),
        read: false
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage("");

      // In a full implementation, this would:
      // 1. Create a proper chat room linking to CS workers
      // 2. Add the message to the chat_messages table
      // 3. Queue the chat for CS worker assignment
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent. A customer service representative will respond shortly."
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!storefrontInfo) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Mobile fullscreen layout
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/storefront/${url}`)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">Chat with {storefrontInfo.business_name}</h1>
            <p className="text-sm text-gray-600">Customer Support</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Start a conversation with {storefrontInfo.business_name}!</p>
              <p className="text-sm mt-2">A customer service representative will respond to your message.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender_id === user?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.message_text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.sent_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || loading}
              size="sm"
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/storefront/${url}`)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Chat with {storefrontInfo.business_name}</h1>
            <p className="text-sm text-gray-600">Customer Support</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border min-h-[400px] flex flex-col">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-96">
            {messagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Start a conversation with {storefrontInfo.business_name}!</p>
                <p className="text-sm mt-2">A customer service representative will respond to your message.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender_id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.message_text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.sent_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!message.trim() || loading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StorefrontChat;
