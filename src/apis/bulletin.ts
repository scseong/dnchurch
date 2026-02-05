import { supabase } from '@/shared/supabase/client';
import { BULLETIN_BUCKET } from '@/shared/constants/bulletin';
import { BulletinType } from '@/shared/types/types';
import type { BulletinParams, BulletinSummaryResponse } from '@/shared/types/bulletin';

export type BulletinWithUserName = BulletinType & { profiles: { user_name: string } };

export const getBulletins = async ({ year = 2025, page = 1, limit = 10 }) => {
  let query = supabase
    .from(BULLETIN_BUCKET)
    .select('*', { count: 'exact' })
    .order('date', { ascending: false });

  if (year) {
    query = query.gte('date', `${year}-01-01`);
    query = query.lte('date', `${year}-12-31`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return { bulletins: data, total: count || 0 };
};

export const getBulletinsById = async (id: string): Promise<BulletinWithUserName | null> => {
  const { data: bulletin, error } = await supabase
    .from(BULLETIN_BUCKET)
    .select(`*, profiles ( user_name )`)
    .eq('id', Number(id))
    .single();

  if (error) throw error;
  return bulletin as BulletinWithUserName | null;
};

export const getLatestBulletin = async () => {
  const { data: bulletin, error } = await supabase
    .from(BULLETIN_BUCKET)
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return { latestBulletin: bulletin };
};

export async function getBulletinSummary({ year, page = 1, limit = 10 }: BulletinParams) {
  const { data, error } = await supabase.rpc(
    'getbulletinsummary',
    {
      select_year: year || undefined,
      page,
      limit_count: limit
    },
    { get: true }
  );

  if (error) throw error;
  return data as BulletinSummaryResponse;
}

export async function getAllBulletinIds() {
  const { data, error } = await supabase.from(BULLETIN_BUCKET).select('id');

  if (error) throw error;
  return data;
}

export const getPrevAndNextBulletin = async (targetId: number) => {
  const { data, error } = await supabase
    .rpc(
      'get_prev_and_next_dev',
      {
        target_id: targetId
      },
      { get: true }
    )
    .maybeSingle();

  if (error) console.error(error);
  return data;
};
