-- Add connection tracking for better push notification support

-- Add connection status field to vendor_profiles
ALTER TABLE public.vendor_profiles 
ADD COLUMN connection_status TEXT DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'away')),
ADD COLUMN last_ping TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN device_info JSONB DEFAULT '{}'::jsonb;

-- Create connection_sessions table for detailed tracking
CREATE TABLE public.connection_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  device_type TEXT CHECK (device_type IN ('web', 'mobile', 'desktop')),
  user_agent TEXT,
  ip_address INET,
  location JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for connection tracking
CREATE INDEX idx_connection_sessions_user_id ON public.connection_sessions(user_id);
CREATE INDEX idx_connection_sessions_active ON public.connection_sessions(is_active);
CREATE INDEX idx_vendor_profiles_connection ON public.vendor_profiles(connection_status, last_ping);

-- Enable RLS on connection_sessions
ALTER TABLE public.connection_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for connection_sessions
CREATE POLICY "Users can view their own connection sessions" 
  ON public.connection_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connection sessions" 
  ON public.connection_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connection sessions" 
  ON public.connection_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to start a new connection session
CREATE OR REPLACE FUNCTION start_connection_session(
  p_user_id UUID,
  p_device_type TEXT DEFAULT 'web',
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  session_id UUID;
BEGIN
  -- End any existing active sessions for this user
  UPDATE public.connection_sessions 
  SET session_end = now(), is_active = false
  WHERE user_id = p_user_id AND is_active = true;
  
  -- Start new session
  INSERT INTO public.connection_sessions (
    user_id, device_type, user_agent, ip_address
  ) VALUES (
    p_user_id, p_device_type, p_user_agent, p_ip_address
  ) RETURNING id INTO session_id;
  
  -- Update vendor profile connection status
  UPDATE public.vendor_profiles 
  SET 
    connection_status = 'connected',
    last_ping = now(),
    is_online = true
  WHERE user_id = p_user_id;
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to end a connection session
CREATE OR REPLACE FUNCTION end_connection_session(p_session_id UUID)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id from session
  SELECT user_id INTO v_user_id 
  FROM public.connection_sessions 
  WHERE id = p_session_id;
  
  -- End the session
  UPDATE public.connection_sessions 
  SET 
    session_end = now(), 
    is_active = false
  WHERE id = p_session_id;
  
  -- Update vendor profile if no other active sessions
  IF NOT EXISTS (
    SELECT 1 FROM public.connection_sessions 
    WHERE user_id = v_user_id AND is_active = true
  ) THEN
    UPDATE public.vendor_profiles 
    SET 
      connection_status = 'disconnected',
      is_online = false
    WHERE user_id = v_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update last ping
CREATE OR REPLACE FUNCTION update_last_ping(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.vendor_profiles 
  SET 
    last_ping = now(),
    connection_status = 'connected'
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql; 