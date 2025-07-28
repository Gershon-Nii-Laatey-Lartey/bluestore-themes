
-- Add 'closed' as a valid status for product submissions
ALTER TABLE product_submissions 
DROP CONSTRAINT IF EXISTS product_submissions_status_check;

ALTER TABLE product_submissions 
ADD CONSTRAINT product_submissions_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'closed'));

-- Create RLS policies to allow users to update and delete their own product submissions
ALTER TABLE product_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own submissions (including closed ones)
CREATE POLICY "Users can view their own product submissions" 
ON product_submissions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for users to update their own submissions
CREATE POLICY "Users can update their own product submissions" 
ON product_submissions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy for users to delete their own submissions
CREATE POLICY "Users can delete their own product submissions" 
ON product_submissions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Policy for public to view only approved products (not closed)
CREATE POLICY "Public can view approved products" 
ON product_submissions 
FOR SELECT 
USING (status = 'approved');

-- Policy for users to insert their own submissions
CREATE POLICY "Users can insert their own product submissions" 
ON product_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
