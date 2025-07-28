
-- Add a trigger to automatically expire free ads after 7 days
CREATE OR REPLACE FUNCTION expire_free_ads()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_submissions 
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'approved' 
    AND (package->>'id' = 'free' OR package IS NULL)
    AND created_at <= NOW() - INTERVAL '7 days';
END;
$$;

-- Create a function that users can call to renew expired free ads
CREATE OR REPLACE FUNCTION renew_free_ad(ad_id uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  current_free_ads_count integer;
  ad_record product_submissions;
BEGIN
  -- Get the ad record and verify ownership
  SELECT * INTO ad_record 
  FROM product_submissions 
  WHERE id = ad_id AND user_id = user_uuid;
  
  -- Check if ad exists and belongs to user
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if it's a free ad and expired
  IF (ad_record.package->>'id' != 'free' AND ad_record.package IS NOT NULL) 
     OR ad_record.status != 'expired' THEN
    RETURN false;
  END IF;
  
  -- Count current active free ads for the user
  SELECT COUNT(*) INTO current_free_ads_count
  FROM product_submissions 
  WHERE user_id = user_uuid 
    AND status IN ('approved', 'pending')
    AND (package->>'id' = 'free' OR package IS NULL);
  
  -- Check if user has space for another free ad (limit is 5)
  IF current_free_ads_count >= 5 THEN
    RETURN false;
  END IF;
  
  -- Renew the ad by setting it back to pending and updating created_at
  UPDATE product_submissions 
  SET status = 'pending',
      created_at = NOW(),
      updated_at = NOW()
  WHERE id = ad_id;
  
  RETURN true;
END;
$$;

-- Update the can_user_post_ad function to use 5 ads limit for free users
CREATE OR REPLACE FUNCTION can_user_post_ad(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  user_plan user_plan_subscriptions;
BEGIN
  SELECT * INTO user_plan FROM get_user_active_plan(user_uuid);
  
  -- If no active plan, check free limit (now 5 ads)
  IF user_plan IS NULL THEN
    RETURN (
      SELECT COUNT(*) FROM product_submissions 
      WHERE user_id = user_uuid 
        AND status IN ('approved', 'pending')
        AND (package->>'id' = 'free' OR package IS NULL)
    ) < 5;
  END IF;
  
  -- If unlimited ads
  IF user_plan.ads_allowed IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if under limit
  RETURN user_plan.ads_used < user_plan.ads_allowed;
END;
$$;
