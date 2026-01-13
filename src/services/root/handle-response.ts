import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

type AnyPostgrestResponse = PostgrestResponse<any> | PostgrestSingleResponse<any>;

export const handleResponse = <T extends AnyPostgrestResponse>(res: T): T => {
  if (res.error) {
    console.error(`[Supabase Error] ${res.error.code}: ${res.error.message}`);
    throw res.error;
  }
  return res;
};
