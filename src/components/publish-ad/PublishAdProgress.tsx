
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { adPackages } from "@/types/adPackage";

interface UserPlanSubscription {
  id: string;
  plan_name: string;
  plan_type: string;
  ads_used: number;
  ads_allowed: number | null;
  end_date: string;
  start_date: string;
  status: string;
}

export const PublishAdProgress = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserPlanSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActiveSubscription();
    }
  }, [user]);

  const fetchActiveSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_plan_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      } else if (data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get the correct ads allowed from adPackages configuration
  const getCorrectAdsAllowed = (planType: string) => {
    const packageConfig = adPackages.find(pkg => pkg.id === planType);
    return packageConfig?.adsAllowed || null;
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const calculateDaysElapsed = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays); // Start from day 1
  };

  const getTotalDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-gray-500">Loading subscription details...</div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const daysRemaining = calculateDaysRemaining(subscription.end_date);
  const daysElapsed = calculateDaysElapsed(subscription.start_date);
  const totalDays = getTotalDuration(subscription.start_date, subscription.end_date);
  
  // Progress from day 1 to total days
  const daysProgress = (daysElapsed / totalDays) * 100;
  
  // Use the correct ads allowed from package configuration
  const correctAdsAllowed = getCorrectAdsAllowed(subscription.plan_type);
  const adsUsed = subscription.ads_used;
  const adsAllowed = correctAdsAllowed || 1; // Handle null case
  const adsProgress = correctAdsAllowed ? (adsUsed / correctAdsAllowed) * 100 : 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Active Plan: {subscription.plan_name}
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Days Progress</span>
              </div>
              <Badge variant="outline" className="text-sm">
                Day {daysElapsed} of {totalDays}
              </Badge>
            </div>
            <Progress value={daysProgress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Day 1</span>
              <span>{daysRemaining} days remaining</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Ads Usage</span>
              </div>
              <Badge variant="outline" className="text-sm">
                {correctAdsAllowed === null 
                  ? 'Unlimited' 
                  : `${adsUsed} / ${correctAdsAllowed}`
                }
              </Badge>
            </div>
            {correctAdsAllowed !== null && (
              <>
                <Progress 
                  value={adsProgress} 
                  className="h-2" 
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0 used</span>
                  <span>{correctAdsAllowed} total</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Plan expires on: {new Date(subscription.end_date).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
