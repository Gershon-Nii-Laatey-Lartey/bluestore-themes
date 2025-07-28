
-- Add package_price column to product_submissions for better ranking
ALTER TABLE product_submissions 
ADD COLUMN package_price numeric DEFAULT 0;

-- Update existing records to set package_price based on their package data
UPDATE product_submissions 
SET package_price = CASE 
  WHEN package->>'id' = 'free' THEN 0
  WHEN package->>'id' = 'starter' THEN 15
  WHEN package->>'id' = 'standard' THEN 30
  WHEN package->>'id' = 'rising' THEN 50
  WHEN package->>'id' = 'pro' THEN 120
  WHEN package->>'id' = 'business' THEN 250
  WHEN package->>'id' = 'premium' THEN 500
  ELSE 0
END
WHERE package IS NOT NULL;

-- Create function to calculate priority score for ad ranking
CREATE OR REPLACE FUNCTION calculate_priority_score(package_price numeric, created_at timestamp with time zone)
RETURNS numeric AS $$
BEGIN
  -- Higher package price gets higher base score
  -- Recent ads get slight boost (time decay factor)
  RETURN package_price * 100 + 
         EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 * -0.1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create index for better performance on package-based queries
CREATE INDEX IF NOT EXISTS idx_product_submissions_package_price_status 
ON product_submissions(package_price DESC, status, created_at DESC);
