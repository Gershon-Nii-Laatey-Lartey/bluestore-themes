import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Wallet,
  Eye
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PaymentStats {
  totalRevenue: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  recentPayments: any[];
  monthlyRevenue: any[];
  packageBreakdown: any[];
}

export const EnhancedPaymentAnalytics = () => {
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    recentPayments: [],
    monthlyRevenue: [],
    packageBreakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    loadPaymentStats();
  }, [selectedPeriod]);

  const loadPaymentStats = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Fetch payment data
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          user_plan_subscriptions(plan_name, plan_type)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate stats
      const totalRevenue = payments
        ?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount / 100), 0) || 0;
      
      const successfulPayments = payments?.filter(p => p.status === 'completed').length || 0;
      const failedPayments = payments?.filter(p => p.status === 'failed').length || 0;
      const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;
      
      // Package breakdown
      const packageBreakdown = payments
        ?.filter(p => p.status === 'completed')
        .reduce((acc: any[], payment: any) => {
          const planType = payment.user_plan_subscriptions?.plan_type || 'unknown';
          const existing = acc.find(item => item.package === planType);
          if (existing) {
            existing.count += 1;
            existing.revenue += payment.amount / 100;
          } else {
            acc.push({
              package: planType,
              count: 1,
              revenue: payment.amount / 100
            });
          }
          return acc;
        }, []) || [];

      setStats({
        totalRevenue,
        totalPayments: payments?.length || 0,
        successfulPayments,
        failedPayments,
        pendingPayments,
        recentPayments: payments?.slice(0, 10) || [],
        monthlyRevenue: [],
        packageBreakdown
      });
    } catch (error) {
      console.error('Error loading payment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const successRate = stats.totalPayments > 0 
    ? (stats.successfulPayments / stats.totalPayments) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Analytics</h2>
          <p className="text-gray-600">Monitor payment performance and revenue trends</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              GHS {stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              From {stats.successfulPayments} successful payments
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
            <p className="text-xs text-gray-600 mt-1">
              Across all payment methods
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {successRate.toFixed(1)}%
            </div>
            <Progress value={successRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <Wallet className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              GHS {stats.successfulPayments > 0 ? (stats.totalRevenue / stats.successfulPayments).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Per successful payment
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packages">Package Breakdown</TabsTrigger>
          <TabsTrigger value="recent">Recent Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Successful</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{stats.successfulPayments}</div>
                <div className="text-sm text-green-600">
                  GHS {stats.totalRevenue.toFixed(2)} total
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">{stats.failedPayments}</div>
                <div className="text-sm text-red-600">
                  {stats.totalPayments > 0 ? ((stats.failedPayments / stats.totalPayments) * 100).toFixed(1) : 0}% of total
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-800">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">{stats.pendingPayments}</div>
                <div className="text-sm text-yellow-600">
                  Awaiting completion
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue by Package
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.packageBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {stats.packageBreakdown.map((pkg, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold capitalize">{pkg.package} Package</h4>
                        <p className="text-sm text-gray-600">{pkg.count} subscriptions</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          GHS {pkg.revenue.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Avg: GHS {(pkg.revenue / pkg.count).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No package data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentPayments.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payment.status)}
                        <div>
                          <p className="font-medium">GHS {(payment.amount / 100).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">
                            {payment.user_plan_subscriptions?.plan_name || 'Unknown Plan'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent payments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
