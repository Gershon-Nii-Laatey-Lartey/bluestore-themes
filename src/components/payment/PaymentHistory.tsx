import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Calendar, Package, RefreshCw } from "lucide-react";
import { paymentService } from "@/services/paymentService";
import { useAuth } from "@/hooks/useAuth";
import { PaymentHistory as PaymentHistoryType } from "@/types/payment";
import { useToast } from "@/hooks/use-toast";
import { usePaymentExpiration } from "@/hooks/usePaymentExpiration";

export const PaymentHistory = () => {
  const [payments, setPayments] = useState<PaymentHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize payment expiration service
  usePaymentExpiration();

  const loadPaymentHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const history = await paymentService.getPaymentHistory(user.id);
      setPayments(history || []);
    } catch (error) {
      console.error('Error loading payment history:', error);
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentHistory();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment History
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={loadPaymentHistory}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payment history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {formatAmount(payment.amount, payment.currency)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {payment.metadata?.plan_name || 'Ad Package Purchase'}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(payment.created_at)}
                  </div>
                  {payment.provider_reference && (
                    <span className="font-mono text-xs">
                      Ref: {payment.provider_reference.slice(-8)}
                    </span>
                  )}
                </div>

                {payment.subscriptions && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <p className="font-medium text-blue-900">Subscription Details</p>
                    <p className="text-blue-700">
                      Plan: {payment.subscriptions.plan_id} • 
                      Status: {payment.subscriptions.status}
                    </p>
                    <p className="text-blue-700">
                      Period: {formatDate(payment.subscriptions.current_period_start)} - {formatDate(payment.subscriptions.current_period_end)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
