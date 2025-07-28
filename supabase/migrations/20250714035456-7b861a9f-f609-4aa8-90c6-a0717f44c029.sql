-- Create audit log table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cs_worker_id uuid REFERENCES cs_workers(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  action_description text NOT NULL,
  entity_type text,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (is_admin());

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Add generated password field to cs_workers
ALTER TABLE public.cs_workers 
ADD COLUMN generated_password text;

-- Create index for better performance
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid DEFAULT auth.uid(),
  p_cs_worker_id uuid DEFAULT NULL,
  p_action_type text DEFAULT NULL,
  p_action_description text DEFAULT NULL,
  p_entity_type text DEFAULT NULL,
  p_entity_id text DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    cs_worker_id,
    action_type,
    action_description,
    entity_type,
    entity_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_cs_worker_id,
    p_action_type,
    p_action_description,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    p_ip_address,
    p_user_agent
  );
END;
$$;

-- Create trigger to log CS worker status changes
CREATE OR REPLACE FUNCTION public.log_cs_worker_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM log_audit_event(
      auth.uid(),
      NEW.id,
      'CS_WORKER_STATUS_CHANGE',
      'CS worker status changed from ' || OLD.status || ' to ' || NEW.status,
      'cs_worker',
      NEW.id::text,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_cs_worker_status_changes
  AFTER UPDATE ON public.cs_workers
  FOR EACH ROW
  EXECUTE FUNCTION log_cs_worker_status_change();

-- Create trigger to log product review approvals
CREATE OR REPLACE FUNCTION public.log_product_review_action()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    PERFORM log_audit_event(
      auth.uid(),
      NULL,
      'PRODUCT_REVIEW',
      'Product "' || NEW.title || '" ' || NEW.status || CASE 
        WHEN NEW.rejection_reason IS NOT NULL THEN ' with reason: ' || NEW.rejection_reason
        ELSE ''
      END,
      'product_submission',
      NEW.id::text,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'rejection_reason', NEW.rejection_reason)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_product_reviews
  AFTER UPDATE ON public.product_submissions
  FOR EACH ROW
  EXECUTE FUNCTION log_product_review_action();

-- Create trigger to log KYC review actions  
CREATE OR REPLACE FUNCTION public.log_kyc_review_action()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    PERFORM log_audit_event(
      auth.uid(),
      NULL,
      'KYC_REVIEW',
      'KYC submission for "' || NEW.store_name || '" ' || NEW.status || CASE 
        WHEN NEW.rejection_reason IS NOT NULL THEN ' with reason: ' || NEW.rejection_reason
        ELSE ''
      END,
      'kyc_submission',
      NEW.id::text,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'rejection_reason', NEW.rejection_reason)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_kyc_reviews
  AFTER UPDATE ON public.kyc_submissions
  FOR EACH ROW
  EXECUTE FUNCTION log_kyc_review_action();