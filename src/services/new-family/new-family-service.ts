import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

type NewFamilyInsert = Database['public']['Tables']['new_family_registrations']['Insert'];

// 공개 폼이라 anon 역할로 insert만 한다(RLS: insert 허용·select 불가). 그래서 .select() 체이닝 없이,
// 에러는 throw하지 않고 action이 친절한 메시지로 변환하도록 raw 응답을 반환한다.
export const newFamilyService = (supabase: SupabaseClient<Database>) => ({
  create: async (input: NewFamilyInsert) =>
    supabase.from('new_family_registrations').insert(input)
});
