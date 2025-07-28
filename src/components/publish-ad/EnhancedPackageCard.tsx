
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Gift, AlertCircle, RotateCcw, Star, Zap } from "lucide-react";
import { AdPackage } from "@/types/adPackage";
import { PackageFeatures } from "./PackageFeatures";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExpiredFreeAd {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface EnhancedPackageCardProps {
  pkg: AdPackage;
  isSelected: boolean;
  onSelectPackage: (packageId: string) => void;
  freeAdsCount: number;
  showFeatures?: boolean;
}

export const EnhancedPackageCard = ({
  pkg,
  isSelected,
  onSelectPackage,
  freeAdsCount,
  showFeatures = true
}: EnhancedPackageCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expiredFreeAds, setExpiredFreeAds] = useState<ExpiredFreeAd[]>([]);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const IconComponent = pkg.icon;
  const isFree = pkg.price === 0;
  const isLimitReached = isFree && freeAdsCount >= (pkg.adsAllowed || 0);

  useEffect(() => {
    if (isFree && user) {
      fetchExpiredFreeAds();
    }
  }, [isFree, user]);

  const fetchExpiredFreeAds = async () => {
    try {
      const { data: expiredAds, error } = await supabase
        .from('product_submissions')
        .select('id, title, status, created_at')
        .eq('user_id', user?.id)
        .eq('status', 'expired')
        .or('package->>id.eq.free,package.is.null')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setExpiredFreeAds(expiredAds || []);
    } catch (error) {
      console.error('Error fetching expired ads:', error);
    }
  };

  const handleRenewAd = async (adId: string) => {
    if (freeAdsCount >= (pkg.adsAllowed || 5)) {
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
          description: "Ad renewed successfully! It will be reviewed and published again."
        });
        fetchExpiredFreeAds();
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

  const formatPrice = (price: number) => {
    if (price === 0) return "FREE";
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const progressPercentage = isFree && pkg.adsAllowed 
    ? (freeAdsCount / pkg.adsAllowed) * 100 
    : 0;

  return (
    <Card className={`relative cursor-pointer transition-all duration-200 ${
      isSelected 
        ? `${pkg.color} shadow-lg scale-105` 
        : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
    } ${isLimitReached ? 'opacity-60' : ''}`} 
    onClick={() => !isLimitReached && onSelectPackage(pkg.id)}>
      
      {/* Package badges */}
      {pkg.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
          Recommended
        </div>
      )}
      {pkg.popular && (
        <div className="absolute -top-3 right-4 bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
          Popular
        </div>
      )}
      {isFree && (
        <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
          <Gift className="h-3 w-3" />
          Free
        </div>
      )}
      {pkg.price > 0 && (
        <div className="absolute -top-3 right-4 bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Premium
        </div>
      )}
      
      <CardHeader className="text-center">
        <div className="mx-auto mb-2">
          <IconComponent className={`h-8 w-8 ${isFree ? 'text-green-600' : 'text-blue-600'}`} />
        </div>
        <CardTitle className="text-lg">{pkg.name}</CardTitle>
        <div className="text-center">
          <span className={`text-2xl md:text-3xl font-bold ${isFree ? 'text-green-600' : 'text-gray-900'}`}>
            {formatPrice(pkg.price)}
          </span>
          <p className="text-sm text-gray-500 mt-1">{pkg.duration}</p>
        </div>
        {isLimitReached && (
          <p className="text-xs text-red-600 mt-2">
            Free limit reached ({freeAdsCount}/{pkg.adsAllowed} ads used)
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Free ads progress section */}
        {isFree && (
          <div className="space-y-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">Active Free Ads</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                {freeAdsCount} / {pkg.adsAllowed || 5}
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-green-600">
              <span>{pkg.adsAllowed || 5} ads limit</span>
            </div>
            
            {freeAdsCount >= (pkg.adsAllowed || 5) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-3 w-3 text-yellow-600 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    Free ad limit reached. Wait for ads to expire or upgrade to continue.
                  </p>
                </div>
              </div>
            )}

            {expiredFreeAds.length > 0 && (
              <div className="pt-2 border-t border-green-200">
                <h4 className="text-xs font-medium text-green-700 mb-2">
                  Expired Ads ({expiredFreeAds.length})
                </h4>
                <div className="space-y-1">
                  {expiredFreeAds.slice(0, 2).map(ad => (
                    <div key={ad.id} className="flex items-center justify-between bg-white rounded p-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {ad.title}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenewAd(ad.id);
                        }}
                        disabled={renewingId === ad.id || freeAdsCount >= (pkg.adsAllowed || 5)}
                        className="text-green-600 hover:text-green-700 border-green-300 h-6 px-2 text-xs"
                      >
                        {renewingId === ad.id ? (
                          <>
                            <div className="animate-spin rounded-full h-2 w-2 border-b border-green-600 mr-1"></div>
                            Renewing...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-2 w-2 mr-1" />
                            Renew
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Package features */}
        {showFeatures && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Package Features</h4>
            <PackageFeatures packageId={pkg.id} isSelected={isSelected} />
          </div>
        )}

        {/* Legacy features list for comparison */}
        <ul className="space-y-2">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-600">
            <strong>Best for:</strong> {pkg.bestFor}
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className={`w-full ${
            isSelected 
              ? isFree 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`} 
          variant={isSelected ? 'default' : 'outline'} 
          disabled={isLimitReached}
          onClick={(e) => {
            e.stopPropagation();
            if (!isLimitReached) {
              onSelectPackage(pkg.id);
            }
          }}
        >
          {isLimitReached ? 'Limit Reached' : isSelected ? 'Selected' : 'Select Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
};
