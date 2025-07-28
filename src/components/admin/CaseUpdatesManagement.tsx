import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Clock } from "lucide-react";

interface CaseUpdate {
  id: string;
  case_number: string;
  case_type: string;
  update_type: string;
  message: string;
  created_at: string;
}

export const CaseUpdatesManagement = () => {
  const [updates, setUpdates] = useState<CaseUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadCaseUpdates();
  }, []);

  const loadCaseUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('case_updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error loading case updates:', error);
      toast({
        title: "Error",
        description: "Failed to load case updates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getUpdateTypeColor = (updateType: string) => {
    switch (updateType) {
      case 'status_change': return 'bg-blue-100 text-blue-800';
      case 'note': return 'bg-gray-100 text-gray-800';
      case 'resolution': return 'bg-green-100 text-green-800';
      case 'escalation': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUpdates = updates.filter(update => 
    filterType === 'all' || update.update_type === filterType
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
          <h3 className="text-lg font-semibold">Case Updates</h3>
          <p className="text-sm text-gray-600">View all case updates and progress tracking</p>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Updates</SelectItem>
            <SelectItem value="status_change">Status Changes</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
            <SelectItem value="resolution">Resolutions</SelectItem>
            <SelectItem value="escalation">Escalations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredUpdates.map((update) => (
          <Card key={update.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Case {update.case_number}
                      <Badge variant="outline">
                        {update.case_type}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getUpdateTypeColor(update.update_type)}>
                        {update.update_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {new Date(update.created_at).toLocaleString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{update.message}</p>
            </CardContent>
          </Card>
        ))}
        
        {filteredUpdates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No case updates found</h3>
              <p className="text-gray-500">
                {filterType === 'all' 
                  ? "No case updates have been created yet."
                  : `No updates of type "${filterType.replace('_', ' ')}" found.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};