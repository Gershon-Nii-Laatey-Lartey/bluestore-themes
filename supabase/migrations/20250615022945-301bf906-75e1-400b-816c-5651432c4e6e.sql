
-- Create the kyc-documents storage bucket (this should work)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', true)
ON CONFLICT (id) DO UPDATE SET 
  public = true;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Public access to KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own KYC documents" ON storage.objects;

-- Create storage policies for KYC documents
-- Policy for users to upload their own KYC documents
CREATE POLICY "Users can upload their own KYC documents" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'kyc-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for users to view their own KYC documents
CREATE POLICY "Users can view their own KYC documents" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'kyc-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for public access to KYC documents (needed for admin viewing)
CREATE POLICY "Public access to KYC documents" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'kyc-documents');

-- Policy for authenticated users to delete their own KYC documents
CREATE POLICY "Users can delete their own KYC documents" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'kyc-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
