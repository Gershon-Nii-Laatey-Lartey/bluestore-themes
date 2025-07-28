
-- Enable RLS on chat_conversations and chat_messages tables (if not already enabled)
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them to ensure they're correct
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can create conversations where they are a participant" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;

-- Create RLS policies for chat_conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.chat_conversations 
  FOR SELECT 
  USING (user_id = auth.uid() OR participant_id = auth.uid());

CREATE POLICY "Users can create conversations where they are a participant" 
  ON public.chat_conversations 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR participant_id = auth.uid());

CREATE POLICY "Users can update their own conversations" 
  ON public.chat_conversations 
  FOR UPDATE 
  USING (user_id = auth.uid() OR participant_id = auth.uid());

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view messages in their conversations" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations 
      WHERE id = conversation_id 
      AND (user_id = auth.uid() OR participant_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages in their conversations" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_conversations 
      WHERE id = conversation_id 
      AND (user_id = auth.uid() OR participant_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" 
  ON public.chat_messages 
  FOR UPDATE 
  USING (sender_id = auth.uid());

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_participant_id ON public.chat_conversations(participant_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_product_id ON public.chat_conversations(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Enable realtime for chat functionality
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_conversations REPLICA IDENTITY FULL;

-- Add tables to realtime publication (ignore errors if already added)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, continue
END
$$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication, continue
END
$$;
