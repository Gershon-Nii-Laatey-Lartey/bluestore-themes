
-- Create tables to track user activities for profile stats
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS for user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for user_favorites
CREATE POLICY "Users can view their own favorites" 
  ON public.user_favorites 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" 
  ON public.user_favorites 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create a table for chat conversations to track real chat count
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, participant_id)
);

-- Enable RLS for chat_conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for chat_conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.chat_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = participant_id);

CREATE POLICY "Users can create conversations" 
  ON public.chat_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create a table for product submissions if it doesn't exist in Supabase
CREATE TABLE IF NOT EXISTS public.product_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  negotiable BOOLEAN DEFAULT false,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for product_submissions
ALTER TABLE public.product_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for product_submissions
CREATE POLICY "Users can view their own submissions" 
  ON public.product_submissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own submissions" 
  ON public.product_submissions 
  FOR ALL 
  USING (auth.uid() = user_id);
