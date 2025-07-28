
-- Add images column to product_submissions table
ALTER TABLE public.product_submissions 
ADD COLUMN images TEXT[];

-- Create vendor_profiles table
CREATE TABLE public.vendor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  business_name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  phone TEXT,
  email TEXT,
  categories TEXT[],
  shipping_policy TEXT,
  return_policy TEXT,
  warranty_info TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vendor_profiles
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendor_profiles
CREATE POLICY "Users can view their own vendor profile" 
  ON public.vendor_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vendor profile" 
  ON public.vendor_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor profile" 
  ON public.vendor_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendor profile" 
  ON public.vendor_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);
