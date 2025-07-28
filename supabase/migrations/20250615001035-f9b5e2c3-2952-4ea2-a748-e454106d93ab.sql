
-- First, let's see what products we currently have and approve more of them
UPDATE product_submissions 
SET status = 'approved' 
WHERE status = 'pending';

-- Let's also check if we have any products at all
-- This will help us understand the current state
