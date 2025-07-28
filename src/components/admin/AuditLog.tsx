import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Search, Filter, User, FileText, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  user_id?: string;
  cs_worker_id?: string;
  action_type: string;
  action_description: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  profiles?: { full_name?: string; email?: string };
  cs_workers?: { full_name?: string; email?: string };
}

export const AuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Fetch profile data separately
      const logsWithProfiles = await Promise.all((data || []).map(async (log) => {
        let profiles = null;
        let cs_workers = null;
        
        if (log.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', log.user_id)
            .maybeSingle();
          profiles = profileData;
        }
        
        if (log.cs_worker_id) {
          const { data: workerData } = await supabase
            .from('cs_workers')
            .select('full_name, email')
            .eq('id', log.cs_worker_id)
            .maybeSingle();
          cs_workers = workerData;
        }
        
        return { ...log, profiles, cs_workers };
      }));
      
      setLogs(logsWithProfiles);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'CS_WORKER_CREATED':
      case 'CS_WORKER_STATUS_CHANGE':
        return <User className="h-4 w-4" />;
      case 'PRODUCT_REVIEW':
      case 'KYC_REVIEW':
        return <FileText className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'CS_WORKER_CREATED':
        return 'bg-green-100 text-green-800';
      case 'CS_WORKER_STATUS_CHANGE':
        return 'bg-blue-100 text-blue-800';
      case 'PRODUCT_REVIEW':
        return 'bg-purple-100 text-purple-800';
      case 'KYC_REVIEW':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.action_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.cs_workers?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.cs_workers?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActionType = actionTypeFilter === "" || actionTypeFilter === "all" || log.action_type === actionTypeFilter;
    
    return matchesSearch && matchesActionType;
  });

  const uniqueActionTypes = [...new Set(logs.map(log => log.action_type))];

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
          <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
          <p className="text-gray-600">Track all system activities and changes</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActionTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {getActionIcon(log.action_type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getActionColor(log.action_type)} variant="secondary">
                        {log.action_type.replace(/_/g, ' ')}
                      </Badge>
                      {log.entity_type && (
                        <Badge variant="outline">
                          {log.entity_type.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  
                  <p className="text-gray-900 mb-2">{log.action_description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    {(log.profiles?.full_name || log.cs_workers?.full_name) && (
                      <span className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>
                          {log.profiles?.full_name || log.cs_workers?.full_name}
                          {(log.profiles?.email || log.cs_workers?.email) && 
                            ` (${log.profiles?.email || log.cs_workers?.email})`
                          }
                        </span>
                      </span>
                    )}
                    
                    {log.ip_address && (
                      <span>IP: {log.ip_address}</span>
                    )}
                  </div>
                  
                  {(log.old_values || log.new_values) && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {log.old_values && (
                          <div>
                            <span className="font-medium text-gray-700">Before:</span>
                            <pre className="mt-1 text-xs text-gray-600 overflow-x-auto">
                              {JSON.stringify(log.old_values, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.new_values && (
                          <div>
                            <span className="font-medium text-gray-700">After:</span>
                            <pre className="mt-1 text-xs text-gray-600 overflow-x-auto">
                              {JSON.stringify(log.new_values, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredLogs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Audit Logs</h3>
              <p className="text-gray-600">
                {searchTerm || actionTypeFilter 
                  ? "No logs match your current filters."
                  : "No audit logs have been recorded yet."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};