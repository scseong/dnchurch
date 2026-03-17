import 'server-only';

import { createStaticClient } from '@/lib/supabase/static';
import { noticeCache } from '@/services/notice/notice-cache';
import { noticeService } from '@/services/notice/notice-service';
import type { NoticeListParams } from '@/types/notice';

export const getNotices = (params: NoticeListParams = {}) => {
  const supabase = createStaticClient(noticeCache.list());
  return noticeService(supabase).list(params);
};

export const getNoticeCategoryCounts = () => {
  const supabase = createStaticClient(noticeCache.list());
  return noticeService(supabase).categoryCounts();
};

export const getAllNoticeIds = () => {
  const supabase = createStaticClient();
  return noticeService(supabase).allIds();
};

export const getNoticeById = (id: string) => {
  const supabase = createStaticClient(noticeCache.detail(id));
  return noticeService(supabase).detailById(id);
};
