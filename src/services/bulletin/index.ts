import 'server-only';

import { bulletinCache } from '@/services/bulletin/bulletin-cache';
import { bulletinService } from '@/services/bulletin/bulletin-service';
import { createServerSideClient } from '@/shared/supabase/server';
import { createStaticClient } from '@/shared/supabase/static';
import type { BulletinEditFormParams, BulletinParams } from '@/shared/types/bulletin';

export const fetchBulletinList = (params: BulletinParams = {}) => {
  const supabase = createStaticClient(bulletinCache.list());
  return bulletinService(supabase).fetchBulletinList(params);
};

export const fetchBulletinSummaryRpc = (params: BulletinParams) => {
  const supabase = createStaticClient(bulletinCache.summary());
  return bulletinService(supabase).fetchBulletinSummaryRpc(params);
};

export const fetchAllBulletinIds = () => {
  const supabase = createStaticClient();
  return bulletinService(supabase).fetchAllBulletinIds();
};

export const fetchBulletinDetailById = (id: string) => {
  const supabase = createStaticClient(bulletinCache.detail(id));
  return bulletinService(supabase).fetchBulletinDetailById(id);
};

export const fetchPublicBulletinDetailById = async (id: string) => {
  const supabase = await createServerSideClient();
  return bulletinService(supabase).fetchBulletinDetailById(id);
};

export const fetchNavigationBulletins = (targetId: number) => {
  const supabase = createStaticClient(bulletinCache.nav(targetId));
  return bulletinService(supabase).fetchNavigationBulletins(targetId);
};

export const updateBulletin = async (payload: BulletinEditFormParams) => {
  const supabase = await createServerSideClient();
  return bulletinService(supabase).updateBulletin(payload);
};
