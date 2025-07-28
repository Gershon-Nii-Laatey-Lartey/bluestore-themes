
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add edited field to product_submissions to track if a product was edited
ALTER TABLE public.product_submissions 
ADD COLUMN edited boolean DEFAULT false;

-- Create function to send notification when product is approved
CREATE OR REPLACE FUNCTION notify_product_approved()
RETURNS trigger AS $$
BEGIN
  -- Only send notification if status changed to approved
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'Product Approved',
      'Your product "' || NEW.title || '" has been approved and is now live!',
      'success'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product approval notifications
CREATE TRIGGER product_approval_notification
  AFTER UPDATE ON public.product_submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_product_approved();
