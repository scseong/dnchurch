import { BULLETIN_BUCKET, ITEM_PER_PAGE } from '@/shared/constants/bulletin';
import { createServerSideClient } from '@/shared/supabase/server';
import { BulletinType } from '@/shared/types/types';
import { convertYearToTimestamptz } from '@/shared/util/time';

export const getPrevAndNextBulletin = async (targetId: number) => {
  const supabase = await createServerSideClient({
    cache: 'force-cache',
    tag: ['bulletin', 'prev-next']
  });

  const { data, error } = await supabase
    .rpc('get_prev_and_next_dev', {
      target_id: targetId
    })
    .single();

  if (error) console.error(error);

  return data;
};

export const getLatestBulletin = async () => {
  const supabase = await createServerSideClient({
    cache: 'force-cache',
    tag: ['last-bulletin', 'bulletin']
  });
  const { data: bulletin } = await supabase
    .from(BULLETIN_BUCKET)
    .select('*')
    .order('id', { ascending: false })
    .limit(1);

  return { latestBulletin: bulletin ? bulletin[0] : null };
};

export const getBulletinsById = async (id: string): Promise<BulletinWithUserName | null> => {
  const supabase = await createServerSideClient({
    cache: 'force-cache',
    tag: [`bulletin-${id}`, 'bulletin']
  });
  const { data: bulletin } = await supabase
    .from(BULLETIN_BUCKET)
    .select(`*, profiles ( user_name )`)
    .eq('id', id)
    .single();

  return bulletin as BulletinWithUserName | null;
};

export const getBulletin = async () => {
  const supabase = await createServerSideClient({ cache: 'force-cache', tag: 'bulletin' });
  const {
    data: bulletins,
    count,
    error
  } = await supabase
    .from(BULLETIN_BUCKET)
    .select('*', { count: 'exact' })
    .range(0, 9)
    .order('id', { ascending: false });

  if (error) console.error(error);

  return { bulletins, count };
};

export const getBulletinByYearAndPage = async (page = '1', year = '2025') => {
  const supabase = await createServerSideClient({ cache: 'force-cache', tag: 'bulletin' });
  const startDateTime = convertYearToTimestamptz(year);
  const endDateTime = convertYearToTimestamptz(Number(year) + 1);

  const from = (Number(page) - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;
  const {
    data: bulletins,
    count,
    error
  } = await supabase
    .from(BULLETIN_BUCKET)
    .select('*', { count: 'exact' })
    .gte('created_at', startDateTime)
    .lte('created_at', endDateTime)
    .range(from, to)
    .order('id', { ascending: false });

  if (error) console.error(error);

  return { bulletins, count };
};

export const getBulletinByYear = async (year = '2024') => {
  const supabase = await createServerSideClient({ cache: 'force-cache', tag: 'bulletin' });
  const startDateTime = convertYearToTimestamptz(year);
  const endDateTime = convertYearToTimestamptz(Number(year) + 1);

  const {
    data: bulletins,
    count,
    error
  } = await supabase
    .from(BULLETIN_BUCKET)
    .select('*', { count: 'exact' })
    .gte('created_at', startDateTime)
    .lte('created_at', endDateTime)
    .range(0, 9)
    .order('id', { ascending: false });

  if (error) console.error(error);

  return { bulletins, count };
};

export const getBulletinByPage = async (page = '1') => {
  const supabase = await createServerSideClient({ cache: 'force-cache', tag: 'bulletin' });
  const from = (Number(page) - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  const {
    data: bulletins,
    count,
    error
  } = await supabase
    .from(BULLETIN_BUCKET)
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('id', { ascending: false });

  if (error) console.error(error);

  return { bulletins, count };
};

const Flag = {
  BOTH: 'BOTH',
  YEAR_ONLY: 'YEAR_ONLY',
  PAGE_ONLY: 'PAGE_ONLY',
  NONE: 'NONE'
};

const createFlag = ({ year, page }: { page?: string; year?: string }) => {
  const hasYear = !!year;
  const hasPage = !!page;

  if (hasYear && hasPage) {
    return Flag.BOTH;
  } else if (hasYear) {
    return Flag.YEAR_ONLY;
  } else if (hasPage) {
    return Flag.PAGE_ONLY;
  } else {
    return Flag.NONE;
  }
};

export const getQueryFunction = ({
  page,
  year
}: {
  [key: string]: string | undefined;
}): BulletinRuternType => {
  const flag = createFlag({ page, year });

  switch (flag) {
    case Flag.BOTH:
      return getBulletinByYearAndPage(page, year);
    case Flag.YEAR_ONLY:
      return getBulletinByYear(year);
    case Flag.PAGE_ONLY:
      return getBulletinByPage(page);
    case Flag.NONE:
    default:
      return getBulletin();
  }
};

type BulletinRuternType = Promise<{
  bulletins: BulletinType[] | null;
  count: number | null;
}>;

export type BulletinWithUserName = BulletinType & { profiles: { user_name: string } };
