import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  message_text: string;
  sender_type: string;
  sent_at: string;
}

export const LiveChatModal = ({ isOpen, onClose }: LiveChatModalProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (sessionId) {
      loadMessages();
      subscribeToMessages();
    }
    
    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('support_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!sessionId) return;

    // Clean up existing subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;
  };

  const startChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const sessionData = {
        user_id: user?.id || null,
        visitor_name: !user ? visitorName : null,
        visitor_email: !user ? visitorEmail : null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('support_chat_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setHasStarted(true);
      
      toast({
        title: "Chat Started",
        description: "Redirecting to support chat...",
      });
      
      // Redirect to dedicated support chat page
      setTimeout(() => {
        onClose();
        navigate(`/support-chat/${data.id}`);
      }, 1000);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !sessionId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('support_chat_messages')
        .insert({
          session_id: sessionId,
          sender_id: user?.id || null,
          sender_type: user ? 'user' : 'visitor',
          message_text: messageText.trim()
        });

      if (error) throw error;
      setMessageText("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Live Support Chat
          </DialogTitle>
          <DialogDescription>
            Start a conversation with our support team. We'll respond as soon as possible.
          </DialogDescription>
        </DialogHeader>
        
        {!hasStarted ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Start a conversation with our support team. We'll respond as soon as possible.
            </p>
            
            {!isAuthenticated && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="visitorName">Your Name *</Label>
                  <Input
                    id="visitorName"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="visitorEmail">Your Email *</Label>
                  <Input
                    id="visitorEmail"
                    type="email"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
              </>
            )}
            
            <Button 
              onClick={startChat}
              className="w-full"
              disabled={!isAuthenticated && (!visitorName.trim() || !visitorEmail.trim())}
            >
              Start Live Chat
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 border rounded-lg p-4 overflow-y-auto bg-gray-50 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Waiting for support agent...</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'user' || message.sender_type === 'visitor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.sender_type === 'user' || message.sender_type === 'visitor'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{message.message_text}</p>
                      <span className="text-xs opacity-70">
                        {new Date(message.sent_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="flex gap-2 safe-area-bottom">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={2}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!messageText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};