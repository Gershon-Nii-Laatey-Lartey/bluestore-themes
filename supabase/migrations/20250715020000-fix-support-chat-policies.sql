-- Fix support chat message policies to allow users to send messages
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can send messages in their sessions" ON public.support_chat_messages;

-- Create a more permissive policy
CREATE POLICY "Users can send messages in their sessions" ON public.support_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_chat_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Also add a policy for anonymous sessions
CREATE POLICY "Users can send messages to anonymous sessions" ON public.support_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_chat_sessions 
      WHERE id = session_id AND user_id IS NULL
    )
  ); 