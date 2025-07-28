
-- Create a more robust version of the increment function
CREATE OR REPLACE FUNCTION public.increment_user_ads_used(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  latest_subscription_id uuid;
BEGIN
  -- First, find the ID of the newest active subscription
  SELECT id INTO latest_subscription_id
  FROM user_plan_subscriptions 
  WHERE user_id = user_uuid 
    AND status = 'active' 
    AND end_date > NOW()
  ORDER BY created_at DESC, id DESC
  LIMIT 1;
  
  -- Only update if we found a subscription
  IF latest_subscription_id IS NOT NULL THEN
    UPDATE user_plan_subscriptions 
    SET ads_used = ads_used + 1,
        updated_at = NOW()
    WHERE id = latest_subscription_id;
    
    -- Log for debugging
    RAISE NOTICE 'Incremented ads_used for subscription ID: %', latest_subscription_id;
  ELSE
    RAISE NOTICE 'No active subscription found for user: %', user_uuid;
  END IF;
END;
$function$
