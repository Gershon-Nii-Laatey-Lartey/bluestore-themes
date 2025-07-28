
export interface Payment {
  id: string;
  user_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  payment_provider: string;
  provider_payment_id?: string;
  provider_reference?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_provider: string;
  created_at: string;
  updated_at: string;
}

// Partial subscription data returned from payment history queries
export interface PartialSubscription {
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
}

export interface PaymentHistory extends Payment {
  subscriptions?: PartialSubscription;
}

export interface PaymentIntent {
  plan_id: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface PaystackCheckoutData {
  authorization_url: string;
  access_code: string;
  reference: string;
}
