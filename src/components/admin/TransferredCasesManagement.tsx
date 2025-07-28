import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, MessageSquare, Flag, Plus } from "lucide-react";

interface TransferredCase {
  id: string;
  case_number: string;
  status: string;
  created_at: string;
  case_type: 'report' | 'chat';
  product_title?: string;
  visitor_name?: string;
}

export const TransferredCasesManagement = () => {
  const [cases, setCases] = useState<TransferredCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateType, setUpdateType] = useState("");
  const [selectedCaseNumber, setSelectedCaseNumber] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadTransferredCases();
  }, []);

  const loadTransferredCases = async () => {
    try {
      // Load transferred reports
      const { data: reports, error: reportsError } = await supabase
        .from('product_reports')
        .select(`
          id,
          case_number,
          status,
          created_at,
          product_submissions(title)
        `)
        .eq('transferred_to_admin', true)
        .not('case_number', 'is', null);

      if (reportsError) throw reportsError;

      // Load transferred chats
      const { data: chats, error: chatsError } = await supabase
        .from('support_chat_sessions')
        .select('id, case_number, status, created_at, visitor_name')
        .eq('transferred_to_admin', true)
        .not('case_number', 'is', null);

      if (chatsError) throw chatsError;

      // Combine and format data
      const allCases: TransferredCase[] = [
        ...(reports || []).map(report => ({
          id: report.id,
          case_number: report.case_number,
          status: report.status,
          created_at: report.created_at,
          case_type: 'report' as const,
          product_title: report.product_submissions?.title
        })),
        ...(chats || []).map(chat => ({
          id: chat.id,
          case_number: chat.case_number,
          status: chat.status,
          created_at: chat.created_at,
          case_type: 'chat' as const,
          visitor_name: chat.visitor_name
        }))
      ];

      setCases(allCases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error('Error loading transferred cases:', error);
      toast({
        title: "Error",
        description: "Failed to load transferred cases",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCaseUpdate = async () => {
    if (!selectedCaseNumber || !updateType || !updateMessage.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedCase = cases.find(c => c.case_number === selectedCaseNumber);
      
      const { error } = await supabase
        .from('case_updates')
        .insert({
          case_number: selectedCaseNumber,
          case_type: selectedCase?.case_type || 'report',
          update_type: updateType,
          message: updateMessage.trim()
        });

      if (error) throw error;

      toast({
        title: "Update Added",
        description: "Case update has been added successfully",
      });

      setUpdateMessage("");
      setUpdateType("");
      setSelectedCaseNumber("");
    } catch (error) {
      console.error('Error adding case update:', error);
      toast({
        title: "Error",
        description: "Failed to add case update",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'transferred': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Transferred Cases</h3>
        <p className="text-sm text-gray-600">Manage cases transferred from CS workers</p>
      </div>

      {/* Add Case Update Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Case Update
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Case Number</Label>
            <Select value={selectedCaseNumber} onValueChange={setSelectedCaseNumber}>
              <SelectTrigger>
                <SelectValue placeholder="Select a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((case_) => (
                  <SelectItem key={case_.case_number} value={case_.case_number}>
                    {case_.case_number} - {case_.case_type === 'report' ? case_.product_title : case_.visitor_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Update Type</Label>
            <Select value={updateType} onValueChange={setUpdateType}>
              <SelectTrigger>
                <SelectValue placeholder="Select update type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status_change">Status Change</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="resolution">Resolution</SelectItem>
                <SelectItem value="escalation">Escalation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Update Message</Label>
            <Textarea
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              placeholder="Enter case update details..."
              rows={3}
            />
          </div>

          <Button onClick={addCaseUpdate}>
            Add Update
          </Button>
        </CardContent>
      </Card>

      {/* Cases List */}
      <div className="grid gap-4">
        {cases.map((case_) => (
          <Card key={case_.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {case_.case_type === 'report' ? (
                    <Flag className="h-5 w-5 text-red-500 mt-0.5" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {case_.case_type === 'report' 
                        ? (case_.product_title || 'Product Report')
                        : (case_.visitor_name || 'Support Chat')
                      }
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(case_.status)}>
                        {case_.status}
                      </Badge>
                      <Badge variant="secondary">
                        {case_.case_number}
                      </Badge>
                      <Badge variant="outline">
                        {case_.case_type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(case_.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
          </Card>
        ))}
        
        {cases.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transferred cases</h3>
              <p className="text-gray-500">
                No cases have been transferred to admin yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};