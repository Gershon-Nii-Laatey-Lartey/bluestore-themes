import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Package, 
  FileCheck, 
  Users, 
  Headphones, 
  MapPin, 
  Tag, 
  Settings, 
  TrendingUp, 
  Shield, 
  Flag,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Gift
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminSidebar } from "@/hooks/useAdminSidebar";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingSubmissions: number;
  pendingKyc: number;
}

export const AdminSidebar = ({ 
  activeTab, 
  onTabChange, 
  pendingSubmissions, 
  pendingKyc 
}: AdminSidebarProps) => {
  const { collapsed, toggleCollapsed } = useAdminSidebar();
  const { user, profile, signOut } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || user?.email || "Admin";
  const initials = profile?.full_name ? getInitials(profile.full_name) : (user?.email ? user.email.charAt(0).toUpperCase() : "A");

  const menuGroups = [
    {
      title: "Content Management",
      items: [
        {
          id: "products",
          label: "Products",
          icon: Package,
          badge: pendingSubmissions > 0 ? pendingSubmissions : undefined
        },
        {
          id: "kyc",
          label: "KYC",
          icon: FileCheck,
          badge: pendingKyc > 0 ? pendingKyc : undefined
        }
      ]
    },
    {
      title: "User Management",
      items: [
        {
          id: "users",
          label: "Users",
          icon: Users
        },
        {
          id: "cs-workers",
          label: "CS Workers",
          icon: Headphones
        }
      ]
    },
    {
      title: "Support & Reports",
      items: [
        {
          id: "reports",
          label: "Reports",
          icon: Flag
        },
        {
          id: "support-chats",
          label: "Support Chats",
          icon: MessageSquare
        },
        {
          id: "transferred-cases",
          label: "Transferred Cases",
          icon: Shield
        },
        {
          id: "case-updates",
          label: "Case Updates",
          icon: FileText
        }
      ]
    },
    {
      title: "Platform Settings",
      items: [
        {
          id: "locations",
          label: "Locations",
          icon: MapPin
        },
        {
          id: "categories",
          label: "Categories",
          icon: Tag
        },
        {
          id: "packages",
          label: "Packages",
          icon: Settings
        },
        {
          id: "promo-codes",
          label: "Promo Codes",
          icon: Gift
        },
        {
          id: "terms",
          label: "Terms & Conditions",
          icon: FileText
        }
      ]
    },
    {
      title: "Analytics & Tools",
      items: [
        {
          id: "analytics",
          label: "Analytics",
          icon: TrendingUp
        },
        {
          id: "tools",
          label: "Tools",
          icon: Shield
        }
      ]
    }
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Overlay for mobile */}
      <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" />
      <div className="flex flex-col h-full">
        {/* Profile Card */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapsed}
              className="h-8 w-8 p-0"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            <div className="space-y-6">
              {menuGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-1">
                  {!collapsed && (
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.title}
                    </h3>
                  )}
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-10 px-3",
                          collapsed && "px-2"
                        )}
                        onClick={() => onTabChange(item.id)}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="ml-3 flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <Badge variant="destructive" className="ml-auto">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Button>
                    );
                  })}
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/* Sign Out Button */}
        <div className="p-2 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start h-10 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <span className="ml-3">Sign Out</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};