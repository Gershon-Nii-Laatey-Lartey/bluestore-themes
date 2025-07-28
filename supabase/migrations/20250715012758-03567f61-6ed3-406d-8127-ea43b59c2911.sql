-- Create tables for reporting system, live chat, case management, and terms

-- Product reports table
CREATE TABLE public.product_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.product_submissions(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('spam', 'inappropriate', 'fraud', 'fake', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed', 'transferred')),
  assigned_worker_id UUID REFERENCES public.cs_workers(id) ON DELETE SET NULL,
  case_number TEXT UNIQUE,
  transferred_to_admin BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Support chat sessions table
CREATE TABLE public.support_chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_name TEXT,
  visitor_email TEXT,
  assigned_worker_id UUID REFERENCES public.cs_workers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'resolved', 'transferred')),
  case_number TEXT UNIQUE,
  transferred_to_admin BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Support chat messages table
CREATE TABLE public.support_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.support_chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'visitor', 'worker', 'admin')),
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Case updates table for tracking admin case updates
CREATE TABLE public.case_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT NOT NULL,
  case_type TEXT NOT NULL CHECK (case_type IN ('report', 'chat')),
  update_type TEXT NOT NULL CHECK (update_type IN ('status_change', 'note', 'resolution', 'escalation')),
  message TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Terms and conditions content table
CREATE TABLE public.terms_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Generate case numbers automatically
CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  case_num TEXT;
  prefix TEXT;
  counter INTEGER;
BEGIN
  prefix := 'CASE' || TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Get the next sequence number for today
  SELECT COALESCE(MAX(CAST(RIGHT(case_number, 4) AS INTEGER)), 0) + 1
  INTO counter
  FROM (
    SELECT case_number FROM product_reports WHERE case_number LIKE prefix || '%'
    UNION ALL
    SELECT case_number FROM support_chat_sessions WHERE case_number LIKE prefix || '%'
  ) t;
  
  case_num := prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN case_num;
END;
$$;

-- Trigger to auto-generate case numbers for reports
CREATE OR REPLACE FUNCTION public.auto_generate_report_case_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.case_number IS NULL AND NEW.status = 'transferred' THEN
    NEW.case_number := public.generate_case_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_generate_report_case_number
  BEFORE UPDATE ON public.product_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_report_case_number();

-- Trigger to auto-generate case numbers for chats
CREATE OR REPLACE FUNCTION public.auto_generate_chat_case_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.case_number IS NULL AND NEW.status = 'transferred' THEN
    NEW.case_number := public.generate_case_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_generate_chat_case_number
  BEFORE UPDATE ON public.support_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_chat_case_number();

-- Update timestamps triggers
CREATE TRIGGER update_product_reports_updated_at
  BEFORE UPDATE ON public.product_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_chat_sessions_updated_at
  BEFORE UPDATE ON public.support_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_terms_content_updated_at
  BEFORE UPDATE ON public.terms_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all new tables
ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_reports
CREATE POLICY "Users can create reports" ON public.product_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.product_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins and CS workers can view all reports" ON public.product_reports
  FOR ALL USING (
    is_admin() OR 
    EXISTS (
      SELECT 1 FROM cs_workers 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- RLS Policies for support_chat_sessions
CREATE POLICY "Users can create and view their chat sessions" ON public.support_chat_sessions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can create anonymous chat sessions" ON public.support_chat_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "CS workers can view assigned sessions" ON public.support_chat_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cs_workers 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Admins can view all sessions" ON public.support_chat_sessions
  FOR ALL USING (is_admin());

-- RLS Policies for support_chat_messages
CREATE POLICY "Users can view messages in their sessions" ON public.support_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_chat_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their sessions" ON public.support_chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM support_chat_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "CS workers can view and send messages in assigned sessions" ON public.support_chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cs_workers cw
      JOIN support_chat_sessions scs ON scs.assigned_worker_id = cw.id
      WHERE cw.user_id = auth.uid() AND cw.status = 'active' AND scs.id = session_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cs_workers cw
      JOIN support_chat_sessions scs ON scs.assigned_worker_id = cw.id
      WHERE cw.user_id = auth.uid() AND cw.status = 'active' AND scs.id = session_id
    )
  );

CREATE POLICY "Anyone can send messages to anonymous sessions" ON public.support_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_chat_sessions 
      WHERE id = session_id AND user_id IS NULL
    )
  );

CREATE POLICY "Admins can manage all messages" ON public.support_chat_messages
  FOR ALL USING (is_admin());

-- RLS Policies for case_updates
CREATE POLICY "Admins can manage case updates" ON public.case_updates
  FOR ALL USING (is_admin());

CREATE POLICY "CS workers can view case updates" ON public.case_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cs_workers 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- RLS Policies for terms_content
CREATE POLICY "Anyone can view active terms" ON public.terms_content
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage terms content" ON public.terms_content
  FOR ALL USING (is_admin());

-- Insert default terms content
INSERT INTO public.terms_content (content, version, is_active) VALUES (
  'Default Terms and Conditions - Please update this content from the admin panel.',
  1,
  true
);

-- Update auth triggers to log logins
CREATE OR REPLACE FUNCTION public.log_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log all logins
  PERFORM log_audit_event(
    NEW.user_id,
    NULL,
    'USER_LOGIN',
    'User logged in',
    'authentication',
    NEW.id::text,
    NULL,
    jsonb_build_object('login_time', NEW.login_at)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for user logins (this will catch all auth events)
CREATE OR REPLACE TRIGGER trigger_log_user_login
  AFTER INSERT ON cs_worker_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_user_login();