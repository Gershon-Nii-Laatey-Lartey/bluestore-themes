
-- Create payments table to store all payment records
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.product_submissions(id) ON DELETE SET NULL,
  reference TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'paystack',
  gateway_response JSONB,
  metadata JSONB,
  verified_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own payments
CREATE POLICY "Users can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Create policy for edge functions to insert/update payments
CREATE POLICY "Service can manage payments" 
  ON public.payments 
  FOR ALL 
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_payments_reference ON public.payments(reference);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Create function to update payment timestamps
CREATE OR REPLACE FUNCTION update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER payments_updated_at_trigger
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_updated_at();
