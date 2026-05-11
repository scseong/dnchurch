import { handleResponse } from '@/services/handle-response';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export const worshipService = (supabase: SupabaseClient<Database>) => ({
  list: async () => {
    const res = await supabase
      .from('worship_schedules')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    return handleResponse(res);
  }
});
