import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Gift, AlertCircle, RotateCcw } from "lucide-react";
import { AdPackage } from "@/types/adPackage";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExpiredFreeAd {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface PackageCardProps {
  pkg: AdPackage;
  isSelected: boolean;
  onSelectPackage: (packageId: string) => void;
  freeAdsCount: number;
}

export const PackageCard = ({
  pkg,
  isSelected,
  onSelectPackage,
  freeAdsCount
}: PackageCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
    if (price === 0) return 'Free';
    return `GHS ${price.toFixed(2)}`;
  };

  const handlePackageSelect = () => {
    onSelectPackage(pkg.id);
    
    // On mobile, scroll to publish button
    if (isMobile) {
      setTimeout(() => {
        const publishButton = document.getElementById('publish-button');
        if (publishButton) {
          publishButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  if (isMobile) {
    // Mobile layout - smaller, rectangular cards
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-blue-500 bg-blue-50' 
            : 'hover:shadow-md'
        }`}
        onClick={handlePackageSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={`p-2 rounded-lg ${
                isSelected ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <IconComponent className={`h-5 w-5 ${
                  isSelected ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm ${
                isSelected ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {pkg.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {pkg.adsAllowed} ads • {pkg.duration} days
              </p>
            </div>
            <div className="text-right">
              <div className={`font-bold text-sm ${
                isSelected ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {formatPrice(pkg.price)}
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-blue-600 mt-1" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop layout - original design
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:shadow-lg'
      }`}
      onClick={handlePackageSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              isSelected ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <IconComponent className={`h-6 w-6 ${
                isSelected ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
            <div>
              <CardTitle className={`text-lg ${
                isSelected ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {pkg.name}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {pkg.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              isSelected ? 'text-blue-600' : 'text-gray-900'
            }`}>
              {formatPrice(pkg.price)}
            </div>
            {isSelected && (
              <Badge className="bg-blue-600 text-white mt-2">
                Selected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Ads Allowed:</span>
            <span className="font-semibold">{pkg.adsAllowed}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Duration:</span>
            <span className="font-semibold">{pkg.duration} days</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Features:</span>
            <span className="font-semibold">{pkg.features?.length || 0}</span>
          </div>
        </div>

        {pkg.features && pkg.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Features:</h4>
            <ul className="space-y-1">
              {pkg.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isFree && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Free Ads Used:</span>
              <span className="text-sm font-semibold">
                {freeAdsCount}/{pkg.adsAllowed}
              </span>
            </div>
            <Progress 
              value={(freeAdsCount / (pkg.adsAllowed || 1)) * 100} 
              className="h-2"
            />
            
            {isLimitReached && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  You've reached your free ad limit
                </span>
              </div>
            )}

            {expiredFreeAds.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">Expired Ads:</h4>
                <div className="space-y-2">
                  {expiredFreeAds.map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600 truncate flex-1">
                        {ad.title}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenewAd(ad.id);
                        }}
                        disabled={renewingId === ad.id}
                        className="ml-2"
                      >
                        {renewingId === ad.id ? (
                          <RotateCcw className="h-3 w-3 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};