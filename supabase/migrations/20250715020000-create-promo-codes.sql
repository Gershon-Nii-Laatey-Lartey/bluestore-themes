-- Create promo codes table
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free')),
  discount_value NUMERIC NOT NULL,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create promo code usage tracking table
CREATE TABLE public.promo_code_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.product_submissions(id) ON DELETE SET NULL,
  discount_amount NUMERIC NOT NULL,
  original_amount NUMERIC NOT NULL,
  final_amount NUMERIC NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(promo_code_id, user_id, product_id)
);

-- Enable RLS on promo codes tables
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_codes
CREATE POLICY "Anyone can view active promo codes" 
  ON public.promo_codes 
  FOR SELECT 
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage all promo codes" 
  ON public.promo_codes 
  FOR ALL 
  USING (is_admin());

-- RLS Policies for promo_code_usage
CREATE POLICY "Users can view their own promo code usage" 
  ON public.promo_code_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all promo code usage" 
  ON public.promo_code_usage 
  FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can insert promo code usage" 
  ON public.promo_code_usage 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to validate promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS TABLE(
  is_valid BOOLEAN,
  discount_type TEXT,
  discount_value NUMERIC,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  promo_record RECORD;
  usage_count INTEGER;
BEGIN
  -- Get promo code details
  SELECT * INTO promo_record
  FROM promo_codes
  WHERE code = p_code
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > now())
    AND (valid_from IS NULL OR valid_from <= now());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'Invalid promo code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if max uses exceeded
  IF promo_record.max_uses IS NOT NULL AND promo_record.used_count >= promo_record.max_uses THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'Promo code usage limit exceeded'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user has already used this code for the same product
  SELECT COUNT(*) INTO usage_count
  FROM promo_code_usage
  WHERE promo_code_id = promo_record.id
    AND user_id = p_user_id;
  
  IF usage_count > 0 THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::NUMERIC, 'You have already used this promo code'::TEXT;
    RETURN;
  END IF;
  
  -- Return valid promo code
  RETURN QUERY SELECT true, promo_record.discount_type, promo_record.discount_value, 'Valid promo code'::TEXT;
END;
$$;

-- Create function to apply promo code discount
CREATE OR REPLACE FUNCTION apply_promo_code_discount(
  p_code TEXT,
  p_user_id UUID,
  p_original_amount NUMERIC
)
RETURNS TABLE(
  success BOOLEAN,
  discount_amount NUMERIC,
  final_amount NUMERIC,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  promo_record RECORD;
  calculated_discount NUMERIC;
  calculated_final NUMERIC;
BEGIN
  -- Validate promo code
  SELECT * INTO promo_record
  FROM promo_codes
  WHERE code = p_code
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > now())
    AND (valid_from IS NULL OR valid_from <= now());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::NUMERIC, p_original_amount, 'Invalid promo code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if max uses exceeded
  IF promo_record.max_uses IS NOT NULL AND promo_record.used_count >= promo_record.max_uses THEN
    RETURN QUERY SELECT false, 0::NUMERIC, p_original_amount, 'Promo code usage limit exceeded'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount based on type
  CASE promo_record.discount_type
    WHEN 'percentage' THEN
      calculated_discount := (p_original_amount * promo_record.discount_value) / 100;
    WHEN 'fixed' THEN
      calculated_discount := promo_record.discount_value;
    WHEN 'free' THEN
      calculated_discount := p_original_amount;
    ELSE
      calculated_discount := 0;
  END CASE;
  
  -- Ensure discount doesn't exceed original amount
  IF calculated_discount > p_original_amount THEN
    calculated_discount := p_original_amount;
  END IF;
  
  calculated_final := p_original_amount - calculated_discount;
  
  -- Update usage count
  UPDATE promo_codes 
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE id = promo_record.id;
  
  RETURN QUERY SELECT true, calculated_discount, calculated_final, 'Discount applied successfully'::TEXT;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active, valid_until);
CREATE INDEX idx_promo_code_usage_user ON promo_code_usage(user_id);
CREATE INDEX idx_promo_code_usage_promo ON promo_code_usage(promo_code_id);

-- Add updated_at trigger for promo_codes
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column(); 