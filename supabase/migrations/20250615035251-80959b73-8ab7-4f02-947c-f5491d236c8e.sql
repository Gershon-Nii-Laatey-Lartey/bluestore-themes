
-- First, let's check what policies already exist and drop them if needed to recreate
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can insert conversations where they participate" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;

-- Now create the RLS policies for chat_conversations table
CREATE POLICY "Users can view their own conversations" 
  ON public.chat_conversations 
  FOR SELECT 
  USING (user_id = auth.uid() OR participant_id = auth.uid());

CREATE POLICY "Users can insert conversations where they participate" 
  ON public.chat_conversations 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR participant_id = auth.uid());

CREATE POLICY "Users can update their own conversations" 
  ON public.chat_conversations 
  FOR UPDATE 
  USING (user_id = auth.uid() OR participant_id = auth.uid());

-- Create RLS policies for chat_messages table
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

-- Enable RLS on both tables (in case it wasn't enabled)
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
