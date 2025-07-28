
-- First, let's find the user_id for the email address and assign admin role
-- We'll use a more robust approach that works even if the user doesn't exist yet

-- Insert admin role for the user with email gershon.laatey@gmail.com
-- This will work if the user exists in auth.users
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'admin'::app_role
FROM auth.users au
WHERE au.email = 'gershon.laatey@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = au.id AND ur.role = 'admin'::app_role
);
