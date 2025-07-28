
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can update their chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can view their chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view basic profile info for chat" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view vendor profiles for chat" ON public.vendor_profiles;
DROP POLICY IF EXISTS "Users can manage own vendor profiles" ON public.vendor_profiles;
DROP POLICY IF EXISTS "Users can view approved products" ON public.product_submissions;
DROP POLICY IF EXISTS "Users can manage own products" ON public.product_submissions;

-- Enable RLS on all required tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view basic profile info for chat" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profiles" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create policies for vendor_profiles table
CREATE POLICY "Users can view vendor profiles for chat" 
ON public.vendor_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage own vendor profiles" 
ON public.vendor_profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for product_submissions table
CREATE POLICY "Users can view approved products" 
ON public.product_submissions 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Users can manage own products" 
ON public.product_submissions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for chat_rooms table
CREATE POLICY "Users can view their chat rooms" 
ON public.chat_rooms 
FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create chat rooms" 
ON public.chat_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can update their chat rooms" 
ON public.chat_rooms 
FOR UPDATE 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create policies for chat_messages table
CREATE POLICY "Users can view their chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = room_id 
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

CREATE POLICY "Users can send chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = room_id 
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

CREATE POLICY "Users can update their messages" 
ON public.chat_messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = room_id 
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);
