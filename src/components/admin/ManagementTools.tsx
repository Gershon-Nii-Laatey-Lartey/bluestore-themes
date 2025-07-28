
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShoppingBag, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export const ManagementTools = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Management Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="p-6 h-auto flex-col space-y-3 hover:bg-blue-50" asChild>
            <Link to="/admin/users">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="text-center">
                <span className="font-medium">Manage Users</span>
                <p className="text-sm text-gray-500 mt-1">manage user accounts</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="p-6 h-auto flex-col space-y-3 hover:bg-green-50" asChild>
            <Link to="/admin/product-catalog">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <div className="text-center">
                <span className="font-medium">Product Catalog</span>
                <p className="text-sm text-gray-500 mt-1">Browse products</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="p-6 h-auto flex-col space-y-3 hover:bg-purple-50">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            <div className="text-center">
              <span className="font-medium">Monitor Activity</span>
              <p className="text-sm text-gray-500 mt-1">View activity and chats</p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
