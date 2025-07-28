
import { useEffect } from 'react';
import { paymentExpirationService } from '@/services/paymentExpirationService';

export const usePaymentExpiration = () => {
  useEffect(() => {
    // Start the auto-expiration service when the hook is used
    paymentExpirationService.startAutoExpiration();

    // Clean up when component unmounts
    return () => {
      paymentExpirationService.stopAutoExpiration();
    };
  }, []);

  return {
    schedulePaymentExpiration: paymentExpirationService.schedulePaymentExpiration.bind(paymentExpirationService),
    checkAndExpirePayment: paymentExpirationService.checkAndExpirePayment.bind(paymentExpirationService),
  };
};
