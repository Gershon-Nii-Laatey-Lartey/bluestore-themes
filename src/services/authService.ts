
import { supabase } from "@/integrations/supabase/client";

class AuthService {
  async isAdmin(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Error in isAdmin check:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
