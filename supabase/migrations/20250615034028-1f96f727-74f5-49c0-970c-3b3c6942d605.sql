
-- Add foreign key constraints to fix the chat functionality

-- Add foreign key constraint for chat_conversations.user_id -> profiles.id
ALTER TABLE public.chat_conversations 
ADD CONSTRAINT fk_chat_conversations_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for chat_conversations.participant_id -> profiles.id
ALTER TABLE public.chat_conversations 
ADD CONSTRAINT fk_chat_conversations_participant_id 
FOREIGN KEY (participant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for chat_conversations.product_id -> product_submissions.id
ALTER TABLE public.chat_conversations 
ADD CONSTRAINT fk_chat_conversations_product_id 
FOREIGN KEY (product_id) REFERENCES public.product_submissions(id) ON DELETE SET NULL;

-- Add foreign key constraint for chat_messages.conversation_id -> chat_conversations.id
ALTER TABLE public.chat_messages 
ADD CONSTRAINT fk_chat_messages_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;

-- Add foreign key constraint for chat_messages.sender_id -> profiles.id
ALTER TABLE public.chat_messages 
ADD CONSTRAINT fk_chat_messages_sender_id 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
