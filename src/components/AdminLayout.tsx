import { ReactNode } from "react";
import { Shield, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex w-full overflow-hidden">
      {/* Admin content will be rendered here */}
      <div className="flex-1 w-full overflow-hidden flex flex-col">
        {/* Simple Admin Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}; 