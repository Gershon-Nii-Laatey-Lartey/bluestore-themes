import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Smartphone, Shirt, Home, Dumbbell, Laptop, Headphones, Gamepad2, Car, Plus, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar } from "@/components/ui/sidebar";

const navigationItems = [{
  name: "Dashboard",
  href: "/",
  icon: LayoutDashboard
}, {
  name: "Publish Ad",
  href: "/publish-ad",
  icon: Plus
}, {
  name: "Messages",
  href: "/chat",
  icon: MessageCircle
}, {
  name: "Smartphones",
  href: "/category/smartphones",
  icon: Smartphone
}, {
  name: "Electronics",
  href: "/category/electronics",
  icon: Smartphone
}, {
  name: "Fashion",
  href: "/category/fashion",
  icon: Shirt
}, {
  name: "Home & Garden",
  href: "/category/home-garden",
  icon: Home
}, {
  name: "Sports",
  href: "/category/sports",
  icon: Dumbbell
}, {
  name: "Laptops",
  href: "/category/laptops",
  icon: Laptop
}, {
  name: "Headphones",
  href: "/category/headphones",
  icon: Headphones
}, {
  name: "Gaming",
  href: "/category/gaming",
  icon: Gamepad2
}, {
  name: "Automotive",
  href: "/category/automotive",
  icon: Car
}];

export const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleItemClick = (e: React.MouseEvent) => {
    // Prevent the sidebar from expanding when clicking on menu items in collapsed state
    if (isCollapsed) {
      e.stopPropagation();
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-white">
      <SidebarContent className="px-0 py-0 mt-[80px] h-[calc(100vh-80px)]">
        <SidebarGroup className="h-full">
          <SidebarGroupContent className="h-full">
            <SidebarMenu className="space-y-2 h-full py-0 px-0">
              {navigationItems.map(item => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      tooltip={isCollapsed ? item.name : undefined} 
                      className={cn(
                        "flex items-center transition-colors rounded-lg",
                        isCollapsed ? "justify-center h-12 w-12 p-0" : "justify-start h-12 px-4 space-x-3",
                        isActive ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600 mr-2" : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Link 
                        to={item.href} 
                        className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "space-x-3")}
                        onClick={handleItemClick}
                      >
                        <item.icon className={cn("shrink-0", isCollapsed ? "h-6 w-6" : "h-5 w-5")} />
                        {!isCollapsed && (
                          <span className="text-sm font-medium truncate">
                            {item.name}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <UserProfileMenu />
      </SidebarFooter>
    </Sidebar>
  );
};
