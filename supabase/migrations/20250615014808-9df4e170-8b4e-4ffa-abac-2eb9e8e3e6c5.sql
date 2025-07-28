
-- Simple approach: Enable RLS and create only the essential INSERT policy
-- This is the minimum needed to fix the KYC submission error

ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own KYC submissions" ON public.kyc_submissions;
DROP POLICY IF EXISTS "Users can create their own KYC submissions" ON public.kyc_submissions;
DROP POLICY IF EXISTS "Users can update their own KYC submissions" ON public.kyc_submissions;

-- Create the essential policies
CREATE POLICY "Users can view their own KYC submissions" 
  ON public.kyc_submissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own KYC submissions" 
  ON public.kyc_submissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KYC submissions" 
  ON public.kyc_submissions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;
