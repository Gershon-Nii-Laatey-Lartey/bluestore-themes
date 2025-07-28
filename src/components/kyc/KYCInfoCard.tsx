
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const KYCInfoCard = () => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 text-blue-600">
          <Shield className="h-8 w-8" />
          <div>
            <h3 className="font-semibold">Why verify your account?</h3>
            <p className="text-sm text-gray-600">Verified sellers get more trust from customers and access to premium features.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
