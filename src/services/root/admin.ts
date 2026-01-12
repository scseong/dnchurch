import { rootService } from '@/services/root/api-schema';
import { createAdminServerClient } from '@/shared/supabase/admin';

export const getAdminService = () => {
  const supabase = createAdminServerClient();
  return rootService(supabase);
};
