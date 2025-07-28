-- Add boost functionality to product_submissions and ad_analytics tables
ALTER TABLE product_submissions 
ADD COLUMN boost_level text DEFAULT 'none' CHECK (boost_level IN ('none', 'boost', '2x_boost'));

ALTER TABLE ad_analytics 
ADD COLUMN boost_level text DEFAULT 'none' CHECK (boost_level IN ('none', 'boost', '2x_boost'));

-- Update priority score calculation to account for boost levels
CREATE OR REPLACE FUNCTION public.calculate_priority_score_with_boost(
  package_price numeric, 
  created_at timestamp with time zone,
  boost_level text DEFAULT 'none'
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Base score from package price and time
  DECLARE
    base_score numeric;
    boost_multiplier numeric;
  BEGIN
    base_score := package_price * 100 + 
                  EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 * -0.1;
    
    -- Apply boost multipliers
    CASE boost_level
      WHEN '2x_boost' THEN boost_multiplier := 10000; -- Highest priority
      WHEN 'boost' THEN boost_multiplier := 5000;     -- High priority
      ELSE boost_multiplier := 0;                     -- No boost
    END CASE;
    
    RETURN base_score + boost_multiplier;
  END;
END;
$$;

-- Create storefront chat page table for custom chat functionality
CREATE TABLE IF NOT EXISTS public.storefront_chats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storefront_id uuid NOT NULL,
  visitor_name text,
  visitor_email text,
  last_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on storefront_chats
ALTER TABLE public.storefront_chats ENABLE ROW LEVEL SECURITY;

-- Create policies for storefront_chats
CREATE POLICY "Storefront owners can view their chats" 
ON public.storefront_chats 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_storefronts 
  WHERE user_storefronts.id = storefront_chats.storefront_id 
  AND user_storefronts.user_id = auth.uid()
));

CREATE POLICY "Anyone can create storefront chats" 
ON public.storefront_chats 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_storefront_chats_updated_at
BEFORE UPDATE ON public.storefront_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();