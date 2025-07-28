
-- Create ad_packages table to store package configurations
CREATE TABLE public.ad_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  duration TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  best_for TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'border-blue-400',
  icon TEXT NOT NULL DEFAULT 'Star',
  recommended BOOLEAN DEFAULT false,
  popular BOOLEAN DEFAULT false,
  ads_allowed INTEGER, -- null means unlimited
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active BOOLEAN DEFAULT true
);

-- Enable RLS on ad_packages table
ALTER TABLE public.ad_packages ENABLE ROW LEVEL SECURITY;

-- RLS policies for ad_packages (readable by all, only admins can modify)
CREATE POLICY "Anyone can view active packages" 
  ON public.ad_packages 
  FOR SELECT 
  USING (active = true);

CREATE POLICY "Only admins can manage packages" 
  ON public.ad_packages 
  FOR ALL 
  USING (public.is_admin());

-- Add updated_at trigger for ad_packages
CREATE TRIGGER update_ad_packages_updated_at
  BEFORE UPDATE ON public.ad_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
