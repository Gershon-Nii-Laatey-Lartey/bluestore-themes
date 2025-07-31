-- Fix online status logic with proper 5-minute threshold

-- Update the trigger function to implement proper logic
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

-- Update the mark inactive users function
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