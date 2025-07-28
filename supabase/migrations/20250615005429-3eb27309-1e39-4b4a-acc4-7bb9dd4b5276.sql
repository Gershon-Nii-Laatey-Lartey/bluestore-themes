
-- Add the missing RLS policy for inserting notifications (needed for the trigger)
CREATE POLICY "Allow system to insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);
