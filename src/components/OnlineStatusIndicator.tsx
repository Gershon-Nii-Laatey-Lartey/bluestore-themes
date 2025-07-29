import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Circle, Clock } from "lucide-react";
import { VendorOnlineStatus } from "@/types/onlineStatus";
import { onlineStatusService } from "@/services/onlineStatusService";

interface OnlineStatusIndicatorProps {
  status: VendorOnlineStatus;
  size?: 'sm' | 'md' | 'lg';
  showTime?: boolean;
  className?: string;
}

export const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({
  status,
  size = 'md',
  showTime = true,
  className
}) => {
  const isOnline = status.is_online;
  const timeSinceLastSeen = onlineStatusService.getTimeSinceLastSeen(status.last_seen);

  const getStatusColor = () => {
    if (status.online_status_preference === 'always_online') {
      return 'bg-green-500';
    }
    if (status.online_status_preference === 'always_offline') {
      return 'bg-gray-400';
    }
    return isOnline ? 'bg-green-500' : 'bg-gray-400';
  };

  const getStatusText = () => {
    switch (status.online_status_preference) {
      case 'always_online':
        return 'Always Online';
      case 'always_offline':
        return 'Always Offline';
      case 'manual':
        return isOnline ? 'Online' : 'Offline';
      case 'auto':
      default:
        return isOnline ? 'Online' : 'Offline';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-sm px-3 py-1.5';
      case 'md':
      default:
        return 'text-xs px-2.5 py-1';
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1.5">
        <div className={cn(
          "relative",
          size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5'
        )}>
          <Circle 
            className={cn(
              getStatusColor(),
              "rounded-full",
              size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5',
              isOnline && status.online_status_preference !== 'always_offline' && 'animate-pulse'
            )} 
          />
          {isOnline && status.online_status_preference === 'auto' && (
            <div className={cn(
              "absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75",
              size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5'
            )} />
          )}
        </div>
        
        <Badge 
          variant="secondary" 
          className={cn(
            getSizeClasses(),
            "font-medium",
            isOnline ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"
          )}
        >
          {getStatusText()}
        </Badge>
      </div>

      {showTime && (
        <div className="flex items-center gap-1 text-gray-500">
          <Clock className={cn(
            size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'
          )} />
          <span className={cn(
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'
          )}>
            {timeSinceLastSeen}
          </span>
        </div>
      )}
    </div>
  );
};

// Compact version for small spaces
export const CompactOnlineStatus: React.FC<{ status: VendorOnlineStatus }> = ({ status }) => {
  const isOnline = status.is_online;

  return (
    <div className="flex items-center gap-1">
      <div className="relative">
        <Circle 
          className={cn(
            "w-2 h-2 rounded-full",
            isOnline ? "text-green-500" : "text-gray-400",
            isOnline && status.online_status_preference === 'auto' && "animate-pulse"
          )} 
        />
        {isOnline && status.online_status_preference === 'auto' && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping opacity-75" />
        )}
      </div>
      <span className={cn(
        "text-xs font-medium",
        isOnline ? "text-green-600" : "text-gray-500"
      )}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

// Status with tooltip for more details
export const DetailedOnlineStatus: React.FC<{ 
  status: VendorOnlineStatus;
  vendorName?: string;
}> = ({ status, vendorName }) => {
  const isOnline = status.is_online;
  const timeSinceLastSeen = onlineStatusService.getTimeSinceLastSeen(status.last_seen);

  return (
    <div className="group relative">
      <OnlineStatusIndicator status={status} size="md" />
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        <div className="flex flex-col gap-1">
          {vendorName && (
            <div className="font-medium">{vendorName}</div>
          )}
          <div className="flex items-center gap-2">
            <Circle className={cn(
              "w-2 h-2",
              isOnline ? "text-green-400" : "text-gray-400"
            )} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <div className="text-gray-300">
            Last seen: {timeSinceLastSeen}
          </div>
          {status.online_status_preference !== 'auto' && (
            <div className="text-gray-300">
              Status: {status.online_status_preference.replace('_', ' ')}
            </div>
          )}
        </div>
        
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}; 