-- Create trigger to log authentication events
CREATE OR REPLACE FUNCTION public.log_auth_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  worker_name text;
  worker_email text;
BEGIN
  -- Check if this is a CS worker
  SELECT cw.full_name, cw.email INTO worker_name, worker_email
  FROM cs_workers cw
  WHERE cw.user_id = NEW.user_id;

  -- If it's a CS worker, log the login
  IF worker_name IS NOT NULL THEN
    PERFORM log_audit_event(
      NEW.user_id,
      NULL,
      'CS_WORKER_LOGIN',
      worker_name || ' (' || worker_email || ') signed in',
      'authentication',
      NEW.id::text,
      NULL,
      jsonb_build_object('login_time', NEW.login_at, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for CS worker sessions
CREATE TRIGGER audit_cs_worker_sessions
  AFTER INSERT ON public.cs_worker_sessions
  FOR EACH ROW
  EXECUTE FUNCTION log_auth_events();