import { SupabaseClient } from '@supabase/supabase-js';
import { bulletinService } from '@/services/bulletin-service';
import { Database } from '@/shared/types/database.types';

export const rootService = (supabase: SupabaseClient<Database>) => ({
  bulletin: bulletinService(supabase)
});
