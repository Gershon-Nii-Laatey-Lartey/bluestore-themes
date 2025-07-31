import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOwnHybridOnlineStatus } from "@/hooks/useHybridOnlineStatus";
import { Circle, Wifi, WifiOff, Clock, Bell, BellOff, Eye, EyeOff, Smartphone } from "lucide-react";

export const HybridOnlineStatusDemo: React.FC = () => {
  const { status, loading, checkOwnPushNotification } = useOwnHybridOnlineStatus();
  const [pushDecision, setPushDecision] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [viewportStatus, setViewportStatus] = useState<'visible' | 'hidden'>('visible');

  // Track viewport status
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setViewportStatus(document.hidden ? 'hidden' : 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    setViewportStatus(document.hidden ? 'hidden' : 'visible');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const testPushNotification = async (type: 'chat' | 'orders' | 'marketing') => {
    setTesting(true);
    try {
      const decision = await checkOwnPushNotification(type);
      setPushDecision(decision);
    } catch (error) {
      console.error('Error testing push notification:', error);
    } finally {
      setTesting(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'connected': return <Wifi className="h-4 w-4" />;
      case 'recent_activity': return <Clock className="h-4 w-4" />;
      case 'preference_override': return <Bell className="h-4 w-4" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      default: return <BellOff className="h-4 w-4" />;
    }
  };

  const getViewportIcon = (status: string) => {
    switch (status) {
      case 'visible': return <Eye className="h-4 w-4 text-green-600" />;
      case 'hidden': return <EyeOff className="h-4 w-4 text-red-600" />;
      default: return <Smartphone className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading hybrid status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Circle className={status?.is_online ? "h-5 w-5 text-green-500" : "h-5 w-5 text-gray-400"} />
            Hybrid Online Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Status</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={status?.is_online ? "default" : "secondary"}>
                  {status?.is_online ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Preference</span>
              <div className="mt-1">
                <Badge variant="outline">
                  {status?.online_status_preference || 'auto'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Last Seen</span>
            <div className="mt-1 text-sm">
              {status?.last_seen ? new Date(status.last_seen).toLocaleString() : 'Unknown'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Viewport Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getViewportIcon(viewportStatus)}
            Viewport Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Current Viewport:</span>
            <Badge 
              variant={viewportStatus === 'visible' ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {getViewportIcon(viewportStatus)}
              {viewportStatus === 'visible' ? 'Visible' : 'Hidden'}
            </Badge>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">Visible Viewport:</span> 
                User is actively using the app → Don't send push notifications
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">Hidden Viewport:</span> 
                User left the app → Good time to send push notifications
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Try switching to another tab or minimizing this window to see how viewport status changes!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Push Notification Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Push Notification Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => testPushNotification('chat')}
              disabled={testing}
              variant="outline"
              size="sm"
            >
              Test Chat Notification
            </Button>
            <Button
              onClick={() => testPushNotification('orders')}
              disabled={testing}
              variant="outline"
              size="sm"
            >
              Test Order Notification
            </Button>
            <Button
              onClick={() => testPushNotification('marketing')}
              disabled={testing}
              variant="outline"
              size="sm"
            >
              Test Marketing Notification
            </Button>
          </div>

          {pushDecision && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Decision:</span>
                <Badge 
                  variant={pushDecision.shouldSendPush ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {pushDecision.shouldSendPush ? 'Send Push' : 'Don\'t Send'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Reason:</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getReasonIcon(pushDecision.reason)}
                  {pushDecision.reason.replace('_', ' ')}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Confidence:</span>
                <Badge className={getConfidenceColor(pushDecision.confidence)}>
                  {pushDecision.confidence}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Last Activity:</span>
                <span className="text-sm text-gray-600">{pushDecision.lastActivity}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Connection:</span>
                <Badge variant="outline">
                  {pushDecision.connectionStatus}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Viewport:</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getViewportIcon(pushDecision.viewportStatus)}
                  {pushDecision.viewportStatus}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How WhatsApp-Style Viewport Tracking Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">1. Viewport Visible (High Priority):</span> 
                User is actively using the app → Don't send push notifications
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">2. Viewport Hidden + Connected:</span> 
                User left app but still connected → Send push notifications
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">3. Viewport Hidden + Recent Activity:</span> 
                User was active recently and left app → Send push notifications
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">4. Default (No Push):</span> 
                User is offline or viewport visible → Don't send push notifications
              </div>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Like WhatsApp:</strong> This system detects when you switch tabs, minimize the window, or close the app, just like messaging apps do!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 