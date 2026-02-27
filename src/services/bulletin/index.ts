import 'server-only';

import { bulletinCache } from '@/services/bulletin/bulletin-cache';
import { bulletinService } from '@/services/bulletin/bulletin-service';
import { createServerSideClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import type { BulletinEditFormParams, BulletinFormParams, BulletinParams } from '@/types/bulletin';

/**
 *
 * @deprecated
 */
export const getBulletinList = (params: BulletinParams = {}) => {
  const supabase = createStaticClient(bulletinCache.list());
  return bulletinService(supabase).list(params);
};

export const getBulletinSummary = (params: BulletinParams) => {
  const supabase = createStaticClient(bulletinCache.summary());
  return bulletinService(supabase).summary(params);
};

export const getAllBulletinIds = () => {
  const supabase = createStaticClient();
  return bulletinService(supabase).allIds();
};

export const getBulletinById = (id: string) => {
  const supabase = createStaticClient(bulletinCache.detail(id));
  return bulletinService(supabase).detailById(id);
};

export const getBulletinByIdSSR = async (id: string) => {
  const supabase = await createServerSideClient();
  return bulletinService(supabase).detailById(id);
};

export const getAdjacentBulletins = (targetId: number) => {
  const supabase = createStaticClient(bulletinCache.nav(targetId));
  return bulletinService(supabase).adjacents(targetId);
};

export const createBulletin = async (payload: BulletinFormParams) => {
  const supabase = await createServerSideClient();
  return bulletinService(supabase).create(payload);
};

export const updateBulletin = async (payload: BulletinEditFormParams) => {
  const supabase = await createServerSideClient();
  return bulletinService(supabase).update(payload);
};
