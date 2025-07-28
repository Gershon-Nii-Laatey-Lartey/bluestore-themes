
-- Check and add foreign key constraints only if they don't exist
DO $$
BEGIN
    -- Add foreign key constraint for chat_conversations.user_id -> profiles.id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_chat_conversations_user_id' 
        AND table_name = 'chat_conversations'
    ) THEN
        ALTER TABLE public.chat_conversations 
        ADD CONSTRAINT fk_chat_conversations_user_id 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key constraint for chat_conversations.participant_id -> profiles.id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_chat_conversations_participant_id' 
        AND table_name = 'chat_conversations'
    ) THEN
        ALTER TABLE public.chat_conversations 
        ADD CONSTRAINT fk_chat_conversations_participant_id 
        FOREIGN KEY (participant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key constraint for chat_messages.sender_id -> profiles.id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_chat_messages_sender_id' 
        AND table_name = 'chat_messages'
    ) THEN
        ALTER TABLE public.chat_messages 
        ADD CONSTRAINT fk_chat_messages_sender_id 
        FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Enable RLS on chat tables (these commands are safe to run even if already enabled)
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them to ensure they're correct
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can insert conversations where they participate" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;

-- Create RLS policies for chat_conversations
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
