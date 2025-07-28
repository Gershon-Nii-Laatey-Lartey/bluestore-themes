
import { supabase } from "@/integrations/supabase/client";

export interface CSWorker {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  employee_id?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  roles?: CSWorkerRole[];
}

export interface CSWorkerRole {
  id: string;
  cs_worker_id: string;
  role: 'customer_service_chat' | 'complaints_reports_manager' | 'product_review' | 'general_access';
  assigned_by: string;
  assigned_at: string;
}

export interface CSWorkAssignment {
  id: string;
  cs_worker_id: string;
  work_type: string;
  work_item_id: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'escalated';
  assigned_at: string;
  completed_at?: string;
  notes?: string;
}

export interface CSChatQueue {
  id: string;
  chat_room_id: string;
  cs_worker_id?: string;
  priority: number;
  status: 'pending' | 'assigned' | 'active' | 'resolved';
  customer_name?: string;
  customer_email?: string;
  initial_message?: string;
  created_at: string;
  assigned_at?: string;
  resolved_at?: string;
}

export const csService = {
  // CS Worker Management
  async getAllCSWorkers(): Promise<CSWorker[]> {
    console.log('Fetching all CS workers...');
    const { data, error } = await supabase
      .from('cs_workers')
      .select(`
        *,
        cs_worker_roles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching CS workers:', error);
      throw error;
    }

    return (data || []).map(worker => ({
      ...worker,
      status: worker.status as 'active' | 'inactive' | 'suspended',
      roles: (worker.cs_worker_roles || []).map((role: any) => ({
        ...role,
        role: role.role as 'customer_service_chat' | 'complaints_reports_manager' | 'product_review' | 'general_access'
      }))
    }));
  },

  async createCSWorker(workerData: {
    email_head: string;
    full_name: string;
    phone?: string;
    password: string;
    roles: string[];
  }): Promise<CSWorker & { password: string }> {
    console.log('Creating CS worker:', workerData);

    const { data, error } = await supabase.functions.invoke('create-cs-worker', {
      body: workerData
    });

    if (error) {
      console.error('Error creating CS worker:', error);
      throw new Error(error.message || 'Failed to create CS worker');
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to create CS worker');
    }

    return {
      ...data.worker,
      status: data.worker.status as 'active' | 'inactive' | 'suspended',
      password: data.password
    };
  },

  async updateCSWorkerStatus(workerId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    const { error } = await supabase
      .from('cs_workers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', workerId);

    if (error) {
      console.error('Error updating CS worker status:', error);
      throw error;
    }
  },

  async assignRoleToWorker(workerId: string, role: 'customer_service_chat' | 'complaints_reports_manager' | 'product_review' | 'general_access'): Promise<void> {
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('cs_worker_roles')
      .insert({
        cs_worker_id: workerId,
        role: role,
        assigned_by: currentUser.data.user.id
      });

    if (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  },

  async removeRoleFromWorker(workerId: string, role: string): Promise<void> {
    // Cast string to proper role type
    const validRole = role as 'customer_service_chat' | 'complaints_reports_manager' | 'product_review' | 'general_access';
    
    const { error } = await supabase
      .from('cs_worker_roles')
      .delete()
      .eq('cs_worker_id', workerId)
      .eq('role', validRole);

    if (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  },

  // Work Assignment Management
  async getWorkerAssignments(workerId: string): Promise<CSWorkAssignment[]> {
    const { data, error } = await supabase
      .from('cs_work_assignments')
      .select('*')
      .eq('cs_worker_id', workerId)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching worker assignments:', error);
      throw error;
    }

    return (data || []).map(assignment => ({
      ...assignment,
      status: assignment.status as 'assigned' | 'in_progress' | 'completed' | 'escalated'
    }));
  },

  async updateAssignmentStatus(assignmentId: string, status: 'assigned' | 'in_progress' | 'completed' | 'escalated', notes?: string): Promise<void> {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (notes) {
      updateData.notes = notes;
    }

    const { error } = await supabase
      .from('cs_work_assignments')
      .update(updateData)
      .eq('id', assignmentId);

    if (error) {
      console.error('Error updating assignment status:', error);
      throw error;
    }
  },

  // Chat Queue Management
  async getChatQueue(): Promise<CSChatQueue[]> {
    const { data, error } = await supabase
      .from('cs_chat_queues')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat queue:', error);
      throw error;
    }

    return (data || []).map(queue => ({
      ...queue,
      status: queue.status as 'pending' | 'assigned' | 'active' | 'resolved'
    }));
  },

  async assignChatToWorker(chatQueueId: string, workerId: string): Promise<void> {
    const { error } = await supabase
      .from('cs_chat_queues')
      .update({
        cs_worker_id: workerId,
        status: 'assigned',
        assigned_at: new Date().toISOString()
      })
      .eq('id', chatQueueId);

    if (error) {
      console.error('Error assigning chat to worker:', error);
      throw error;
    }
  },

  // Session Management
  async startWorkerSession(workerId: string): Promise<void> {
    const { error } = await supabase
      .from('cs_worker_sessions')
      .insert({
        cs_worker_id: workerId,
        status: 'online'
      });

    if (error) {
      console.error('Error starting worker session:', error);
      throw error;
    }
  },

  async endWorkerSession(workerId: string): Promise<void> {
    const { error } = await supabase
      .from('cs_worker_sessions')
      .update({
        logout_at: new Date().toISOString(),
        status: 'offline'
      })
      .eq('cs_worker_id', workerId)
      .is('logout_at', null);

    if (error) {
      console.error('Error ending worker session:', error);
      throw error;
    }
  },

  // Check if current user is CS worker
  async isCSWorker(): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_cs_worker');
    if (error) {
      console.error('Error checking CS worker status:', error);
      return false;
    }
    return data || false;
  },

  async changeCSWorkerPassword(userId: string, newPassword: string): Promise<void> {
    try {
      // Use edge function to change password with service role permissions
      const { error } = await supabase.functions.invoke('create-cs-worker', {
        body: { 
          action: 'change_password',
          user_id: userId, 
          new_password: newPassword 
        }
      });

      if (error) {
        console.error('Error changing CS worker password:', error);
        throw error;
      }

      // Log audit event
      const { error: auditError } = await supabase.rpc('log_audit_event', {
        p_action_type: 'CS_WORKER_PASSWORD_CHANGE',
        p_action_description: `CS worker password was changed`,
        p_entity_type: 'cs_worker',
        p_entity_id: userId
      });

      if (auditError) {
        console.error('Error logging audit event:', auditError);
      }
    } catch (error) {
      console.error('Error changing CS worker password:', error);
      throw error;
    }
  },

  // Get current CS worker profile
  async getCurrentCSWorker(): Promise<CSWorker | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('cs_workers')
      .select(`
        *,
        cs_worker_roles(*)
      `)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching current CS worker:', error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      status: data.status as 'active' | 'inactive' | 'suspended',
      roles: (data.cs_worker_roles || []).map((role: any) => ({
        ...role,
        role: role.role as 'customer_service_chat' | 'complaints_reports_manager' | 'product_review' | 'general_access'
      }))
    };
  }
};
