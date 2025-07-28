
-- Fix the increment_user_ads_used function to update the newest active subscription instead of oldest
CREATE OR REPLACE FUNCTION public.increment_user_ads_used(user_uuid uuid)
RETURNS void
LANGUAGE sql
AS $function$
  UPDATE user_plan_subscriptions 
  SET ads_used = ads_used + 1,
      updated_at = NOW()
  WHERE user_id = user_uuid 
    AND status = 'active' 
    AND end_date > NOW()
    AND id = (
      SELECT id FROM user_plan_subscriptions
      WHERE user_id = user_uuid 
        AND status = 'active' 
        AND end_date > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    );
$function$
