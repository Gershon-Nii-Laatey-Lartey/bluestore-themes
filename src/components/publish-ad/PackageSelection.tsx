
import { useState, useEffect } from "react";
import { AdPackage } from "@/types/adPackage";
import { PackageCard } from "./PackageCard";
import { usePaymentProcessor } from "./PaymentProcessor";
import { PackageInformation } from "./PackageInformation";
import { PublishButton } from "./PublishButton";
import { packageService } from "@/services/packageService";
import { useToast } from "@/hooks/use-toast";

interface PackageSelectionProps {
  selectedPackage: string;
  onSelectPackage: (packageId: string) => void;
  onPublishNow: (packageId: string) => void;
  userActiveAds?: number;
  freeAdsCount?: number;
  hasActiveSubscription?: boolean;
}

export const PackageSelection = ({ 
  selectedPackage, 
  onSelectPackage,
  onPublishNow,
  userActiveAds = 0,
  freeAdsCount = 0,
  hasActiveSubscription = false
}: PackageSelectionProps) => {
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const { processPayment, processingPayment } = usePaymentProcessor({ onPublishNow });
  const { toast } = useToast();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublishWithSelectedPackage = async () => {
    const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
    if (!selectedPkg) return;

    await processPayment(selectedPkg);
  };

  const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
  const isFreePackage = selectedPkg?.price === 0;
  const isFreeLimitReached = isFreePackage && freeAdsCount >= (selectedPkg?.adsAllowed || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            isSelected={selectedPackage === pkg.id}
            onSelectPackage={onSelectPackage}
            freeAdsCount={freeAdsCount}
          />
        ))}
      </div>

      <PublishButton
        formData={{}}
        selectedPackage={selectedPkg}
        isDisabled={false}
        isFreeLimitReached={isFreeLimitReached}
        processingPayment={processingPayment}
        onPublishSuccess={() => {}}
        onPublish={handlePublishWithSelectedPackage}
      />

      <PackageInformation hasActiveSubscription={hasActiveSubscription} />
    </div>
  );
};
