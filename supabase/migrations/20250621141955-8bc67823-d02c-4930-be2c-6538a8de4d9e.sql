
-- Remove the unique constraint that prevents multiple active subscriptions of the same plan type
ALTER TABLE user_plan_subscriptions 
DROP CONSTRAINT IF EXISTS user_plan_subscriptions_user_id_plan_type_status_key;

-- Also remove any similar constraints that might exist
ALTER TABLE user_plan_subscriptions 
DROP CONSTRAINT IF EXISTS user_plan_subscriptions_unique_active_plan;
