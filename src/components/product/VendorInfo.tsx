
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface VendorInfoProps {
  vendorName: string;
  vendorId?: string;
}

export const VendorInfo = ({ vendorName, vendorId }: VendorInfoProps) => {
  if (!vendorName) {
    return null;
  }

  const content = (
    <Card className="mt-6">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3 text-gray-900 flex items-center justify-between">
          Seller Information
          {vendorId && (
            <ExternalLink className="h-4 w-4 text-gray-400" />
          )}
        </h3>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{vendorName}</p>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Verified Seller</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // If we have a vendor ID, make it clickable
  if (vendorId) {
    return (
      <Link to={`/vendor/${vendorId}`} className="block hover:shadow-md transition-shadow">
        {content}
      </Link>
    );
  }

  return content;
};
