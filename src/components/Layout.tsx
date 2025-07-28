import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useEffect } from "react";
interface LayoutProps {
  children: React.ReactNode;
}
export const Layout = ({
  children
}: LayoutProps) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full overflow-x-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        {/* Main Content */}
        <SidebarInset className="flex-1 mb-16 md:mb-0 w-full overflow-x-hidden">
          {/* Desktop Header */}
          <div className="hidden md:block">
            <Header />
          </div>
          
          <main className="pt-4 md:pt-20 md:px-6 lg:px-8 min-h-full w-full py-[7px] px-[10px]">
            <div className="min-h-full w-full max-w-none">
              {children}
            </div>
          </main>
        </SidebarInset>
        
        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <MobileNav />
        </div>
      </div>
    </SidebarProvider>;
};