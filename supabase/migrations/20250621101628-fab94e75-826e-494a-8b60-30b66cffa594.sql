
-- Create RLS policies for user_plan_subscriptions table
CREATE POLICY "Users can view their own subscriptions" 
  ON public.user_plan_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
  ON public.user_plan_subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update subscriptions" 
  ON public.user_plan_subscriptions 
  FOR UPDATE 
  USING (true);

-- Also add policies for user_plan_features table if it doesn't have them
CREATE POLICY "Users can view their subscription features" 
  ON public.user_plan_features 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_plan_subscriptions 
      WHERE id = subscription_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage subscription features" 
  ON public.user_plan_features 
  FOR ALL 
  USING (true);
