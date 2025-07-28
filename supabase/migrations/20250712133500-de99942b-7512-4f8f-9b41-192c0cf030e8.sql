
-- Create enum for CS worker roles
CREATE TYPE public.cs_worker_role AS ENUM (
  'customer_service_chat',
  'complaints_reports_manager', 
  'product_review',
  'general_access'
);

-- Create CS workers table
CREATE TABLE public.cs_workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  employee_id TEXT UNIQUE,
  hire_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT cs_workers_email_domain CHECK (email LIKE '%@bluestoreghana.com')
);

-- Create CS worker roles assignment table
CREATE TABLE public.cs_worker_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cs_worker_id UUID REFERENCES public.cs_workers(id) ON DELETE CASCADE NOT NULL,
  role cs_worker_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cs_worker_id, role)
);

-- Create work assignments table
CREATE TABLE public.cs_work_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cs_worker_id UUID REFERENCES public.cs_workers(id) ON DELETE CASCADE NOT NULL,
  work_type TEXT NOT NULL, -- 'product_review', 'customer_chat', 'complaint'
  work_item_id UUID NOT NULL, -- References product_submissions, chat_rooms, etc
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'escalated')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create CS chat queue table
CREATE TABLE public.cs_chat_queues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  cs_worker_id UUID REFERENCES public.cs_workers(id) ON DELETE SET NULL,
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'active', 'resolved')),
  customer_name TEXT,
  customer_email TEXT,
  initial_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create CS worker sessions for tracking online status
CREATE TABLE public.cs_worker_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cs_worker_id UUID REFERENCES public.cs_workers(id) ON DELETE CASCADE NOT NULL,
  login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logout_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'away', 'busy'))
);

-- Update user_roles enum to include CS worker types
ALTER TYPE public.app_role ADD VALUE 'cs_worker';
ALTER TYPE public.app_role ADD VALUE 'cs_supervisor';

-- Enable RLS on all new tables
ALTER TABLE public.cs_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cs_worker_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cs_work_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cs_chat_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cs_worker_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for CS workers table
CREATE POLICY "Admins can manage CS workers" ON public.cs_workers
  FOR ALL USING (is_admin());

CREATE POLICY "CS workers can view their own profile" ON public.cs_workers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "CS workers can update their own profile" ON public.cs_workers
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for CS worker roles
CREATE POLICY "Admins can manage CS worker roles" ON public.cs_worker_roles
  FOR ALL USING (is_admin());

CREATE POLICY "CS workers can view their own roles" ON public.cs_worker_roles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.cs_workers 
    WHERE id = cs_worker_id AND user_id = auth.uid()
  ));

-- RLS Policies for work assignments
CREATE POLICY "Admins can manage all assignments" ON public.cs_work_assignments
  FOR ALL USING (is_admin());

CREATE POLICY "CS workers can view their assignments" ON public.cs_work_assignments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.cs_workers 
    WHERE id = cs_worker_id AND user_id = auth.uid()
  ));

CREATE POLICY "CS workers can update their assignments" ON public.cs_work_assignments
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.cs_workers 
    WHERE id = cs_worker_id AND user_id = auth.uid()
  ));

-- RLS Policies for chat queues
CREATE POLICY "Admins can manage chat queues" ON public.cs_chat_queues
  FOR ALL USING (is_admin());

CREATE POLICY "CS workers can view assigned chats" ON public.cs_chat_queues
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.cs_workers 
    WHERE id = cs_worker_id AND user_id = auth.uid()
  ));

CREATE POLICY "CS workers can update assigned chats" ON public.cs_chat_queues
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.cs_workers 
    WHERE id = cs_worker_id AND user_id = auth.uid()
  ));

-- RLS Policies for worker sessions
CREATE POLICY "CS workers can manage their sessions" ON public.cs_worker_sessions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.cs_workers 
    WHERE id = cs_worker_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all sessions" ON public.cs_worker_sessions
  FOR SELECT USING (is_admin());

-- Create function to get next worker for round-robin assignment
CREATE OR REPLACE FUNCTION public.get_next_available_cs_worker(work_type TEXT, required_role cs_worker_role)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  worker_id UUID;
BEGIN
  -- Get the CS worker with the role who has the least current assignments
  SELECT cw.id INTO worker_id
  FROM public.cs_workers cw
  JOIN public.cs_worker_roles cwr ON cw.id = cwr.cs_worker_id
  LEFT JOIN public.cs_work_assignments cwa ON cw.id = cwa.cs_worker_id 
    AND cwa.status IN ('assigned', 'in_progress')
  WHERE cw.status = 'active' 
    AND cwr.role = required_role
    AND EXISTS (
      SELECT 1 FROM public.cs_worker_sessions cws 
      WHERE cws.cs_worker_id = cw.id 
        AND cws.status = 'online' 
        AND cws.logout_at IS NULL
    )
  GROUP BY cw.id, cw.created_at
  ORDER BY COUNT(cwa.id) ASC, cw.created_at ASC
  LIMIT 1;
  
  RETURN worker_id;
END;
$$;

-- Create function to assign product review to CS worker
CREATE OR REPLACE FUNCTION public.assign_product_to_cs_worker(product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  worker_id UUID;
BEGIN
  -- Get next available product review worker
  SELECT public.get_next_available_cs_worker('product_review', 'product_review'::cs_worker_role) INTO worker_id;
  
  IF worker_id IS NOT NULL THEN
    -- Create work assignment
    INSERT INTO public.cs_work_assignments (cs_worker_id, work_type, work_item_id)
    VALUES (worker_id, 'product_review', product_id);
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Create triggers to auto-assign product reviews
CREATE OR REPLACE FUNCTION public.auto_assign_product_review()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only assign if status is pending
  IF NEW.status = 'pending' THEN
    PERFORM public.assign_product_to_cs_worker(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_assign_product_review_trigger
  AFTER INSERT ON public.product_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_product_review();

-- Create function to check if user is CS worker
CREATE OR REPLACE FUNCTION public.is_cs_worker()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cs_workers 
    WHERE user_id = auth.uid() AND status = 'active'
  )
$$;

-- Create function to get CS worker roles
CREATE OR REPLACE FUNCTION public.get_cs_worker_roles(worker_user_id UUID)
RETURNS cs_worker_role[]
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(cwr.role)
  FROM public.cs_workers cw
  JOIN public.cs_worker_roles cwr ON cw.id = cwr.cs_worker_id
  WHERE cw.user_id = worker_user_id AND cw.status = 'active'
$$;
