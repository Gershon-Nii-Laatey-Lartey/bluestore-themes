
import { AlertCircle, Gift, Crown } from "lucide-react";

interface PackageInformationProps {
  hasActiveSubscription?: boolean;
}

export const PackageInformation = ({ hasActiveSubscription = false }: PackageInformationProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-blue-800">Package Information</p>
          <p className="text-sm text-blue-700">
            Start with our free package to test the platform, then upgrade to paid plans for better visibility and advanced features.
            All paid plans include premium placement and detailed analytics.
          </p>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4 flex items-start space-x-3">
        <Gift className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-800">Free Package Benefits</p>
          <p className="text-sm text-green-700">
            Perfect for new users! Get 3 free ads per week to test our platform. 
            No payment required - just select and publish immediately.
          </p>
        </div>
      </div>

      {hasActiveSubscription && (
        <div className="bg-purple-50 rounded-lg p-4 flex items-start space-x-3">
          <Crown className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-purple-800">Active Subscription</p>
            <p className="text-sm text-purple-700">
              You have an active subscription! You can publish ads according to your plan limits.
              Check your subscription progress above for remaining ads and days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
