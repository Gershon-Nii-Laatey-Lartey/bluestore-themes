-- Add viewport tracking for better push notification support

-- Add viewport tracking fields to vendor_profiles
ALTER TABLE public.vendor_profiles 
ADD COLUMN viewport_visible BOOLEAN DEFAULT true,
ADD COLUMN last_viewport_change TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for viewport tracking
CREATE INDEX idx_vendor_profiles_viewport ON public.vendor_profiles(viewport_visible, last_viewport_change);

-- Function to update viewport status
CREATE OR REPLACE FUNCTION update_viewport_status(
  p_user_id UUID,
  p_viewport_visible BOOLEAN
)
RETURNS void AS $$
BEGIN
  UPDATE public.vendor_profiles 
  SET 
    viewport_visible = p_viewport_visible,
    last_viewport_change = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get users with hidden viewport (good for push notifications)
CREATE OR REPLACE FUNCTION get_users_with_hidden_viewport()
RETURNS TABLE(user_id UUID, last_viewport_change TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vp.user_id,
    vp.last_viewport_change
  FROM public.vendor_profiles vp
  WHERE 
    vp.viewport_visible = false 
    AND vp.last_viewport_change > (NOW() - INTERVAL '5 minutes')
    AND vp.is_online = true;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user should receive push notification based on viewport
CREATE OR REPLACE FUNCTION should_send_push_notification(
  p_user_id UUID,
  p_notification_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_viewport_visible BOOLEAN;
  v_is_online BOOLEAN;
  v_last_viewport_change TIMESTAMP WITH TIME ZONE;
  v_notification_preferences JSONB;
BEGIN
  -- Get user's viewport and online status
  SELECT 
    viewport_visible,
    is_online,
    last_viewport_change,
    notification_preferences
  INTO 
    v_viewport_visible,
    v_is_online,
    v_last_viewport_change,
    v_notification_preferences
  FROM public.vendor_profiles 
  WHERE user_id = p_user_id;
  
  -- If user is not found, don't send push
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- If viewport is visible, don't send push (user is actively using the app)
  IF v_viewport_visible = true THEN
    RETURN false;
  END IF;
  
  -- If user is offline, don't send push
  IF v_is_online = false THEN
    RETURN false;
  END IF;
  
  -- Check if viewport was hidden recently (within 5 minutes)
  IF v_last_viewport_change < (NOW() - INTERVAL '5 minutes') THEN
    RETURN false;
  END IF;
  
  -- Check notification preferences
  IF v_notification_preferences IS NOT NULL THEN
    IF v_notification_preferences->p_notification_type = 'true' THEN
      RETURN true;
    END IF;
  END IF;
  
  -- Default: don't send push
  RETURN false;
END;
$$ LANGUAGE plpgsql; 