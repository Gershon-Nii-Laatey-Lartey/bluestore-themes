
-- First, let's clean up the duplicate RLS policies
DROP POLICY IF EXISTS "Users can create conversations where they are a participant" ON public.chat_conversations;

-- Recreate the policy with a cleaner name to avoid confusion
CREATE POLICY "Users can insert conversations where they participate" 
  ON public.chat_conversations 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR participant_id = auth.uid());

-- Only add foreign key constraints that don't already exist
-- Check if constraint exists before adding it
DO $$
BEGIN
    -- Add foreign key constraint for chat_conversations.product_id -> product_submissions.id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_chat_conversations_product_id'
    ) THEN
        ALTER TABLE public.chat_conversations 
        ADD CONSTRAINT fk_chat_conversations_product_id 
        FOREIGN KEY (product_id) REFERENCES public.product_submissions(id) ON DELETE SET NULL;
    END IF;

    -- Add foreign key constraint for chat_messages.conversation_id -> chat_conversations.id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_chat_messages_conversation_id'
    ) THEN
        ALTER TABLE public.chat_messages 
        ADD CONSTRAINT fk_chat_messages_conversation_id 
        FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key constraint for chat_messages.sender_id -> profiles.id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_chat_messages_sender_id'
    ) THEN
        ALTER TABLE public.chat_messages 
        ADD CONSTRAINT fk_chat_messages_sender_id 
        FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Create indexes for better query performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_participant 
ON public.chat_conversations(user_id, participant_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_sender 
ON public.chat_messages(conversation_id, sender_id);
