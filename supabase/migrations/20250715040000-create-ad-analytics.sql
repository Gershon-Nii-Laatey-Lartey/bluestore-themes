-- Create ad_analytics table for tracking ad performance
CREATE TABLE IF NOT EXISTS public.ad_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.product_submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id text,
  date date NOT NULL,
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  messages integer DEFAULT 0,
  interactions jsonb DEFAULT '{}',
  priority_score numeric DEFAULT 0,
  featured boolean DEFAULT false,
  urgent boolean DEFAULT false,
  boost_level text DEFAULT 'none' CHECK (boost_level IN ('none', 'boost', '2x_boost')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id, date)
);

-- Enable RLS on ad_analytics
ALTER TABLE public.ad_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for ad_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.ad_analytics 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own analytics" 
ON public.ad_analytics 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own analytics" 
ON public.ad_analytics 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ad_analytics_product_id ON public.ad_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_user_id ON public.ad_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_date ON public.ad_analytics(date);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_product_date ON public.ad_analytics(product_id, date);

-- Create trigger for updated_at
CREATE TRIGGER update_ad_analytics_updated_at
BEFORE UPDATE ON public.ad_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 