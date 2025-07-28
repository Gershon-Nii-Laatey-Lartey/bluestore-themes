import { useState } from "react";
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { User, Settings, Plus, Bell, HelpCircle, LogOut, Package, ShoppingBag, Store, Edit, Calendar, MapPin, Phone, Mail, BarChart3, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStats } from "@/hooks/useProfileStats";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const menuItems = [
  { icon: Plus, label: "Publish Ad", href: "/publish-ad", description: "Create and publish new product listings" },
  { icon: ShoppingBag, label: "My Ads", href: "/my-ads", description: "Manage your published advertisements" },
  { icon: Store, label: "My Vendor Profile", href: "/my-vendor-profile", description: "View and edit your vendor profile" },
  { icon: Package, label: "Active Packages", href: "/active-packages", description: "Track your subscription packages" },
  { icon: Bell, label: "Notifications", href: "/notifications", description: "View your notifications and alerts" },
  { icon: Settings, label: "Settings", href: "/settings", description: "Manage your account settings" },
  { icon: HelpCircle, label: "Help & Support", href: "/support", description: "Get help and contact support" },
];

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const { publishedAds, favorites, loading: statsLoading } = useProfileStats();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || user?.email || "User";
  const initials = profile?.full_name ? getInitials(profile.full_name) : (user?.email ? user.email.charAt(0).toUpperCase() : "U");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check user roles and permissions
  const isAdmin = user?.role === 'admin';
  const isCSWorker = user?.role === 'cs_worker';
  const hasAnalyticsAccess = user?.role === 'admin' || user?.role === 'cs_worker' || profile?.has_analytics_access;

  // Dashboard links based on user type
  const getDashboardLinks = () => {
    const links = [];
    
    if (isAdmin) {
      links.push({
        icon: Shield,
        label: "Admin Dashboard",
        href: "/admin",
        description: "Manage the platform and view analytics",
        color: "text-red-600",
        bgColor: "bg-red-100"
      });
    }
    
    if (isCSWorker) {
      links.push({
        icon: Users,
        label: "CS Worker Dashboard",
        href: "/cs-worker-dashboard",
        description: "Handle customer support and manage cases",
        color: "text-orange-600",
        bgColor: "bg-orange-100"
      });
    }
    
    if (hasAnalyticsAccess) {
      links.push({
        icon: BarChart3,
        label: "Analytics",
        href: "/analytics",
        description: "View detailed analytics and insights",
        color: "text-purple-600",
        bgColor: "bg-purple-100"
      });
    }
    
    return links;
  };

  const dashboardLinks = getDashboardLinks();

  return (
    <Layout>
      <div className="md:hidden w-full">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in w-full">
        {isMobile ? (
          // Mobile Layout
          <div className="px-4 md:px-0 w-full max-w-4xl mx-auto">
            {/* Profile Header */}
            <Card className="mb-6 w-full">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.avatar_url || "/lovable-uploads/c6148684-f71d-4b35-be45-ed4848d5e86d.png"} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">{displayName}</h2>
                    <p className="text-gray-500 truncate">{user?.email}</p>
                    <p className="text-sm text-gray-400">
                      Member since {new Date(profile?.created_at || user?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="shrink-0"
                    onClick={() => setEditModalOpen(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 w-full">
              <Card className="w-full">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {statsLoading ? "..." : publishedAds}
                  </div>
                  <div className="text-sm text-gray-500">Published Ads</div>
                </CardContent>
              </Card>
              <Card className="w-full">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {statsLoading ? "..." : favorites}
                  </div>
                  <div className="text-sm text-gray-500">Favorites</div>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Links */}
            {dashboardLinks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dashboard Access</h3>
                <div className="space-y-3">
                  {dashboardLinks.map((link) => (
                    <Link key={link.href} to={link.href}>
                      <Card className="w-full hover:shadow-md transition-shadow cursor-pointer border-2 border-gray-100">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 ${link.bgColor} rounded-lg`}>
                              <link.icon className={`h-5 w-5 ${link.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{link.label}</h3>
                              <p className="text-sm text-gray-500">{link.description}</p>
                            </div>
                            <div className="text-gray-400">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="space-y-3">
              {menuItems.map((item) => (
                <Link key={item.href} to={item.href}>
                  <Card className="w-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <item.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.label}</h3>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <div className="text-gray-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Sign Out */}
            <div className="mt-8">
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          // Desktop Layout
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
              <p className="text-gray-600">Manage your account and view your activity</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarImage src={profile?.avatar_url || "/lovable-uploads/c6148684-f71d-4b35-be45-ed4848d5e86d.png"} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{displayName}</h2>
                      <p className="text-gray-500 mb-2">{user?.email}</p>
                      <Badge variant="secondary" className="mb-4">
                        <Calendar className="h-3 w-3 mr-1" />
                        Member since {new Date(profile?.created_at || user?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </Badge>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditModalOpen(true)}
                        className="w-full"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3 border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{user?.email}</span>
                        </div>
                        {profile?.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                        {profile?.location && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{profile.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Content */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {statsLoading ? "..." : publishedAds}
                          </div>
                          <div className="text-sm text-gray-500">Published Ads</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-green-600 mb-2">
                            {statsLoading ? "..." : favorites}
                          </div>
                          <div className="text-sm text-gray-500">Favorites</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {formatDate(profile?.created_at || user?.created_at)}
                          </div>
                          <div className="text-sm text-gray-500">Member Since</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Dashboard Access */}
                    {dashboardLinks.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Access</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {dashboardLinks.map((link) => (
                            <Link key={link.href} to={link.href}>
                              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-gray-100">
                                <CardContent className="p-6">
                                  <div className="flex items-center space-x-4">
                                    <div className={`p-3 ${link.bgColor} rounded-lg`}>
                                      <link.icon className={`h-6 w-6 ${link.color}`} />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 mb-1">{link.label}</h4>
                                      <p className="text-sm text-gray-500">{link.description}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {menuItems.slice(0, 6).map((item) => (
                          <Link key={item.href} to={item.href}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <item.icon className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{item.label}</h4>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                        <div className="space-y-4">
                          {menuItems.slice(4).map((item) => (
                            <Link key={item.href} to={item.href}>
                              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-gray-100 rounded-lg">
                                    <item.icon className="h-5 w-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{item.label}</h4>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                  </div>
                                </div>
                                <div className="text-gray-400">
                                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign Out</h3>
                        <Button 
                          variant="outline" 
                          onClick={handleSignOut}
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProfileEditModal 
        isOpen={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
      />
    </Layout>
  );
};

export default Profile;
