
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Users, CheckCircle, Clock, AlertTriangle, FileCheck } from "lucide-react";

interface AdminStatsProps {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedProducts: number;
  pendingKyc: number;
}

export const AdminStats = ({
  totalSubmissions,
  pendingSubmissions,
  approvedProducts,
  pendingKyc
}: AdminStatsProps) => {
  const stats = [
    {
      title: "Total Submissions",
      value: totalSubmissions,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Pending Review",
      value: pendingSubmissions,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Approved Products",
      value: approvedProducts,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pending KYC",
      value: pendingKyc,
      icon: FileCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs md:text-sm font-medium text-gray-600 truncate">
                  {stat.title}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.value > 0 && stat.title === "Pending Review" && (
                    <Badge variant="destructive" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
              </div>
              <div className={`p-2 md:p-3 rounded-lg ${stat.bgColor} shrink-0`}>
                <stat.icon className={`h-4 w-4 md:h-6 md:w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
