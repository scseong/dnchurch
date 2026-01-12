import { bulletinService } from '@/services/bulletin/bulletin-service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database.types';

export const rootService = (supabase: SupabaseClient<Database>) => ({
  bulletin: bulletinService(supabase)
});
