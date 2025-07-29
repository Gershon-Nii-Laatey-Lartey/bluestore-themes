
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, CheckCheck, Trash2, Filter, Search, Loader2 } from "lucide-react";
import { notificationService } from "@/services/notificationService";
import { Notification } from "@/types/notification";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const observer = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 15;

  const loadNotifications = useCallback(async (isInitial = false) => {
    if (!user) return;

    try {
      if (isInitial) {
        setLoading(true);
        setPage(0);
        setLastTimestamp(null);
      } else {
        setLoadingMore(true);
      }

      let query = notificationService.getNotifications(user.id);
      
      // Add pagination if not initial load
      if (!isInitial && lastTimestamp) {
        // Note: This would need to be implemented in the notificationService
        // For now, we'll load all notifications and handle pagination client-side
      }

      const data = await query;
      
      if (!data || data.length === 0) {
        if (isInitial) {
          setNotifications([]);
        }
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // Check if we have more data
      if (data.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      // Update last timestamp for next page
      if (data.length > 0) {
        setLastTimestamp(data[data.length - 1].created_at);
      }

      if (isInitial) {
        setNotifications(data);
      } else {
        setNotifications(prev => [...prev, ...data]);
      }
      
      setPage(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, toast]);

  // Intersection Observer for infinite scroll
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadNotifications(false);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadingMore, loadNotifications]);

  useEffect(() => {
    if (user) {
      loadNotifications(true);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id, user?.id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user?.id);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id, user?.id);
      // Remove from state immediately to prevent "magical" reappearance
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      toast({
        title: "Success",
        description: "Notification deleted"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  const NotificationSkeleton = () => (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="flex space-x-2">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="md:hidden w-full">
          <MobileHeader />
        </div>
        <div className="animate-fade-in w-full">
          {isMobile ? (
            <div className="px-4 md:px-0 w-full max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
                <p className="text-gray-600">Stay updated with your latest activities</p>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <NotificationSkeleton key={index} />
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                <p className="text-gray-600">Stay updated with your latest activities and platform updates</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <NotificationSkeleton key={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md:hidden w-full">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in w-full">
        {isMobile ? (
          // Mobile Layout
          <div className="px-4 md:px-0 w-full max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Stay updated with your latest activities</p>
            </div>

            {/* Mobile Controls */}
            <div className="flex gap-2 mb-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({totalCount})</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            </div>

            {/* Mobile Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  ref={index === filteredNotifications.length - 1 ? lastElementRef : null}
                >
                  <Card className={`${!notification.read ? 'border-blue-200 bg-blue-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <span className="text-lg">{getTypeIcon(notification.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={getTypeColor(notification.type)}>
                                {notification.type}
                              </Badge>
                              {!notification.read && (
                                <Badge className="h-2 w-2 bg-blue-600 rounded-full p-0"></Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatDate(notification.created_at)}
                            </span>
                            <div className="flex space-x-2">
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {/* Loading indicator for infinite scroll */}
              {loadingMore && (
                <div ref={loadingRef} className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-500">Loading more notifications...</span>
                </div>
              )}
              
              {/* End of list indicator */}
              {!hasMore && filteredNotifications.length > 0 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  You've reached the end of your notifications
                </div>
              )}
            </div>
          </div>
        ) : (
          // Desktop Layout
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Stay updated with your latest activities and platform updates</p>
            </div>

            {/* Desktop Stats and Controls */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-lg font-semibold">{totalCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-600">Unread</p>
                      <p className="text-lg font-semibold">{unreadCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Read</p>
                      <p className="text-lg font-semibold">{totalCount - unreadCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Filtered</p>
                      <p className="text-lg font-semibold">{filteredNotifications.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All as Read
              </Button>
            </div>

            {/* Desktop Notifications Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  ref={index === filteredNotifications.length - 1 ? lastElementRef : null}
                >
                  <Card className={`${!notification.read ? 'border-blue-200 bg-blue-50' : ''} hover:shadow-md transition-shadow`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={getTypeColor(notification.type)}>
                                {notification.type}
                              </Badge>
                              {!notification.read && (
                                <Badge className="h-2 w-2 bg-blue-600 rounded-full p-0"></Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3 leading-relaxed">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                              {formatDate(notification.created_at)}
                            </span>
                            <div className="flex space-x-2">
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {/* Loading indicator for infinite scroll */}
              {loadingMore && (
                <div ref={loadingRef} className="col-span-1 lg:col-span-2 flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-sm text-gray-500">Loading more notifications...</span>
                </div>
              )}
              
              {/* End of list indicator */}
              {!hasMore && filteredNotifications.length > 0 && (
                <div className="col-span-1 lg:col-span-2 text-center py-6 text-sm text-gray-500">
                  You've reached the end of your notifications
                </div>
              )}
            </div>

            {filteredNotifications.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-500">
                    {searchQuery || filterType !== 'all' 
                      ? "Try adjusting your search or filter criteria."
                      : "You're all caught up! Check back later for new updates."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
