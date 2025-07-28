
-- First, let's check existing policies and only create the ones that don't exist

-- Create admin policy for KYC submissions (SELECT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'kyc_submissions' 
        AND policyname = 'Admins can view all KYC submissions'
    ) THEN
        CREATE POLICY "Admins can view all KYC submissions" 
          ON public.kyc_submissions 
          FOR SELECT 
          TO authenticated
          USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END
$$;

-- Create admin policy for KYC submissions (UPDATE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'kyc_submissions' 
        AND policyname = 'Admins can update all KYC submissions'
    ) THEN
        CREATE POLICY "Admins can update all KYC submissions" 
          ON public.kyc_submissions 
          FOR UPDATE 
          TO authenticated
          USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END
$$;

-- Create admin policy for product submissions (SELECT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_submissions' 
        AND policyname = 'Admins can view all product submissions'
    ) THEN
        CREATE POLICY "Admins can view all product submissions" 
          ON public.product_submissions 
          FOR SELECT 
          TO authenticated
          USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END
$$;

-- Create admin policy for product submissions (UPDATE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_submissions' 
        AND policyname = 'Admins can update all product submissions'
    ) THEN
        CREATE POLICY "Admins can update all product submissions" 
          ON public.product_submissions 
          FOR UPDATE 
          TO authenticated
          USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END
$$;

-- The profiles policy already exists, so we'll skip it
