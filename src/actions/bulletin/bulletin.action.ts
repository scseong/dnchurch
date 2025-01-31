'use server';

import { ITEM_PER_PAGE } from '@/shared/constants/bulletin';
import { createServerSideClient } from '@/shared/supabase/server';
import { convertYearToTimestamptz } from '@/shared/util/time';
import { uploadFileAction } from '../file.action';
import { getUrlsFromApiResponse } from '@/shared/util/file';

export const getLatestBulletin = async () => {
  const supabase = await createServerSideClient();

  const { data: bulletin } = await supabase
    .from('bulletin')
    .select('*')
    .order('id', { ascending: false })
    .limit(1);

  return { latestBulletin: bulletin ? bulletin[0] : null };
};

export const getBulletin = async () => {
  const supabase = await createServerSideClient();

  const {
    data: bulletins,
    count,
    error
  } = await supabase
    .from('bulletin')
    .select('*', { count: 'exact' })
    .range(0, 9)
    .order('created_at', { ascending: false });

  if (error) console.error(error);

  return { bulletins, count };
};

export const getBulletinByYearAndPage = async (page = '1', year = '2024') => {
  const supabase = await createServerSideClient();

  const startDateTime = convertYearToTimestamptz(year);
  const endDateTime = convertYearToTimestamptz(Number(year) + 1);

  const from = (Number(page) - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  const {
    data: bulletins,
    count,
    error
  } = await supabase
    .from('bulletin')
    .select('*', { count: 'exact' })
    .gte('created_at', startDateTime)
    .lte('created_at', endDateTime)
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) console.error(error);

  return { bulletins, count };
};

export const getBulletinByYear = async (year = '2024') => {
  const supabase = await createServerSideClient();

  const startDateTime = convertYearToTimestamptz(year);
  const endDateTime = convertYearToTimestamptz(Number(year) + 1);

  const {
    data: bulletins,
    count,
    error
  } = await supabase
    .from('bulletin')
    .select('*', { count: 'exact' })
    .gte('created_at', startDateTime)
    .lte('created_at', endDateTime)
    .range(0, 9)
    .order('created_at', { ascending: false });

  if (error) console.error(error);

  return { bulletins, count };
};

export const getBulletinByPage = async (page = '1') => {
  const supabase = await createServerSideClient();

  const from = (Number(page) - 1) * ITEM_PER_PAGE;
  const to = from + ITEM_PER_PAGE - 1;

  const {
    data: bulletins,
    count,
    error
  } = await supabase
    .from('bulletin')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

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

export const getQueryFunction = async ({ page, year }: { [key: string]: string | undefined }) => {
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

export const createBulletinAction = async (_: unknown, formData: FormData) => {
  const title = formData.get('title')?.toString();
  const image_url = formData.getAll('image_url') as File[];
  const user_id = formData.get('user_id')?.toString();

  if (!title || !image_url.length || !user_id)
    return {
      status: false,
      error: '모든 항목을 작성해주세요.'
    };

  const uploadPromises = image_url.map((file) => uploadFileAction(file));
  const uploadResults = await Promise.all(uploadPromises);
  const imagefileUrls = getUrlsFromApiResponse(uploadResults);

  try {
    const supabase = await createServerSideClient();
    const { error } = await supabase
      .from('bulletin')
      .insert({
        title,
        image_url: imagefileUrls,
        user_id
      })
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return {
      status: true,
      error: ''
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      error: `주보 생성에 실패했습니다: ${error}`
    };
  }
};
