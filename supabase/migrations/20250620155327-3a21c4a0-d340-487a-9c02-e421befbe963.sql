
-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID DEFAULT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  payment_provider TEXT NOT NULL DEFAULT 'paystack' CHECK (payment_provider = 'paystack'),
  provider_payment_id TEXT,
  provider_reference TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_provider TEXT NOT NULL DEFAULT 'paystack' CHECK (payment_provider = 'paystack'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook_events table
CREATE TABLE public.webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider = 'paystack'),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key relationship for payments to subscriptions
ALTER TABLE public.payments 
ADD CONSTRAINT fk_payments_subscription 
FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policies for payments table
CREATE POLICY "Users can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payments" 
  ON public.payments 
  FOR UPDATE 
  USING (true);

-- Create policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions" 
  ON public.subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
  ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update subscriptions" 
  ON public.subscriptions 
  FOR UPDATE 
  USING (true);

-- Create policies for webhook_events table (admin only)
CREATE POLICY "Admins can access webhook events" 
  ON public.webhook_events 
  FOR ALL 
  USING (public.is_admin());

-- Create function to calculate subscription end date
CREATE OR REPLACE FUNCTION public.calculate_subscription_end_date(
  plan_id TEXT,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now()
) RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
BEGIN
  CASE plan_id
    WHEN 'free' THEN RETURN start_date + INTERVAL '100 years'; -- Lifetime
    WHEN 'starter' THEN RETURN start_date + INTERVAL '1 week';
    WHEN 'standard' THEN RETURN start_date + INTERVAL '1 month';
    WHEN 'rising' THEN RETURN start_date + INTERVAL '2 weeks';
    WHEN 'pro' THEN RETURN start_date + INTERVAL '1 month';
    WHEN 'business' THEN RETURN start_date + INTERVAL '3 months';
    WHEN 'premium' THEN RETURN start_date + INTERVAL '5 months';
    ELSE RETURN start_date + INTERVAL '1 month';
  END CASE;
END;
$$;

-- Create function to expire subscriptions
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.subscriptions 
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'active' 
    AND current_period_end <= now();
$$;

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON public.payments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
