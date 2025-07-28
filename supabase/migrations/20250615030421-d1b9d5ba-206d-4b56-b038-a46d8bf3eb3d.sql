
-- First, let's check if chat_messages table exists, if not create it
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE NULL
);

-- Enable RLS on chat_messages if not already enabled
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_messages (drop first if they exist)
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
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

DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.chat_messages;
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

DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
CREATE POLICY "Users can update their own messages" 
  ON public.chat_messages 
  FOR UPDATE 
  USING (sender_id = auth.uid());

-- Enable RLS on chat_conversations if not already enabled
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_conversations (drop first if they exist)
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
CREATE POLICY "Users can view their own conversations" 
  ON public.chat_conversations 
  FOR SELECT 
  USING (user_id = auth.uid() OR participant_id = auth.uid());

DROP POLICY IF EXISTS "Users can create conversations where they are a participant" ON public.chat_conversations;
CREATE POLICY "Users can create conversations where they are a participant" 
  ON public.chat_conversations 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR participant_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.chat_conversations;
CREATE POLICY "Users can update their own conversations" 
  ON public.chat_conversations 
  FOR UPDATE 
  USING (user_id = auth.uid() OR participant_id = auth.uid());

-- Add product_id column to chat_conversations if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_conversations' 
    AND column_name = 'product_id'
  ) THEN
    ALTER TABLE public.chat_conversations 
    ADD COLUMN product_id UUID REFERENCES public.product_submissions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_chat_conversations_product_id ON public.chat_conversations(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Enable realtime for chat functionality
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_conversations REPLICA IDENTITY FULL;

-- Add tables to realtime publication (this will ignore if already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
