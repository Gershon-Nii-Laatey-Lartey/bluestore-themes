
-- Add foreign key constraints to link chat tables to profiles
ALTER TABLE public.chat_conversations 
ADD CONSTRAINT fk_chat_conversations_user_profile 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.chat_conversations 
ADD CONSTRAINT fk_chat_conversations_participant_profile 
FOREIGN KEY (participant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.chat_messages 
ADD CONSTRAINT fk_chat_messages_sender_profile 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
