import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import * as analytics from '../utils/analytics';

export const useAnalytics = () => {
  const location = useLocation();

  // Track page views automatically
  useEffect(() => {
    analytics.trackPageView(document.title, location.pathname);
  }, [location]);

  // Initialize analytics on mount
  useEffect(() => {
    analytics.initializeAnalytics();
  }, []);

  // Return tracking functions
  return {
    trackEvent: analytics.trackEvent,
    trackProductView: analytics.trackProductView,
    trackAddToFavorites: analytics.trackAddToFavorites,
    trackSearch: analytics.trackSearch,
    trackCategoryView: analytics.trackCategoryView,
    trackUserRegistration: analytics.trackUserRegistration,
    trackAdSubmission: analytics.trackAdSubmission,
    trackPayment: analytics.trackPayment,
    trackContactSeller: analytics.trackContactSeller,
    trackKYCSubmission: analytics.trackKYCSubmission,
    trackSupportChat: analytics.trackSupportChat,
    trackConversion: analytics.trackConversion,
    trackTimeOnPage: analytics.trackTimeOnPage,
    trackScrollDepth: analytics.trackScrollDepth,
    trackError: analytics.trackError,
    trackPageLoadTime: analytics.trackPageLoadTime,
    trackMobileAction: analytics.trackMobileAction,
    trackLocationBasedSearch: analytics.trackLocationBasedSearch,
    trackVendorProfileView: analytics.trackVendorProfileView,
    trackPackageSelection: analytics.trackPackageSelection,
    trackNotificationInteraction: analytics.trackNotificationInteraction,
    trackChatMessage: analytics.trackChatMessage,
    trackAdminAction: analytics.trackAdminAction,
  };
};

// Hook for tracking time spent on page
export const useTimeTracking = (pagePath: string) => {
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      analytics.trackTimeOnPage(pagePath, timeSpent);
    };
  }, [pagePath]);
};

// Hook for tracking scroll depth
export const useScrollTracking = (pagePath: string) => {
  useEffect(() => {
    let maxScrollDepth = 0;
    
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (scrollDepth % 25 === 0) {
          analytics.trackScrollDepth(pagePath, scrollDepth);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pagePath]);
};

// Hook for tracking errors
export const useErrorTracking = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analytics.trackError('javascript_error', event.message, window.location.pathname);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError('unhandled_rejection', event.reason, window.location.pathname);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}; 