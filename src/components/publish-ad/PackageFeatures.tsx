
import { Badge } from "@/components/ui/badge";
import { Check, BarChart, Star, Clock, Shield, RotateCcw } from "lucide-react";

interface PackageFeaturesProps {
  packageId: string;
  isSelected: boolean;
}

export const PackageFeatures = ({ packageId, isSelected }: PackageFeaturesProps) => {
  const getPackageFeatures = (id: string) => {
    const features = {
      free: [
        { name: "Basic listing", icon: Check, enabled: true },
        { name: "7-day duration", icon: Clock, enabled: true },
        { name: "No analytics", icon: BarChart, enabled: false },
        { name: "No priority", icon: Star, enabled: false }
      ],
      starter: [
        { name: "Priority boost +1", icon: Star, enabled: true },
        { name: "7-day duration", icon: Clock, enabled: true },
        { name: "Basic listing", icon: Check, enabled: true },
        { name: "No analytics", icon: BarChart, enabled: false }
      ],
      standard: [
        { name: "Priority boost +2", icon: Star, enabled: true },
        { name: "Basic analytics", icon: BarChart, enabled: true },
        { name: "Featured in category", icon: Star, enabled: true },
        { name: "30-day duration", icon: Clock, enabled: true }
      ],
      boost: [
        { name: "Priority boost +3", icon: Star, enabled: true },
        { name: "Basic analytics", icon: BarChart, enabled: true },
        { name: "Featured in search", icon: Star, enabled: true },
        { name: "14-day duration", icon: Clock, enabled: true }
      ],
      pro: [
        { name: "Priority boost +4", icon: Star, enabled: true },
        { name: "Advanced analytics", icon: BarChart, enabled: true },
        { name: "Highlighted listing", icon: Star, enabled: true },
        { name: "1 urgent tag", icon: Clock, enabled: true }
      ],
      business: [
        { name: "Priority boost +5", icon: Star, enabled: true },
        { name: "Advanced analytics", icon: BarChart, enabled: true },
        { name: "Business badge", icon: Shield, enabled: true },
        { name: "5 urgent tags", icon: Clock, enabled: true }
      ],
      premium: [
        { name: "Priority boost +6", icon: Star, enabled: true },
        { name: "Premium analytics", icon: BarChart, enabled: true },
        { name: "Homepage featured", icon: Star, enabled: true },
        { name: "Unlimited urgent tags", icon: Clock, enabled: true },
        { name: "Auto-renewal", icon: RotateCcw, enabled: true }
      ]
    };

    return features[id as keyof typeof features] || features.free;
  };

  const features = getPackageFeatures(packageId);

  return (
    <div className="space-y-2">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <div key={index} className="flex items-center gap-2">
            <IconComponent 
              className={`h-3 w-3 ${
                feature.enabled 
                  ? 'text-green-600' 
                  : 'text-gray-400'
              }`} 
            />
            <span className={`text-xs ${
              feature.enabled 
                ? 'text-gray-700' 
                : 'text-gray-400 line-through'
            }`}>
              {feature.name}
            </span>
            {feature.enabled && isSelected && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                ✓
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
};
