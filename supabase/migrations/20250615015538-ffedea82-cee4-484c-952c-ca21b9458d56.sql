
-- Remove the problematic admin policies that reference auth.users table
DROP POLICY IF EXISTS "Admins can view all KYC submissions" ON public.kyc_submissions;
DROP POLICY IF EXISTS "Admins can update all KYC submissions" ON public.kyc_submissions;

-- Also drop any existing admin policies on storage.objects for KYC documents
DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;

-- The user policies will remain as they are working correctly:
-- "Users can view their own KYC submissions"
-- "Users can create their own KYC submissions" 
-- "Users can update their own KYC submissions"
-- "Users can upload their own KYC documents"
-- "Users can view their own KYC documents"
