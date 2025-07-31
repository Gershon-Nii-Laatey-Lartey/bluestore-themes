import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOwnHybridOnlineStatus } from "@/hooks/useHybridOnlineStatus";
import { Circle, Wifi, WifiOff, Clock, Bell, BellOff } from "lucide-react";

export const HybridOnlineStatusDemo: React.FC = () => {
  const { status, loading, checkOwnPushNotification } = useOwnHybridOnlineStatus();
  const [pushDecision, setPushDecision] = useState<any>(null);
  const [testing, setTesting] = useState(false);

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
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Hybrid Status Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">1. WebSocket Connection (High Priority):</span> 
                If user has active WebSocket connection → Send push notification
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">2. Recent Activity (Medium Priority):</span> 
                If user was active within 2 minutes → Send push notification
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">3. Preference Override (Low Priority):</span> 
                If user has "Always Online" or specific notification enabled → Send push
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">4. Default (No Push):</span> 
                User is offline and inactive → Don't send push notification
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 