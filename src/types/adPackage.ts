
import { Star, TrendingUp, Shield, Gift, Zap } from "lucide-react";

export interface AdPackage {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  bestFor: string;
  color: string;
  icon: React.ComponentType<any>;
  recommended?: boolean;
  popular?: boolean;
  adsAllowed?: number | null; // null means unlimited
}

export const adPackages: AdPackage[] = [
  {
    id: "free",
    name: "Free Package",
    price: 0,
    duration: "7 Days",
    features: [
      "5 Ads maximum",
      "Basic placement",
      "Email support",
      "7 days duration per ad"
    ],
    bestFor: "Testing the platform or occasional sellers",
    color: "border-gray-400",
    icon: Gift,
    adsAllowed: 5
  },
  {
    id: "starter",
    name: "Starter Plan",
    price: 15,
    duration: "1 Week",
    features: [
      "1 Ad only",
      "Priority placement (appears before free ads)",
      "Email support",
      "7 days duration per ad"
    ],
    bestFor: "New users wanting to test premium placement",
    color: "border-blue-400",
    icon: Star,
    adsAllowed: 1
  },
  {
    id: "standard",
    name: "Standard Plan",
    price: 30,
    duration: "1 Month",
    features: [
      "1 Ad only",
      "Promoted in category listings",
      "Light analytics (views count)",
      "Priority support",
      "30 days duration per ad"
    ],
    bestFor: "Regular sellers wanting longer exposure for single premium ad",
    color: "border-purple-400",
    icon: TrendingUp,
    adsAllowed: 1
  },
  {
    id: "boost",
    name: "Boost Plan",
    price: 50,
    duration: "1 Month",
    features: [
      "10 Ads",
      "Higher ranking than Standard Plan",
      "Priority support",
      "Enhanced visibility in search results",
      "Featured in category sections",
      "30 days duration per ad"
    ],
    bestFor: "Active sellers who want multiple premium ads with enhanced visibility",
    color: "border-green-400",
    icon: Zap,
    recommended: true,
    adsAllowed: 10
  },
  {
    id: "pro",
    name: "Pro Seller Plan",
    price: 120,
    duration: "1 Month",
    features: [
      "50 Ads",
      "Top search ranking",
      "Highlighted listings",
      "One 'Urgent' tag per ad",
      "Ad performance dashboard",
      "Priority support"
    ],
    bestFor: "Active sellers who want reach and conversion tracking",
    color: "border-yellow-400",
    icon: Shield,
    adsAllowed: 50
  },
  {
    id: "business",
    name: "Business Plan",
    price: 250,
    duration: "3 Months",
    features: [
      "100 Ads",
      "Verified Business Badge",
      "Storefront URL",
      "Customer reviews section",
      "Priority customer support",
      "Advanced analytics"
    ],
    bestFor: "Established vendors building a trusted brand",
    color: "border-indigo-400",
    icon: Shield,
    adsAllowed: 100
  },
  {
    id: "premium",
    name: "Premium Brand Plan",
    price: 500,
    duration: "5 Months",
    features: [
      "Unlimited Ads",
      "Premium Verification Badge ✅",
      "Ads featured across homepage and top banners",
      "Weekly performance insights",
      "Auto-renewing ads",
      "Dedicated account manager",
      "24/7 Priority support"
    ],
    bestFor: "Top-tier brands dominating the marketplace",
    color: "border-red-400",
    icon: Shield,
    adsAllowed: null // unlimited
  }
];
