
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, DollarSign, Users, BarChart3, Loader2 } from "lucide-react";
import { analyticsService, PaymentAnalytics as PaymentAnalyticsType } from "@/services/analyticsService";

export const PaymentAnalytics = () => {
  const [analytics, setAnalytics] = useState<PaymentAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getPaymentAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading payment analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">Failed to load payment analytics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalTransactions > 0 
                ? Math.round((analytics.successfulPayments / analytics.totalTransactions) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.averageTransactionValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Revenue by Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.revenueByPlan).map(([planId, revenue]) => (
              <div key={planId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {planId.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="font-semibold">
                  {formatCurrency(revenue)}
                </div>
              </div>
            ))}
            {Object.keys(analytics.revenueByPlan).length === 0 && (
              <p className="text-gray-500 text-center py-4">No revenue data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Transaction Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.transactionsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={status === 'succeeded' ? 'default' : status === 'failed' ? 'destructive' : 'secondary'}
                    className="capitalize"
                  >
                    {status}
                  </Badge>
                </div>
                <div className="font-semibold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Monthly Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.monthlyRevenue.slice(-6).map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  {formatMonth(month.month)}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    {month.transactions} transactions
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(month.revenue)}
                  </div>
                </div>
              </div>
            ))}
            {analytics.monthlyRevenue.length === 0 && (
              <p className="text-gray-500 text-center py-4">No monthly data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
