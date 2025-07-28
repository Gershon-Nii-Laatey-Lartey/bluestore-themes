
-- Create KYC submissions table
CREATE TABLE public.kyc_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_description TEXT NOT NULL,
  product_category TEXT NOT NULL,
  location TEXT NOT NULL,
  id_document_url TEXT,
  id_document_back_url TEXT,
  selfie_with_id_url TEXT,
  agree_terms BOOLEAN NOT NULL DEFAULT false,
  confirm_info BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT
);

-- Enable RLS for KYC submissions
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for KYC submissions
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

-- Admin policies (assuming admins are identified by a specific role or email)
CREATE POLICY "Admins can view all KYC submissions" 
  ON public.kyc_submissions 
  FOR SELECT 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@example.com'
  ));

CREATE POLICY "Admins can update all KYC submissions" 
  ON public.kyc_submissions 
  FOR UPDATE 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@example.com'
  ));

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', false);

-- Storage policies for KYC documents
CREATE POLICY "Users can upload their own KYC documents" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own KYC documents" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all KYC documents" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'kyc-documents' AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@example.com'
  ));
