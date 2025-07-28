
-- First, let's make sure RLS is enabled on the user_plan_subscriptions table
ALTER TABLE public.user_plan_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_plan_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_plan_subscriptions;
DROP POLICY IF EXISTS "System can update subscriptions" ON public.user_plan_subscriptions;

-- Recreate the policies with better naming and structure
CREATE POLICY "user_plan_subscriptions_select_policy" 
  ON public.user_plan_subscriptions 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_plan_subscriptions_insert_policy" 
  ON public.user_plan_subscriptions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_plan_subscriptions_update_policy" 
  ON public.user_plan_subscriptions 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Also ensure the user_plan_features table has proper RLS
ALTER TABLE public.user_plan_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their subscription features" ON public.user_plan_features;
DROP POLICY IF EXISTS "System can manage subscription features" ON public.user_plan_features;

CREATE POLICY "user_plan_features_select_policy" 
  ON public.user_plan_features 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_plan_subscriptions 
      WHERE id = subscription_id 
      AND user_id = auth.uid()
    )
  );
