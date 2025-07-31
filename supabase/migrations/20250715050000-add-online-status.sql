-- Add online status fields to vendor_profiles table
ALTER TABLE public.vendor_profiles 
ADD COLUMN is_online BOOLEAN DEFAULT false,
ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN online_status_preference TEXT DEFAULT 'auto' CHECK (online_status_preference IN ('auto', 'always_online', 'always_offline', 'manual'));

-- Create user_activity table for tracking online status
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'logout', 'page_view', 'chat_message', 'product_view', 'heartbeat')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_timestamp ON public.user_activity(timestamp);
CREATE INDEX idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX idx_vendor_profiles_online_status ON public.vendor_profiles(is_online, last_seen);

-- Enable RLS on user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_activity
CREATE POLICY "Users can view their own activity" 
  ON public.user_activity 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" 
  ON public.user_activity 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to update user online status
CREATE OR REPLACE FUNCTION update_user_online_status()
RETURNS TRIGGER AS $$
DECLARE
  vendor_preference TEXT;
  should_be_online BOOLEAN;
  last_seen_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get vendor profile preference and last seen
  SELECT online_status_preference, last_seen INTO vendor_preference, last_seen_time
  FROM public.vendor_profiles 
  WHERE user_id = NEW.user_id;
  
  -- If no vendor profile exists, don't update
  IF vendor_preference IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Determine if user should be online based on preference and activity
  CASE vendor_preference
    WHEN 'always_online' THEN
      should_be_online := TRUE;
    WHEN 'always_offline' THEN
      should_be_online := FALSE;
    WHEN 'manual' THEN
      -- Keep current status for manual mode
      SELECT is_online INTO should_be_online
      FROM public.vendor_profiles 
      WHERE user_id = NEW.user_id;
    WHEN 'auto' THEN
      -- For auto mode, check if activity is recent (within 5 minutes)
      IF NEW.activity_type = 'logout' THEN
        should_be_online := FALSE;
      ELSE
        should_be_online := (EXTRACT(EPOCH FROM (NOW() - last_seen_time)) / 60) <= 5;
      END IF;
    ELSE
      -- Default to auto behavior
      IF NEW.activity_type = 'logout' THEN
        should_be_online := FALSE;
      ELSE
        should_be_online := (EXTRACT(EPOCH FROM (NOW() - last_seen_time)) / 60) <= 5;
      END IF;
  END CASE;
  
  -- Update vendor profile status
  UPDATE public.vendor_profiles 
  SET 
    is_online = should_be_online,
    last_seen = NEW.timestamp
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update online status
CREATE TRIGGER update_online_status_trigger
  AFTER INSERT ON public.user_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_user_online_status();

-- Create function to mark users as offline after inactivity
CREATE OR REPLACE FUNCTION mark_inactive_users_offline()
RETURNS void AS $$
BEGIN
  UPDATE public.vendor_profiles 
  SET 
    is_online = false
  WHERE 
    is_online = true 
    AND online_status_preference = 'auto'
    AND last_seen < (NOW() - INTERVAL '5 minutes');
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run every minute (this will be set up in Supabase dashboard)
-- SELECT cron.schedule('mark-inactive-users-offline', '* * * * *', 'SELECT mark_inactive_users_offline();'); 