
-- Add a column to track the original price before editing for clearance sales display
ALTER TABLE public.product_submissions 
ADD COLUMN IF NOT EXISTS previous_price numeric;

-- Update the trigger or add logic to store the previous price when a product is edited
-- This will help us show price changes on clearance sales page
CREATE OR REPLACE FUNCTION public.track_price_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If the price is being changed and the product is being edited
  IF OLD.price IS DISTINCT FROM NEW.price AND NEW.edited = true THEN
    -- Store the old price in previous_price if it's not already set
    IF NEW.previous_price IS NULL THEN
      NEW.previous_price = OLD.price;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to track price changes
DROP TRIGGER IF EXISTS track_price_changes_trigger ON public.product_submissions;
CREATE TRIGGER track_price_changes_trigger
  BEFORE UPDATE ON public.product_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.track_price_changes();
