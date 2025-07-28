import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Headphones, 
  Package, 
  MessageSquare, 
  FileCheck, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Activity
} from "lucide-react";
import { CSWorker, CSWorkAssignment, CSChatQueue, csService } from "@/services/csService";

const CSWorkerDashboard = () => {
  const [currentWorker, setCurrentWorker] = useState<CSWorker | null>(null);
  const [assignments, setAssignments] = useState<CSWorkAssignment[]>([]);
  const [chatQueue, setChatQueue] = useState<CSChatQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    startWorkerSession();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const worker = await csService.getCurrentCSWorker();
      setCurrentWorker(worker);

      if (worker) {
        const [workerAssignments, queue] = await Promise.all([
          csService.getWorkerAssignments(worker.id),
          csService.getChatQueue()
        ]);

        setAssignments(workerAssignments);
        setChatQueue(queue.filter(chat => 
          chat.cs_worker_id === worker.id || chat.status === 'pending'
        ));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startWorkerSession = async () => {
    try {
      const worker = await csService.getCurrentCSWorker();
      if (worker) {
        await csService.startWorkerSession(worker.id);
      }
    } catch (error) {
      console.error('Error starting worker session:', error);
    }
  };

  const handleAssignmentStatusUpdate = async (assignmentId: string, status: string, notes?: string) => {
    try {
      // Cast string to proper status type
      const validStatus = status as 'assigned' | 'in_progress' | 'completed' | 'escalated';
      await csService.updateAssignmentStatus(assignmentId, validStatus, notes);
      toast({
        title: "Assignment Updated",
        description: "Assignment status has been updated"
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive"
      });
    }
  };

  const getAssignmentIcon = (workType: string) => {
    switch (workType) {
      case 'product_review': return <Package className="h-4 w-4" />;
      case 'customer_chat': return <MessageSquare className="h-4 w-4" />;
      case 'complaint': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileCheck className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasRole = (role: string) => {
    return currentWorker?.roles?.some(r => r.role === role) || false;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!currentWorker) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You are not authorized as a CS worker.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CS Worker Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {currentWorker.full_name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-sm">
                <Activity className="h-3 w-3 mr-1" />
                Online
              </Badge>
              <div className="flex flex-wrap gap-1">
                {currentWorker.roles?.map((role) => (
                  <Badge key={role.id} variant="outline" className="text-xs">
                    {role.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assigned Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignments.filter(a => a.status === 'assigned').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignments.filter(a => a.status === 'in_progress').length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignments.filter(a => a.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chat Queue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {chatQueue.filter(c => c.status === 'pending').length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">My Assignments</TabsTrigger>
            {hasRole('customer_service_chat') && (
              <TabsTrigger value="chats">Chat Queue</TabsTrigger>
            )}
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Current Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getAssignmentIcon(assignment.work_type)}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {assignment.work_type.replace('_', ' ').toUpperCase()}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(assignment.status)} variant="secondary">
                          {assignment.status}
                        </Badge>
                      </div>
                      
                      {assignment.notes && (
                        <p className="text-sm text-gray-600 mb-3">{assignment.notes}</p>
                      )}
                      
                      <div className="flex space-x-2">
                        {assignment.status === 'assigned' && (
                          <Button 
                            size="sm"
                            onClick={() => handleAssignmentStatusUpdate(assignment.id, 'in_progress')}
                          >
                            Start Working
                          </Button>
                        )}
                        {assignment.status === 'in_progress' && (
                          <Button 
                            size="sm"
                            onClick={() => handleAssignmentStatusUpdate(assignment.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {assignments.length === 0 && (
                    <div className="text-center py-8">
                      <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments</h3>
                      <p className="text-gray-600">You don't have any assignments right now.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {hasRole('customer_service_chat') && (
            <TabsContent value="chats">
              <Card>
                <CardHeader>
                  <CardTitle>Chat Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chatQueue.map((chat) => (
                      <div key={chat.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {chat.customer_name || 'Anonymous Customer'}
                            </h4>
                            <p className="text-sm text-gray-600">{chat.customer_email}</p>
                          </div>
                          <Badge variant="secondary">Priority {chat.priority}</Badge>
                        </div>
                        
                        {chat.initial_message && (
                          <p className="text-sm text-gray-600 mb-3">"{chat.initial_message}"</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(chat.created_at).toLocaleString()}
                          </span>
                          {chat.status === 'pending' && (
                            <Button size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Take Chat
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {chatQueue.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Chats</h3>
                        <p className="text-gray-600">No customers are waiting for chat support.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {assignments.filter(a => a.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600">Tasks Completed</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((assignments.filter(a => a.status === 'completed').length / Math.max(assignments.length, 1)) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {assignments.filter(a => a.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-gray-600">Active Tasks</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CSWorkerDashboard;
