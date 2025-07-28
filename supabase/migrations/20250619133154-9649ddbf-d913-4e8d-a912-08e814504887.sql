
-- First, add RLS to product_submissions table if not enabled
ALTER TABLE public.product_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them to ensure consistency
DO $$
BEGIN
    -- Drop existing policies for payments table if they exist
    DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
    DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
    
    -- Drop existing policies for product_submissions table if they exist  
    DROP POLICY IF EXISTS "Users can view their own submissions" ON public.product_submissions;
    DROP POLICY IF EXISTS "Users can create their own submissions" ON public.product_submissions;
    DROP POLICY IF EXISTS "Users can update their own submissions" ON public.product_submissions;
END
$$;

-- Create RLS policies for payments table
CREATE POLICY "Users can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for product_submissions table
CREATE POLICY "Users can view their own submissions" 
  ON public.product_submissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions" 
  ON public.product_submissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions" 
  ON public.product_submissions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add 'processing' status to product submissions if not already added
ALTER TABLE product_submissions 
DROP CONSTRAINT IF EXISTS product_submissions_status_check;

ALTER TABLE product_submissions 
ADD CONSTRAINT product_submissions_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'closed', 'processing'));

-- Clean up any existing stuck pending payments by setting them to failed
UPDATE public.payments 
SET status = 'failed', 
    failed_at = now(),
    updated_at = now()
WHERE status = 'pending' 
  AND created_at < now() - interval '1 hour';

-- Clean up any stuck processing products by reverting them to pending
UPDATE public.product_submissions 
SET status = 'pending',
    updated_at = now()
WHERE status = 'processing' 
  AND updated_at < now() - interval '1 hour';
