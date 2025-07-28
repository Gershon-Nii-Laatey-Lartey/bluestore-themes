
-- First, let's enable RLS on all tables if not already enabled
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them to ensure consistency
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view their chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms as buyer" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can update their chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can send messages in their chat rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update messages in their chat rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view read receipts for their messages" ON public.message_read_receipts;
DROP POLICY IF EXISTS "Users can create read receipts" ON public.message_read_receipts;

-- Create policies for chat_rooms table
CREATE POLICY "Users can view their chat rooms" 
  ON public.chat_rooms 
  FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create chat rooms as buyer" 
  ON public.chat_rooms 
  FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their chat rooms" 
  ON public.chat_rooms 
  FOR UPDATE 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create policies for chat_messages table
CREATE POLICY "Users can view messages in their chat rooms" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE chat_rooms.id = chat_messages.room_id 
      AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their chat rooms" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE chat_rooms.id = chat_messages.room_id 
      AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can update messages in their chat rooms" 
  ON public.chat_messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE chat_rooms.id = chat_messages.room_id 
      AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid())
    )
  );

-- Create policies for message_read_receipts table
CREATE POLICY "Users can view read receipts for their messages" 
  ON public.message_read_receipts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create read receipts" 
  ON public.message_read_receipts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
