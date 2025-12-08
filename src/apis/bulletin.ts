import { BULLETIN_BUCKET, ITEM_PER_PAGE } from '@/shared/constants/bulletin';
import { createServerSideClient } from '@/shared/supabase/server';
import { BulletinType } from '@/shared/types/types';
import { convertYearToTimestamptz } from '@/shared/util/time';

export const getPrevAndNextBulletin = async (targetId: number) => {
  const supabase = await createServerSideClient();

  const { data, error } = await supabase
    .rpc(
      'get_prev_and_next_dev',
      {
        target_id: targetId
      },
      { get: true }
    )
    .single();

  if (error) console.error(error);

  return data;
};

export const getBulletinsById = async (id: string): Promise<BulletinWithUserName | null> => {
  const supabase = await createServerSideClient();
  const { data: bulletin } = await supabase
    .from(BULLETIN_BUCKET)
    .select(`*, profiles ( user_name )`)
    .eq('id', Number(id))
    .single();

  return bulletin as BulletinWithUserName | null;
};

// export const getBulletin = async () => {
//   const supabase = await createServerSideClient();
//   const {
//     data: bulletins,
//     count,
//     error
//   } = await supabase
//     .from(BULLETIN_BUCKET)
//     .select('*', { count: 'exact' })
//     .range(0, 9)
//     .order('id', { ascending: false });

//   if (error) console.error(error);

//   return { bulletins, count };
// };

// export const getBulletinByYearAndPage = async (page = '1', year = '2025') => {
//   const supabase = await createServerSideClient();
//   const startDateTime = convertYearToTimestamptz(year);
//   const endDateTime = convertYearToTimestamptz(Number(year) + 1);

//   const from = (Number(page) - 1) * ITEM_PER_PAGE;
//   const to = from + ITEM_PER_PAGE - 1;
//   const {
//     data: bulletins,
//     count,
//     error
//   } = await supabase
//     .from(BULLETIN_BUCKET)
//     .select('*', { count: 'exact' })
//     .gte('created_at', startDateTime)
//     .lte('created_at', endDateTime)
//     .range(from, to)
//     .order('id', { ascending: false });

//   if (error) console.error(error);

//   return { bulletins, count };
// };

// export const getBulletinByYear = async (year = '2024') => {
//   const supabase = await createServerSideClient();
//   const startDateTime = convertYearToTimestamptz(year);
//   const endDateTime = convertYearToTimestamptz(Number(year) + 1);

//   const {
//     data: bulletins,
//     count,
//     error
//   } = await supabase
//     .from(BULLETIN_BUCKET)
//     .select('*', { count: 'exact' })
//     .gte('created_at', startDateTime)
//     .lte('created_at', endDateTime)
//     .range(0, 9)
//     .order('id', { ascending: false });

//   if (error) console.error(error);

//   return { bulletins, count };
// };

// export const getBulletinByPage = async (page = '1') => {
//   const supabase = await createServerSideClient();
//   const from = (Number(page) - 1) * ITEM_PER_PAGE;
//   const to = from + ITEM_PER_PAGE - 1;

//   const {
//     data: bulletins,
//     count,
//     error
//   } = await supabase
//     .from(BULLETIN_BUCKET)
//     .select('*', { count: 'exact' })
//     .range(from, to)
//     .order('id', { ascending: false });

//   if (error) console.error(error);

//   return { bulletins, count };
// };

// const Flag = {
//   BOTH: 'BOTH',
//   YEAR_ONLY: 'YEAR_ONLY',
//   PAGE_ONLY: 'PAGE_ONLY',
//   NONE: 'NONE'
// };

// const createFlag = ({ year, page }: { page?: string; year?: string }) => {
//   const hasYear = !!year;
//   const hasPage = !!page;

//   if (hasYear && hasPage) {
//     return Flag.BOTH;
//   } else if (hasYear) {
//     return Flag.YEAR_ONLY;
//   } else if (hasPage) {
//     return Flag.PAGE_ONLY;
//   } else {
//     return Flag.NONE;
//   }
// };

// export const getQueryFunction = ({
//   page,
//   year
// }: {
//   [key: string]: string | undefined;
// }): BulletinRuternType => {
//   const flag = createFlag({ page, year });

//   switch (flag) {
//     case Flag.BOTH:
//       return getBulletinByYearAndPage(page, year);
//     case Flag.YEAR_ONLY:
//       return getBulletinByYear(year);
//     case Flag.PAGE_ONLY:
//       return getBulletinByPage(page);
//     case Flag.NONE:
//     default:
//       return getBulletin();
//   }
// };

type BulletinRuternType = Promise<{
  bulletins: BulletinType[] | null;
  count: number | null;
}>;

export type BulletinWithUserName = BulletinType & { profiles: { user_name: string } };

export const getBulletins = async ({ year = 2025, page = 1, limit = 10 }) => {
  const supabase = await createServerSideClient();
  let query = supabase
    .from('bulletin-dev')
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

export const getLatestBulletin = async () => {
  const supabase = await createServerSideClient();
  const { data: bulletin, error } = await supabase
    .from(BULLETIN_BUCKET)
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;

  return { latestBulletin: bulletin };
};

export type BulletinSummaryResponse = {
  latest: BulletinType;
  years: { year: number }[];
  items: BulletinType[];
  total: number;
};

export const getBulletinSummary = async ({
  year = 2026,
  page = 1,
  limit = 10
}): Promise<BulletinSummaryResponse> => {
  const supabase = await createServerSideClient();
  const { data, error } = await supabase.rpc('getbulletinsummary', {
    select_year: year,
    page,
    limit_count: limit
  });

  if (error) throw error;
  return data as BulletinSummaryResponse;
};
