
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, RotateCcw, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FreeAd {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export const FreeAdsProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [freeAds, setFreeAds] = useState<FreeAd[]>([]);
  const [expiredFreeAds, setExpiredFreeAds] = useState<FreeAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchFreeAds();
    }
  }, [user]);

  const fetchFreeAds = async () => {
    try {
      setLoading(true);
      
      // Fetch all free ads for the user - fix the JSON query syntax
      const { data: allFreeAds, error } = await supabase
        .from('product_submissions')
        .select('id, title, status, created_at')
        .eq('user_id', user?.id)
        .or('package->>id.eq.free,package.is.null')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const active = allFreeAds?.filter(ad => ad.status === 'approved' || ad.status === 'pending') || [];
      const expired = allFreeAds?.filter(ad => ad.status === 'expired') || [];
      
      setFreeAds(active);
      setExpiredFreeAds(expired);
    } catch (error) {
      console.error('Error fetching free ads:', error);
      toast({
        title: "Error",
        description: "Failed to load free ads information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRenewAd = async (adId: string) => {
    if (freeAds.length >= 5) {
      toast({
        title: "Limit Reached",
        description: "You already have 5 active free ads. Please wait for some to expire or close existing ones.",
        variant: "destructive"
      });
      return;
    }

    try {
      setRenewingId(adId);
      
      const { data, error } = await supabase.rpc('renew_free_ad', {
        ad_id: adId,
        user_uuid: user?.id
      });

      if (error) throw error;
      
      if (data) {
        toast({
          title: "Success",
          description: "Ad renewed successfully! It will be reviewed and published again.",
        });
        fetchFreeAds(); // Refresh the data
      } else {
        toast({
          title: "Unable to Renew",
          description: "Could not renew this ad. You may have reached your free ad limit.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error renewing ad:', error);
      toast({
        title: "Error",
        description: "Failed to renew ad",
        variant: "destructive"
      });
    } finally {
      setRenewingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="text-center text-gray-500">Loading free ads information...</div>
        </CardContent>
      </Card>
    );
  }

  const activeCount = freeAds.length;
  const freeLimit = 5;
  const progressPercentage = (activeCount / freeLimit) * 100;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-green-600" />
          Free Ads Usage
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {activeCount} / {freeLimit} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Free Ads</span>
            <span className="text-sm text-gray-600">
              {freeLimit - activeCount} slots remaining
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0 ads</span>
            <span>{freeLimit} ads limit</span>
          </div>
        </div>

        {activeCount >= freeLimit && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Free Ad Limit Reached</p>
                <p className="text-yellow-700">
                  You have reached your limit of {freeLimit} free ads. Wait for some to expire or consider upgrading to a paid plan.
                </p>
              </div>
            </div>
          </div>
        )}

        {expiredFreeAds.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Expired Free Ads ({expiredFreeAds.length})
            </h4>
            <div className="space-y-2">
              {expiredFreeAds.slice(0, 3).map((ad) => (
                <div key={ad.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ad.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expired on {new Date(ad.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRenewAd(ad.id)}
                    disabled={renewingId === ad.id || activeCount >= freeLimit}
                    className="text-green-600 hover:text-green-700 border-green-300"
                  >
                    {renewingId === ad.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                        Renewing...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Renew
                      </>
                    )}
                  </Button>
                </div>
              ))}
              {expiredFreeAds.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  +{expiredFreeAds.length - 3} more expired ads
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Free ads expire after 7 days</strong> but can be renewed if you have available slots.
            Upgrade to a paid plan for longer durations and more ads.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
