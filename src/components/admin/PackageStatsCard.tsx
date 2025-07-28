
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, TrendingUp } from "lucide-react";
import { ProductSubmission } from "@/services/dataService";

interface PackageStatsCardProps {
  pendingSubmissions: ProductSubmission[];
}

export const PackageStatsCard = ({ pendingSubmissions }: PackageStatsCardProps) => {
  const packageStats = pendingSubmissions.reduce((stats, submission) => {
    const packageId = submission.package?.id || 'no-package';
    const packageName = submission.package?.name || 'No Package';
    const packagePrice = submission.package?.price || 0;
    
    if (!stats[packageId]) {
      stats[packageId] = {
        name: packageName,
        count: 0,
        totalRevenue: 0,
        color: getPackageColor(packageId)
      };
    }
    
    stats[packageId].count++;
    stats[packageId].totalRevenue += packagePrice;
    
    return stats;
  }, {} as Record<string, { name: string; count: number; totalRevenue: number; color: string }>);

  function getPackageColor(packageId: string) {
    switch (packageId) {
      case 'free':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'starter':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'standard':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rising':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'pro':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'business':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'premium':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  const getPackageIcon = (packageId: string) => {
    switch (packageId) {
      case 'pro':
      case 'business':
      case 'premium':
        return Shield;
      case 'standard':
      case 'rising':
        return TrendingUp;
      default:
        return Star;
    }
  };

  const totalRevenue = Object.values(packageStats).reduce((sum, stat) => sum + stat.totalRevenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Package Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            <span className="font-medium">Total Pending Revenue: </span>
            <span className="text-green-600 font-bold">GHS {totalRevenue.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(packageStats)
              .sort(([, a], [, b]) => b.count - a.count)
              .map(([packageId, stats]) => {
                const IconComponent = getPackageIcon(packageId);
                return (
                  <div key={packageId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <Badge variant="outline" className={`${stats.color} text-xs`}>
                        {stats.name}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{stats.count} products</div>
                      <div className="text-xs text-green-600">GHS {stats.totalRevenue.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
