
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Mail, Calendar, Shield, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { dataService } from "@/services/dataService";
import { useAdminSidebar } from "@/hooks/useAdminSidebar";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  avatar_url: string | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { collapsed } = useAdminSidebar();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch all users...');
      const data = await dataService.getAllUsers();
      console.log('Fetched users successfully:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-fade-in space-y-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={`animate-fade-in p-6 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="space-y-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage and view all registered users</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-sm">
                Total Users: {users.length}
              </Badge>
              <Button onClick={loadUsers} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>All Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.full_name || 'No name provided'}
                            </p>
                            <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{user.email || 'No email'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Regular User</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(user.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm">Check back later for registered users</p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
