import { handleResponse } from '@/services/handle-response';
import { BULLETIN_BUCKET } from '@/constants/bulletin';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type {
  BulletinParams,
  BulletinSummaryResponse,
  BulletinEditFormParams,
  BulletinFormParams,
  BulletinWithImages,
  MonthBuckets
} from '@/types/bulletin';

/** 목록·상세 공용 셀렉트 — BulletinWithImages와 1:1 대조 유지 (P5, content 등 미사용 컬럼 제외) */
const BULLETIN_WITH_IMAGES_SELECT =
  'id, title, sunday_date, created_at, author_id, bulletin_images(id, cloudinary_id, order_index)';

/** summary가 쓰는 목록 쿼리 — 연·월 필터 + 최신순 + 페이지 range. excludeId는 featured(최신 1건)를 뺄 때 쓴다. */
const listQuery = (
  supabase: SupabaseClient<Database>,
  { year, month, page = 1, limit = 10 }: BulletinParams = {},
  excludeId?: number
) => {
  let query = supabase
    .from(BULLETIN_BUCKET)
    .select(BULLETIN_WITH_IMAGES_SELECT, { count: 'exact' })
    .is('deleted_at', null)
    .order('sunday_date', { ascending: false });

  if (year && month) {
    // [year-month-01, 다음달-01) 반개구간 — 월 말일 계산 없이 유효한 날짜 경계만 쓴다.
    const mm = String(month).padStart(2, '0');
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nm = String(nextMonth).padStart(2, '0');
    query = query.gte('sunday_date', `${year}-${mm}-01`).lt('sunday_date', `${nextYear}-${nm}-01`);
  } else if (year) {
    query = query.gte('sunday_date', `${year}-01-01`).lte('sunday_date', `${year}-12-31`);
  }

  if (excludeId) query = query.neq('id', excludeId);

  const from = (page - 1) * limit;
  return query.range(from, from + limit - 1);
};

/** 최신 1건 — 홈 카드(latest)와 summary가 공유. 정렬·deleted_at·images join을 한 곳에서 관리. */
const latestQuery = (supabase: SupabaseClient<Database>) =>
  supabase
    .from(BULLETIN_BUCKET)
    .select(BULLETIN_WITH_IMAGES_SELECT)
    .is('deleted_at', null)
    .order('sunday_date', { ascending: false })
    .limit(1)
    .maybeSingle();

export const bulletinService = (supabase: SupabaseClient<Database>) => ({
  allIds: async () => {
    const res = await supabase
      .from(BULLETIN_BUCKET)
      .select('id')
      .is('deleted_at', null)
      .order('sunday_date', { ascending: false });

    return handleResponse(res);
  },

  detailById: async (id: string) => {
    const res = await supabase
      .from(BULLETIN_BUCKET)
      .select(BULLETIN_WITH_IMAGES_SELECT)
      .eq('id', Number(id))
      .is('deleted_at', null)
      .single();

    return handleResponse(res);
  },

  latest: async () => {
    const res = await latestQuery(supabase);

    return handleResponse(res);
  },

  summary: async (params: BulletinParams) => {
    // latest를 먼저 구해 필터 없을 때 목록에서 뺄 id로 넘긴다(featured 중복·페이지 개수 어긋남 방지).
    const latestRes = await latestQuery(supabase);
    const latest = latestRes.data as BulletinWithImages | null;
    const excludeLatestId = !params.year && !params.month ? latest?.id : undefined;

    const [itemsRes, allDatesRes] = await Promise.all([
      listQuery(supabase, params, excludeLatestId),
      supabase.from(BULLETIN_BUCKET).select('sunday_date').is('deleted_at', null)
    ]);

    // 전체 sunday_date 한 번 훑어 연도 목록과 월별 개수를 함께 만든다(추가 쿼리 없음).
    const monthBuckets: MonthBuckets = {};
    const yearSet = new Set<number>();
    for (const { sunday_date } of allDatesRes.data ?? []) {
      const [year, month] = sunday_date.split('-').map(Number);
      yearSet.add(year);
      (monthBuckets[year] ??= {})[month] = (monthBuckets[year][month] ?? 0) + 1;
    }
    const years = [...yearSet].sort((a, b) => b - a);

    const error = itemsRes.error || allDatesRes.error || latestRes.error;

    return {
      data: {
        latest,
        years,
        monthBuckets,
        items: (itemsRes.data ?? []) as BulletinWithImages[],
        total: itemsRes.count ?? 0
      } as BulletinSummaryResponse,
      error,
      count: null,
      status: error ? 500 : 200,
      statusText: error ? 'Error' : 'OK'
    };
  },

  adjacents: async (targetId: number) => {
    const res = await supabase.rpc('get_adjacent_bulletins', { target_id: targetId }).maybeSingle();
    return handleResponse(res);
  },

  create: async ({ title, sundayDate, images, authorId }: BulletinFormParams) => {
    const res = await supabase
      .rpc('create_bulletin', {
        p_title: title,
        p_sunday_date: sundayDate,
        p_author_id: authorId,
        p_images: images.map((img) => ({
          cloudinary_id: img.cloudinaryId,
          order_index: img.orderIndex
        }))
      })
      .maybeSingle();

    return handleResponse(res);
  },

  update: async ({
    bulletinId,
    title,
    sundayDate,
    imagesToAdd = [],
    imageIdsToDelete = []
  }: BulletinEditFormParams) => {
    const res = await supabase
      .rpc('update_bulletin', {
        p_bulletin_id: Number(bulletinId),
        p_title: title,
        p_sunday_date: sundayDate,
        p_images_to_add: imagesToAdd.map((img) => ({
          cloudinary_id: img.cloudinaryId,
          order_index: img.orderIndex
        })),
        p_image_ids_to_delete: imageIdsToDelete
      })
      .maybeSingle();

    return handleResponse(res);
  }
});
