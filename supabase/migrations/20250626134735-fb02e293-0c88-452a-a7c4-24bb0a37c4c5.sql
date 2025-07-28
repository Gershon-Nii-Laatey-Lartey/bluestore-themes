
-- Add package-based features tracking to ad_analytics table
ALTER TABLE ad_analytics 
ADD COLUMN package_id text,
ADD COLUMN priority_score numeric DEFAULT 0,
ADD COLUMN featured boolean DEFAULT false,
ADD COLUMN urgent boolean DEFAULT false;

-- Create package_features table to define what features each package gets
CREATE TABLE public.package_features (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id text NOT NULL,
  feature_name text NOT NULL,
  feature_value jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(package_id, feature_name)
);

-- Enable RLS on package_features
ALTER TABLE public.package_features ENABLE ROW LEVEL SECURITY;

-- RLS policies for package_features (readable by all, only admins can modify)
CREATE POLICY "Anyone can view package features" 
  ON public.package_features 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can manage package features" 
  ON public.package_features 
  FOR ALL 
  USING (public.is_admin());

-- Add updated_at trigger for package_features
CREATE TRIGGER update_package_features_updated_at
  BEFORE UPDATE ON public.package_features
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default package features based on our ad package configuration
INSERT INTO package_features (package_id, feature_name, feature_value) VALUES
-- Free package features
('free', 'priority_placement', '{"enabled": false, "boost": 0}'),
('free', 'analytics', '{"enabled": false}'),
('free', 'featured_listing', '{"enabled": false}'),
('free', 'urgent_tag', '{"enabled": false, "count": 0}'),
('free', 'verification_badge', '{"enabled": false}'),
('free', 'auto_renewal', '{"enabled": false}'),

-- Starter package features  
('starter', 'priority_placement', '{"enabled": true, "boost": 1}'),
('starter', 'analytics', '{"enabled": false}'),
('starter', 'featured_listing', '{"enabled": false}'),
('starter', 'urgent_tag', '{"enabled": false, "count": 0}'),
('starter', 'verification_badge', '{"enabled": false}'),
('starter', 'auto_renewal', '{"enabled": false}'),

-- Standard package features
('standard', 'priority_placement', '{"enabled": true, "boost": 2}'),
('standard', 'analytics', '{"enabled": true, "type": "basic"}'),
('standard', 'featured_listing', '{"enabled": true, "categories": true}'),
('standard', 'urgent_tag', '{"enabled": false, "count": 0}'),
('standard', 'verification_badge', '{"enabled": false}'),
('standard', 'auto_renewal', '{"enabled": false}'),

-- Boost package features
('boost', 'priority_placement', '{"enabled": true, "boost": 3}'),
('boost', 'analytics', '{"enabled": true, "type": "basic"}'),
('boost', 'featured_listing', '{"enabled": true, "categories": true, "search": true}'),
('boost', 'urgent_tag', '{"enabled": false, "count": 0}'),
('boost', 'verification_badge', '{"enabled": false}'),
('boost', 'auto_renewal', '{"enabled": false}'),

-- Pro package features
('pro', 'priority_placement', '{"enabled": true, "boost": 4}'),
('pro', 'analytics', '{"enabled": true, "type": "advanced"}'),
('pro', 'featured_listing', '{"enabled": true, "categories": true, "search": true, "highlighted": true}'),
('pro', 'urgent_tag', '{"enabled": true, "count": 1}'),
('pro', 'verification_badge', '{"enabled": false}'),
('pro', 'auto_renewal', '{"enabled": false}'),

-- Business package features
('business', 'priority_placement', '{"enabled": true, "boost": 5}'),
('business', 'analytics', '{"enabled": true, "type": "advanced"}'),
('business', 'featured_listing', '{"enabled": true, "categories": true, "search": true, "highlighted": true}'),
('business', 'urgent_tag', '{"enabled": true, "count": 5}'),
('business', 'verification_badge', '{"enabled": true, "type": "business"}'),
('business', 'auto_renewal', '{"enabled": false}'),

-- Premium package features
('premium', 'priority_placement', '{"enabled": true, "boost": 6}'),
('premium', 'analytics', '{"enabled": true, "type": "premium"}'),
('premium', 'featured_listing', '{"enabled": true, "categories": true, "search": true, "highlighted": true, "homepage": true, "banners": true}'),
('premium', 'urgent_tag', '{"enabled": true, "count": -1}'),
('premium', 'verification_badge', '{"enabled": true, "type": "premium"}'),
('premium', 'auto_renewal', '{"enabled": true}');

-- Update product_submissions to include package-based priority scoring
UPDATE product_submissions 
SET package_price = CASE 
  WHEN package->>'id' = 'free' THEN 0
  WHEN package->>'id' = 'starter' THEN 15
  WHEN package->>'id' = 'standard' THEN 30
  WHEN package->>'id' = 'boost' THEN 50
  WHEN package->>'id' = 'pro' THEN 120
  WHEN package->>'id' = 'business' THEN 250
  WHEN package->>'id' = 'premium' THEN 500
  ELSE 0
END
WHERE package IS NOT NULL AND package_price IS NULL;

-- Create function to get package features for a given package
CREATE OR REPLACE FUNCTION get_package_features(pkg_id text)
RETURNS TABLE(feature_name text, feature_value jsonb) 
LANGUAGE sql
STABLE
AS $$
  SELECT pf.feature_name, pf.feature_value
  FROM package_features pf
  WHERE pf.package_id = pkg_id;
$$;

-- Create function to check if package has specific feature
CREATE OR REPLACE FUNCTION package_has_feature(pkg_id text, feature_name text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM package_features 
    WHERE package_id = pkg_id 
    AND feature_name = package_has_feature.feature_name
    AND (feature_value->>'enabled')::boolean = true
  );
$$;
