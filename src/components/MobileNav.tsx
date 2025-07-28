
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Favorites", href: "/favorites", icon: Heart },
  { name: "Profile", href: "/profile", icon: User },
];

export const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="bg-white border-t border-gray-200 px-2 py-2 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href === "/chat" && location.pathname.startsWith("/chat"));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors min-w-0",
                isActive 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
