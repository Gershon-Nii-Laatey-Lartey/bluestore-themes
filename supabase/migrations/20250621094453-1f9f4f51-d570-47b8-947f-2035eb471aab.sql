
-- Fix RLS policy to allow admin access to payments
CREATE POLICY "Admins can view all payments" 
  ON public.payments 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin());

-- Also allow admins to update payments if needed
CREATE POLICY "Admins can update all payments" 
  ON public.payments 
  FOR UPDATE 
  TO authenticated
  USING (public.is_admin());
