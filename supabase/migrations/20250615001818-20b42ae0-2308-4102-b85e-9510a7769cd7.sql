
-- First, let's see what RLS policies currently exist on the product_submissions table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'product_submissions';

-- Drop any existing restrictive policies that might be blocking public access to approved products
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.product_submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON public.product_submissions;
DROP POLICY IF EXISTS "Users can only view their own submissions" ON public.product_submissions;

-- Create a new policy that allows anyone (including anonymous users) to view approved products
CREATE POLICY "Anyone can view approved products" 
ON public.product_submissions 
FOR SELECT 
USING (status = 'approved');

-- Keep the existing policies for other operations (INSERT, UPDATE, DELETE) that should remain user-specific
-- but make sure SELECT is open for approved products
