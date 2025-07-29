import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

// Pages where the floating action button should NOT appear
const EXCLUDED_PAGES = [
  "/chat",
  "/chat-rooms", 
  "/publish-ad",
  "/profile",
  "/admin",
  "/admin/users",
  "/admin/analytics",
  "/admin/reports",
  "/admin/support-chats",
  "/admin/cases",
  "/admin/kyc",
  "/admin/products",
  "/admin/packages",
  "/admin/promo-codes",
  "/admin/locations",
  "/admin/categories",
  "/admin/terms",
  "/admin/transferred-cases",
  "/vendor-profile",
  "/storefront",
  "/storefront-manager",
  "/storefront-chat",
  "/storefront-search",
  "/storefront-product",
  "/cs-worker-dashboard",
  "/kyc",
  "/settings",
  "/notifications",
  "/favorites",
  "/my-ads",
  "/vendor-required",
  "/create-vendor-profile",
  "/my-vendor-profile",
  "/package-selection",
  "/payment-history",
  "/subscription-manager",
  "/support",
  "/terms",
  "/faq",
  "/404"
];

export const Layout = ({
  children
}: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Check if current page should show the FAB
  const shouldShowFAB = isMobile && !EXCLUDED_PAGES.some(page => 
    location.pathname === page || location.pathname.startsWith(page)
  );

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

        {/* Floating Action Button - Mobile Only */}
        {shouldShowFAB && (
          <div className="md:hidden fixed bottom-20 right-4 z-50">
            <Button
              size="lg"
              className="h-14 w-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 border-0"
              onClick={() => navigate("/publish-ad")}
            >
              <Plus className="h-6 w-6" strokeWidth={3} />
            </Button>
          </div>
        )}
      </div>
    </SidebarProvider>;
};