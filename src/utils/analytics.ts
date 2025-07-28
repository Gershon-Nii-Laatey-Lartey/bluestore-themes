// Google Analytics Event Tracking Utility
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Custom event tracking
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  customParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...customParams
    });
  }
};

// Page view tracking
export const trackPageView = (pageTitle: string, pagePath: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageTitle,
      page_location: pagePath,
      custom_parameter_1: 'visitor'
    });
  }
};

// E-commerce tracking
export const trackProductView = (productId: string, productName: string, category: string, price?: number) => {
  trackEvent('view_item', 'ecommerce', productName, undefined, {
    item_id: productId,
    item_name: productName,
    item_category: category,
    value: price,
    currency: 'GHS'
  });
};

export const trackAddToFavorites = (productId: string, productName: string) => {
  trackEvent('add_to_wishlist', 'ecommerce', productName, undefined, {
    item_id: productId,
    item_name: productName
  });
};

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('search', 'engagement', searchTerm, resultsCount, {
    search_term: searchTerm,
    results_count: resultsCount
  });
};

export const trackCategoryView = (categoryName: string, productsCount: number) => {
  trackEvent('view_item_list', 'ecommerce', categoryName, productsCount, {
    item_list_name: categoryName,
    items_count: productsCount
  });
};

export const trackUserRegistration = (userType: 'buyer' | 'seller') => {
  trackEvent('sign_up', 'engagement', userType, undefined, {
    method: 'email',
    user_type: userType
  });
};

export const trackAdSubmission = (packageType: string, price: number) => {
  trackEvent('begin_checkout', 'ecommerce', packageType, price, {
    item_id: packageType,
    item_name: packageType,
    value: price,
    currency: 'GHS'
  });
};

export const trackPayment = (packageType: string, price: number, paymentMethod: string) => {
  trackEvent('purchase', 'ecommerce', packageType, price, {
    transaction_id: `txn_${Date.now()}`,
    value: price,
    currency: 'GHS',
    payment_type: paymentMethod,
    item_id: packageType,
    item_name: packageType
  });
};

export const trackContactSeller = (productId: string, productName: string) => {
  trackEvent('contact_seller', 'engagement', productName, undefined, {
    item_id: productId,
    item_name: productName
  });
};

export const trackKYCSubmission = (documentType: string) => {
  trackEvent('kyc_submission', 'engagement', documentType, undefined, {
    document_type: documentType
  });
};

export const trackSupportChat = (chatType: 'general' | 'technical' | 'payment') => {
  trackEvent('support_chat', 'engagement', chatType, undefined, {
    chat_type: chatType
  });
};

// Conversion tracking
export const trackConversion = (conversionType: string, value?: number) => {
  trackEvent('conversion', 'conversion', conversionType, value, {
    conversion_type: conversionType,
    value: value,
    currency: 'GHS'
  });
};

// User engagement tracking
export const trackTimeOnPage = (pagePath: string, timeSpent: number) => {
  trackEvent('time_on_page', 'engagement', pagePath, timeSpent, {
    page_path: pagePath,
    time_spent_seconds: timeSpent
  });
};

export const trackScrollDepth = (pagePath: string, scrollDepth: number) => {
  trackEvent('scroll_depth', 'engagement', pagePath, scrollDepth, {
    page_path: pagePath,
    scroll_depth_percentage: scrollDepth
  });
};

// Error tracking
export const trackError = (errorType: string, errorMessage: string, pagePath?: string) => {
  trackEvent('error', 'error', errorType, undefined, {
    error_type: errorType,
    error_message: errorMessage,
    page_path: pagePath || window.location.pathname
  });
};

// Performance tracking
export const trackPageLoadTime = (loadTime: number, pagePath: string) => {
  trackEvent('page_load_time', 'performance', pagePath, loadTime, {
    page_path: pagePath,
    load_time_ms: loadTime
  });
};

// Mobile-specific tracking
export const trackMobileAction = (action: string, deviceType: string) => {
  trackEvent(action, 'mobile', deviceType, undefined, {
    device_type: deviceType,
    is_mobile: true
  });
};

// Location-based tracking
export const trackLocationBasedSearch = (location: string, searchTerm: string) => {
  trackEvent('location_search', 'engagement', searchTerm, undefined, {
    location: location,
    search_term: searchTerm
  });
};

// Vendor profile tracking
export const trackVendorProfileView = (vendorId: string, vendorName: string) => {
  trackEvent('view_vendor_profile', 'engagement', vendorName, undefined, {
    vendor_id: vendorId,
    vendor_name: vendorName
  });
};

// Package selection tracking
export const trackPackageSelection = (packageType: string, price: number, features: string[]) => {
  trackEvent('select_package', 'ecommerce', packageType, price, {
    item_id: packageType,
    item_name: packageType,
    value: price,
    currency: 'GHS',
    features: features.join(',')
  });
};

// Notification tracking
export const trackNotificationInteraction = (notificationType: string, action: 'view' | 'click' | 'dismiss') => {
  trackEvent('notification_interaction', 'engagement', notificationType, undefined, {
    notification_type: notificationType,
    action: action
  });
};

// Chat tracking
export const trackChatMessage = (chatType: 'support' | 'vendor' | 'admin', messageCount: number) => {
  trackEvent('chat_message', 'engagement', chatType, messageCount, {
    chat_type: chatType,
    message_count: messageCount
  });
};

// Admin action tracking
export const trackAdminAction = (action: string, targetType: string, targetId: string) => {
  trackEvent('admin_action', 'administration', action, undefined, {
    action: action,
    target_type: targetType,
    target_id: targetId
  });
};

// Analytics initialization
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined') {
    // Track initial page load
    trackPageView(document.title, window.location.pathname);
    
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      trackPageLoadTime(loadTime, window.location.pathname);
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (scrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          trackScrollDepth(window.location.pathname, scrollDepth);
        }
      }
    });
  }
};
