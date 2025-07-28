
-- First, let's fix the database function to select the first available subscription with capacity
-- instead of just the newest one
CREATE OR REPLACE FUNCTION public.increment_user_ads_used(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  target_subscription_id uuid;
BEGIN
  -- Find the first active subscription that has available ad slots
  -- Priority: unexpired, unused capacity (used < allowed), oldest start date
  SELECT id INTO target_subscription_id
  FROM user_plan_subscriptions 
  WHERE user_id = user_uuid 
    AND status = 'active' 
    AND end_date > NOW()
    AND (ads_allowed IS NULL OR ads_used < ads_allowed)
  ORDER BY start_date ASC, created_at ASC
  LIMIT 1;
  
  -- Only update if we found a subscription with available capacity
  IF target_subscription_id IS NOT NULL THEN
    UPDATE user_plan_subscriptions 
    SET ads_used = ads_used + 1,
        updated_at = NOW()
    WHERE id = target_subscription_id;
    
    -- Log for debugging
    RAISE NOTICE 'Incremented ads_used for subscription ID: % (user: %)', target_subscription_id, user_uuid;
  ELSE
    RAISE NOTICE 'No subscription with available ad capacity found for user: %', user_uuid;
    -- Raise an exception so the calling code knows the operation failed
    RAISE EXCEPTION 'No active subscription with available ad capacity found for user %', user_uuid;
  END IF;
END;
$function$;

-- Clean up the current incorrect data by resetting ads_used to 0 for all subscriptions
-- This will give users a fresh start with correct tracking
UPDATE user_plan_subscriptions 
SET ads_used = 0, 
    updated_at = NOW()
WHERE status = 'active' 
  AND end_date > NOW();
