
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, Mail, Phone, Clock, ArrowRight, CheckCircle, AlertCircle, MessageSquare, Send, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/services/notificationService";
import { cn } from "@/lib/utils";

interface UserSupportSession {
  id: string;
  user_id: string | null;
  visitor_name: string | null;
  visitor_email: string | null;
  status: 'pending' | 'active' | 'resolved' | 'transferred';
  case_number: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
  last_message?: string;
  message_count?: number;
}

interface SupportMessage {
  id: string;
  session_id: string;
  sender_id: string | null;
  sender_type: 'user' | 'visitor' | 'worker' | 'admin';
  message_text: string;
  sent_at: string;
}

const Support = () => {
  const [userSessions, setUserSessions] = useState<UserSupportSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadUserSessions();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadUserSessions = async () => {
    try {
      setLoadingSessions(true);
      
      const { data: sessionsData, error } = await supabase
        .from('support_chat_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const enrichedSessions = await Promise.all(
        sessionsData.map(async (session) => {
          const { data: lastMessage } = await supabase
            .from('support_chat_messages')
            .select('message_text')
            .eq('session_id', session.id)
            .order('sent_at', { ascending: false })
            .limit(1)
            .single();

          const { count: messageCount } = await supabase
            .from('support_chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          return {
            ...session,
            last_message: lastMessage?.message_text || 'No messages yet',
            message_count: messageCount || 0
          };
        })
      );

      setUserSessions(enrichedSessions);
    } catch (error) {
      console.error('Error loading user sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const startNewChat = async () => {
    try {
      setSending(true);
      
      const { data, error } = await supabase
        .from('support_chat_sessions')
        .insert({
          user_id: user?.id,
          visitor_name: visitorName || user?.email?.split('@')[0] || 'User',
          visitor_email: visitorEmail || user?.email,
          status: 'pending',
          priority: 1
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data);
      setMessages([]);
      setShowChat(true);
      
      // Subscribe to messages
      subscribeToMessages(data.id);
      
      toast({
        title: "Chat Started",
        description: "Your support chat has been created successfully.",
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
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

  const subscribeToMessages = (sessionId: string) => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    const channel = supabase
      .channel(`support-chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newMessage = payload.new as SupportMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !currentSession) return;

    try {
      setSending(true);
      
      const { error } = await supabase
        .from('support_chat_messages')
        .insert({
          session_id: currentSession.id,
          sender_id: user?.id,
          sender_type: 'user',
          message_text: messageText.trim()
        });

      if (error) throw error;

      // Notify admins about the support chat message
      if (user) {
        try {
          const userName = user.user_metadata?.full_name || user.email || 'Unknown User';
          await notificationService.notifyAdminsForSupportChat(
            user.id,
            userName,
            messageText.trim()
          );
        } catch (notificationError) {
          console.error('Error notifying admins:', notificationError);
          // Don't fail the message sending if notification fails
        }
      }

      setMessageText("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      setDeletingSession(sessionId);
      
      // Delete messages first
      const { error: messagesError } = await supabase
        .from('support_chat_messages')
        .delete()
        .eq('session_id', sessionId);

      if (messagesError) throw messagesError;

      // Delete session
      const { error: sessionError } = await supabase
        .from('support_chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // Remove from local state
      setUserSessions(prev => prev.filter(s => s.id !== sessionId));
      
      toast({
        title: "Chat Deleted",
        description: "Support chat has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingSession(null);
    }
  };

  const continueChat = async (session: UserSupportSession) => {
    setCurrentSession(session);
    await loadMessages(session.id);
    subscribeToMessages(session.id);
    setShowChat(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'active': return <MessageSquare className="h-3 w-3" />;
      case 'resolved': return <CheckCircle className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-600 mt-1">Get help with using BlueStore</p>
        </div>

        {!showChat ? (
          <>
            {/* Live Chat Section */}
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Live Chat Support
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center">
                  <p className="text-gray-600 mb-4 text-sm">
                    Need immediate assistance? Our support team is here to help you with any questions or issues.
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setShowChat(true)}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Start Live Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Support Chats */}
            {user && (
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Support Chats</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {loadingSessions ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : userSessions.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No previous support chats</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userSessions.map((session) => (
                        <div
                          key={session.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors",
                            session.status === 'resolved' && "opacity-60 bg-gray-50"
                          )}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                S
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium truncate">
                                  Support Chat
                                </span>
                                {session.case_number && (
                                  <Badge variant="outline" className="text-xs">
                                    {session.case_number}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {session.last_message}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getStatusColor(session.status)} variant="secondary">
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(session.status)}
                                    <span className="text-xs">{session.status}</span>
                                  </div>
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {formatDate(session.updated_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {session.status !== 'resolved' && (
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" onClick={() => continueChat(session)}>
                                Continue
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => deleteSession(session.id)}
                                disabled={deletingSession === session.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {deletingSession === session.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                      
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* FAQ Link */}
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4 text-sm">
                  Find quick answers to common questions about using BlueStore.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/faq">
                    View FAQ
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Other Ways to Reach Us</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Email Support</div>
                      <div className="text-xs text-gray-600">support@bluestore.com</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Phone Support</div>
                      <div className="text-xs text-gray-600">+1 (555) 123-4567</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Support Hours</div>
                    <div className="text-xs text-gray-600">Mon-Fri 9AM-6PM EST</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Chat Interface */
          <div className="space-y-4">
            {/* Chat Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                    Support Chat
                    {currentSession?.case_number && (
                      <Badge variant="outline" className="ml-2">
                        {currentSession.case_number}
                      </Badge>
                    )}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowChat(false);
                      setCurrentSession(null);
                      setMessages([]);
                      if (subscriptionRef.current) {
                        supabase.removeChannel(subscriptionRef.current);
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Chat Messages */}
            <Card>
              <CardContent className="p-0">
                <div className="h-96 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'user' || message.sender_type === 'visitor' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-end space-x-2 max-w-xs md:max-w-md">
                          {message.sender_type !== 'user' && message.sender_type !== 'visitor' && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                S
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`px-3 py-2 rounded-lg ${
                              message.sender_type === 'user' || message.sender_type === 'visitor'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message_text}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_type === 'user' || message.sender_type === 'visitor'
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}>
                              {formatTime(message.sent_at)}
                            </p>
                          </div>
                          {message.sender_type === 'user' || message.sender_type === 'visitor' && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
            </Card>

            {/* Message Input */}
            <Card>
              <CardContent className="p-4">
                <div className="flex space-x-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!messageText.trim() || sending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Support;
