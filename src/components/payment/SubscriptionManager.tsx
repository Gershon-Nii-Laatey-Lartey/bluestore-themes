
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Calendar, AlertTriangle, Package } from "lucide-react";
import { paymentService } from "@/services/paymentService";
import { useAuth } from "@/hooks/useAuth";
import { Subscription } from "@/types/payment";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { adPackages } from "@/types/adPackage";

export const SubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadSubscriptions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Loading subscriptions for user:', user.id);
      
      // Get user plan subscriptions with better error handling
      const { data, error } = await supabase
        .from('user_plan_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading subscriptions:', error);
        throw error;
      }
      
      console.log('Loaded subscriptions:', data);
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load subscriptions. Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [user]);

  // Get the correct ads allowed from adPackages configuration
  const getCorrectAdsAllowed = (planType: string) => {
    const packageConfig = adPackages.find(pkg => pkg.id === planType);
    return packageConfig?.adsAllowed || null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysElapsed = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const getTotalDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateDaysProgress = (startDate: string, endDate: string) => {
    const daysElapsed = getDaysElapsed(startDate);
    const totalDays = getTotalDuration(startDate, endDate);
    
    if (totalDays <= 0) return 0;
    return Math.min(100, (daysElapsed / totalDays) * 100);
  };

  const getPlanDisplayName = (planType: string) => {
    const planNames: Record<string, string> = {
      'starter': 'Starter Plan',
      'standard': 'Standard Plan', 
      'rising': 'Rising Seller Plan',
      'pro': 'Pro Seller Plan',
      'business': 'Business Plan',
      'premium': 'Premium Brand Plan',
    };
    return planNames[planType] || planType.charAt(0).toUpperCase() + planType.slice(1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            My Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          My Subscriptions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active subscriptions</p>
            <p className="text-sm">Upgrade to a paid plan to get more features</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => {
              const daysLeft = getDaysUntilExpiry(subscription.end_date);
              const daysElapsed = getDaysElapsed(subscription.start_date);
              const totalDays = getTotalDuration(subscription.start_date, subscription.end_date);
              const isExpiringSoon = daysLeft <= 3 && daysLeft > 0;
              const daysProgress = calculateDaysProgress(subscription.start_date, subscription.end_date);
              
              // Use the correct ads allowed from package configuration
              const correctAdsAllowed = getCorrectAdsAllowed(subscription.plan_type);
              const adsProgress = correctAdsAllowed ? (subscription.ads_used / correctAdsAllowed) * 100 : 0;
              
              return (
                <div
                  key={subscription.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Crown className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {getPlanDisplayName(subscription.plan_type)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Started {formatDate(subscription.start_date)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </div>

                  {/* Progress Bars Section */}
                  <div className="space-y-4 mb-4">
                    {/* Days Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          Days Progress
                        </div>
                        <span className={`text-sm px-2 py-1 rounded ${
                          isExpiringSoon ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          Day {daysElapsed} of {totalDays}
                        </span>
                      </div>
                      <Progress 
                        value={daysProgress} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Started</span>
                        <span>{daysLeft} days remaining</span>
                      </div>
                    </div>

                    {/* Ads Usage Progress */}
                    {correctAdsAllowed !== null ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Package className="h-4 w-4 text-gray-600" />
                            Ads Usage
                          </div>
                          <span className="text-sm text-gray-600">
                            {subscription.ads_used} / {correctAdsAllowed} used
                          </span>
                        </div>
                        <Progress 
                          value={adsProgress} 
                          className="h-2"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                          <Package className="h-4 w-4" />
                          Unlimited Ads Available
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      Expires on {formatDate(subscription.end_date)}
                    </div>
                  </div>

                  {isExpiringSoon && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      Your subscription expires soon. Consider renewing to continue enjoying premium features.
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Payment via Paystack
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Non-renewable subscription
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
