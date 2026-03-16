'use server';

import { createServerSideClient } from '@/lib/supabase/server';
import { noticeService } from '@/services/notice/notice-service';

export async function getNoticeDetail(id: number) {
  const supabase = await createServerSideClient();
  const { data, error } = await noticeService(supabase).detailById(String(id));
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
