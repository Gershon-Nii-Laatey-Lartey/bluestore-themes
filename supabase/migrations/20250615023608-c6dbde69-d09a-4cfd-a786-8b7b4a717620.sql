
-- Create function to send notification when KYC is approved
CREATE OR REPLACE FUNCTION notify_kyc_approved()
RETURNS trigger AS $$
BEGIN
  -- Only send notification if status changed to approved
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'KYC Verification Approved',
      'Congratulations! Your KYC verification has been approved. You can now access all vendor features.',
      'success'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for KYC approval notifications
CREATE TRIGGER kyc_approval_notification
  AFTER UPDATE ON public.kyc_submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_kyc_approved();
