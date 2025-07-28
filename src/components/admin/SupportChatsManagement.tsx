import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, CheckCircle, ArrowRight } from "lucide-react";

interface SupportChatSession {
  id: string;
  user_id: string;
  visitor_name: string;
  visitor_email: string;
  status: string;
  case_number: string;
  created_at: string;
  resolved_at: string;
}

export const SupportChatsManagement = () => {
  const [sessions, setSessions] = useState<SupportChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('support_chat_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_chat_sessions')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Chat Updated",
        description: `Chat session ${status} successfully`,
      });

      loadSessions();
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update chat session",
        variant: "destructive"
      });
    }
  };

  const transferToAdmin = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('support_chat_sessions')
        .update({ 
          status: 'transferred',
          transferred_to_admin: true
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Chat Transferred",
        description: "Chat session has been transferred to admin for review",
      });

      loadSessions();
    } catch (error) {
      console.error('Error transferring session:', error);
      toast({
        title: "Error",
        description: "Failed to transfer chat session",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'transferred': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = sessions.filter(session => 
    filterStatus === 'all' || session.status === filterStatus
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Support Chat Sessions</h3>
          <p className="text-sm text-gray-600">Manage customer support chat sessions</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="transferred">Transferred</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredSessions.map((session) => (
          <Card key={session.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <CardTitle className="text-lg">
                      {session.visitor_name || session.visitor_email || 'Authenticated User'}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      {session.case_number && (
                        <Badge variant="secondary">
                          {session.case_number}
                        </Badge>
                      )}
                      {session.visitor_email && (
                        <Badge variant="outline">
                          {session.visitor_email}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {(session.status === 'pending' || session.status === 'active') && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateSessionStatus(session.id, 'resolved')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => transferToAdmin(session.id)}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Transfer to Admin
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredSessions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chat sessions found</h3>
              <p className="text-gray-500">
                {filterStatus === 'all' 
                  ? "No support chat sessions have been created yet."
                  : `No chat sessions with status "${filterStatus}" found.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};