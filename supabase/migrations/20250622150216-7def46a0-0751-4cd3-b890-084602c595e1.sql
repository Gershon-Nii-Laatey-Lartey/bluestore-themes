
-- Fix RLS policies for locations table to allow public read access
DROP POLICY IF EXISTS "Only admins can view locations" ON public.locations;
DROP POLICY IF EXISTS "Admins can view all locations" ON public.locations;

-- Allow everyone to view active locations (public read access)
CREATE POLICY "Anyone can view active locations" 
ON public.locations 
FOR SELECT 
USING (active = true);

-- Allow only admins to insert locations
CREATE POLICY "Admins can insert locations" 
ON public.locations 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Allow only admins to update locations
CREATE POLICY "Admins can update locations" 
ON public.locations 
FOR UPDATE 
USING (public.is_admin());

-- Allow only admins to delete locations
CREATE POLICY "Admins can delete locations" 
ON public.locations 
FOR DELETE 
USING (public.is_admin());

-- Create categories table with similar structure to locations
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'category',
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_locations_updated_at();

-- Enable RLS on categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active categories (public read access)
CREATE POLICY "Anyone can view active categories" 
ON public.categories 
FOR SELECT 
USING (active = true);

-- Allow only admins to insert categories
CREATE POLICY "Admins can insert categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Allow only admins to update categories
CREATE POLICY "Admins can update categories" 
ON public.categories 
FOR UPDATE 
USING (public.is_admin());

-- Allow only admins to delete categories
CREATE POLICY "Admins can delete categories" 
ON public.categories 
FOR DELETE 
USING (public.is_admin());

-- Insert some initial categories
INSERT INTO public.categories (name, type, parent_id) VALUES 
('Electronics', 'category', NULL),
('Fashion', 'category', NULL),
('Home & Garden', 'category', NULL),
('Sports', 'category', NULL),
('Automotive', 'category', NULL),
('Gaming', 'category', NULL);
