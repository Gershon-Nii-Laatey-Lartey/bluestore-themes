import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOwnOnlineStatus } from "@/hooks/useOnlineStatus";
import { OnlineStatusPreference } from "@/types/onlineStatus";
import { OnlineStatusIndicator } from "./OnlineStatusIndicator";
import { Circle, Settings, Clock, Wifi, WifiOff, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const OnlineStatusSettings: React.FC = () => {
  const { status, loading, updateStatus, setPreference } = useOwnOnlineStatus();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusToggle = async (isOnline: boolean) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updateStatus(isOnline);
      toast({
        title: isOnline ? "You're now online" : "You're now offline",
        description: isOnline 
          ? "Buyers can see you're available" 
          : "You won't appear as online to buyers",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update online status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreferenceChange = async (preference: OnlineStatusPreference) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await setPreference(preference);
      toast({
        title: "Status preference updated",
        description: `Your status is now set to ${preference.replace('_', ' ')}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status preference",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getPreferenceDescription = (preference: OnlineStatusPreference) => {
    switch (preference) {
      case 'auto':
        return "Automatically show online when active, offline when inactive";
      case 'always_online':
        return "Always appear as online to buyers";
      case 'always_offline':
        return "Always appear as offline to buyers";
      case 'manual':
        return "Manually control your online status";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No vendor profile found</p>
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
            <Settings className="h-5 w-5" />
            Online Status Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status Display */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Circle className={status.is_online ? "h-4 w-4 text-green-500" : "h-4 w-4 text-gray-400"} />
                <span className="font-medium">Current Status</span>
              </div>
              <OnlineStatusIndicator status={status} size="md" />
            </div>
            
            {/* Manual Toggle for Manual Mode */}
            {status.online_status_preference === 'manual' && (
              <div className="flex items-center gap-3">
                <Label htmlFor="status-toggle" className="text-sm font-medium">
                  {status.is_online ? 'Online' : 'Offline'}
                </Label>
                <Switch
                  id="status-toggle"
                  checked={status.is_online}
                  onCheckedChange={handleStatusToggle}
                  disabled={isUpdating}
                />
              </div>
            )}
          </div>

          {/* Status Preference */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status Preference</Label>
            <Select
              value={status.online_status_preference}
              onValueChange={handlePreferenceChange}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span>Auto</span>
                  </div>
                </SelectItem>
                <SelectItem value="always_online">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span>Always Online</span>
                  </div>
                </SelectItem>
                <SelectItem value="always_offline">
                  <div className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4 text-gray-500" />
                    <span>Always Offline</span>
                  </div>
                </SelectItem>
                <SelectItem value="manual">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Manual</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <p className="text-sm text-gray-600">
              {getPreferenceDescription(status.online_status_preference)}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Actions</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusToggle(true)}
                disabled={isUpdating || status.is_online}
                className="flex-1"
              >
                <Wifi className="h-4 w-4 mr-2" />
                Go Online
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusToggle(false)}
                disabled={isUpdating || !status.is_online}
                className="flex-1"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Go Offline
              </Button>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status Information</Label>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Last seen:</span>
                <span className="font-medium">
                  {new Date(status.last_seen).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-gray-500" />
                <span>Status:</span>
                <Badge variant="secondary" className={
                  status.is_online 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-600"
                }>
                  {status.is_online ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">Auto Mode:</span> Best for most users. Shows you as online when active.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">Always Online:</span> Good for active sellers who want maximum visibility.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">Always Offline:</span> Use when you're not available for inquiries.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Circle className="h-3 w-3 text-purple-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">Manual:</span> Full control over when you appear online or offline.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 