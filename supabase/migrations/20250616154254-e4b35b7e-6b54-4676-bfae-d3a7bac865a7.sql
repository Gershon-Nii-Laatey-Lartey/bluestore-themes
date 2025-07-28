
-- Add rejection_reason column to product_submissions table
ALTER TABLE public.product_submissions 
ADD COLUMN rejection_reason TEXT;

-- Add processing status option (extend the existing status check if it exists)
-- First check if there's a constraint on status, if so we need to modify it
ALTER TABLE public.product_submissions 
DROP CONSTRAINT IF EXISTS product_submissions_status_check;

-- Add the new constraint with processing status
ALTER TABLE public.product_submissions 
ADD CONSTRAINT product_submissions_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'closed', 'processing'));

-- Add main_image_index to track which image is the main one
ALTER TABLE public.product_submissions 
ADD COLUMN main_image_index INTEGER DEFAULT 0;
