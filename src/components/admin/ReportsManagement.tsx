import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Flag, 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  Eye, 
  CheckCircle, 
  X, 
  ArrowRight,
  User,
  Package,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface ProductReport {
  id: string;
  product_id: string;
  report_type: string;
  description: string;
  status: string;
  case_number: string;
  created_at: string;
  resolved_at?: string;
  reporter_id: string;
  product_submissions: {
    title: string;
    price: number;
    description: string;
    user_id: string;
  };
  profiles: {
    full_name: string;
    email: string;
  } | null;
  vendor_profiles: {
    business_name: string;
    email: string;
  } | null;
}

interface ReportStats {
  total: number;
  pending: number;
  under_review: number;
  resolved: number;
  dismissed: number;
  transferred: number;
}

export const ReportsManagement = () => {
  const [reports, setReports] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    pending: 0,
    under_review: 0,
    resolved: 0,
    dismissed: 0,
    transferred: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Fetch reports with product and user information
      const { data: reportsData, error: reportsError } = await supabase
        .from('product_reports')
        .select(`
          *,
          product_submissions (
            title,
            price,
            description,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Get unique user IDs from reports
      const userIds = [...new Set(reportsData?.map(r => r.reporter_id).filter(Boolean))];
      const productUserIds = [...new Set(reportsData?.map(r => r.product_submissions?.user_id).filter(Boolean))];

      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Fetch vendor profiles
      const { data: vendorProfilesData, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('user_id, business_name, email')
        .in('user_id', productUserIds);

      if (vendorError) throw vendorError;

      // Combine the data
      const combinedReports = reportsData?.map(report => {
        const profile = profilesData?.find(p => p.id === report.reporter_id);
        const vendorProfile = vendorProfilesData?.find(v => v.user_id === report.product_submissions?.user_id);
        
        return {
          ...report,
          profiles: profile || null,
          vendor_profiles: vendorProfile || null
        };
      }) || [];

      setReports(combinedReports);

      // Calculate stats
      const stats = {
        total: combinedReports.length,
        pending: combinedReports.filter(r => r.status === 'pending').length,
        under_review: combinedReports.filter(r => r.status === 'under_review').length,
        resolved: combinedReports.filter(r => r.status === 'resolved').length,
        dismissed: combinedReports.filter(r => r.status === 'dismissed').length,
        transferred: combinedReports.filter(r => r.status === 'transferred').length
      };
      setStats(stats);

    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('product_reports')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Report status updated to ${status.replace('_', ' ')}`
      });

      loadReports();
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive"
      });
    }
  };

  const transferToAdmin = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('product_reports')
        .update({ 
          status: 'transferred',
          case_number: `ADMIN-${Date.now()}`
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report transferred to admin"
      });

      loadReports();
    } catch (error) {
      console.error('Error transferring report:', error);
      toast({
        title: "Error",
        description: "Failed to transfer report",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      case 'transferred': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'fraud': return <AlertTriangle className="h-4 w-4" />;
      case 'inappropriate': return <Flag className="h-4 w-4" />;
      case 'spam': return <MessageSquare className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const reportDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filteredReports = reports.filter(report => 
    filterStatus === 'all' || report.status === filterStatus
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
      {/* Header and Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Product Reports</h3>
          <p className="text-sm text-gray-600">Manage user reports on products</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports ({stats.total})</SelectItem>
            <SelectItem value="pending">Pending ({stats.pending})</SelectItem>
            <SelectItem value="under_review">Under Review ({stats.under_review})</SelectItem>
            <SelectItem value="resolved">Resolved ({stats.resolved})</SelectItem>
            <SelectItem value="dismissed">Dismissed ({stats.dismissed})</SelectItem>
            <SelectItem value="transferred">Transferred ({stats.transferred})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flag className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-semibold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-lg font-semibold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Review</p>
                <p className="text-lg font-semibold">{stats.under_review}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-lg font-semibold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Dismissed</p>
                <p className="text-lg font-semibold">{stats.dismissed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Transferred</p>
                <p className="text-lg font-semibold">{stats.transferred}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex items-center space-x-2">
                    {getReportTypeIcon(report.report_type)}
                    <Flag className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {report.product_submissions?.title || 'Unknown Product'}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {report.report_type.replace('_', ' ')}
                      </Badge>
                      {report.case_number && (
                        <Badge variant="secondary">
                          {report.case_number}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">{formatDate(report.created_at)}</span>
                  <p className="text-xs text-gray-400">{getTimeAgo(report.created_at)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reporter Information */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {report.profiles?.full_name ? report.profiles.full_name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {report.profiles?.full_name || 'Anonymous User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {report.profiles?.email || 'No email provided'}
                  </p>
                </div>
                <User className="h-4 w-4 text-gray-400" />
              </div>

              {/* Product Information */}
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Product: {report.product_submissions?.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    Price: ${report.product_submissions?.price || 'N/A'} | 
                    Vendor: {report.vendor_profiles?.business_name || 'Unknown'}
                  </p>
                </div>
                <Link 
                  to={`/product/${report.product_id}`}
                  target="_blank"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Product</span>
                </Link>
              </div>

              {/* Report Description */}
              {report.description && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Report Details:</span> {report.description}
                  </p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {report.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateReportStatus(report.id, 'under_review')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => transferToAdmin(report.id)}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Transfer to Admin
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateReportStatus(report.id, 'dismissed')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Dismiss
                    </Button>
                  </>
                )}
                
                {report.status === 'under_review' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateReportStatus(report.id, 'resolved')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateReportStatus(report.id, 'dismissed')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Dismiss
                    </Button>
                  </>
                )}

                {(report.status === 'resolved' || report.status === 'dismissed') && (
                  <div className="text-sm text-gray-500">
                    {report.resolved_at && (
                      <span>Resolved on {formatDate(report.resolved_at)}</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};