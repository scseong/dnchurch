import { handleResponse } from '@/services/handle-response';
import { BULLETIN_BUCKET } from '@/constants/bulletin';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type {
  BulletinParams,
  BulletinSummaryResponse,
  BulletinEditFormParams,
  BulletinFormParams,
  BulletinWithImages
} from '@/types/bulletin';

export const bulletinService = (supabase: SupabaseClient<Database>) => ({
  list: async ({ year, page = 1, limit = 10 }: BulletinParams = {}) => {
    let query = supabase
      .from(BULLETIN_BUCKET)
      .select('*, bulletin_images(*)', { count: 'exact' })
      .is('deleted_at', null)
      .order('sunday_date', { ascending: false });

    if (year) {
      query = query.gte('sunday_date', `${year}-01-01`).lte('sunday_date', `${year}-12-31`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const res = await query.range(from, to);

    return handleResponse(res);
  },

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
      .select('*, bulletin_images(*)')
      .eq('id', Number(id))
      .is('deleted_at', null)
      .single();

    return handleResponse(res);
  },

  summary: async ({ year, page = 1, limit = 10 }: BulletinParams) => {
    let itemsQuery = supabase
      .from(BULLETIN_BUCKET)
      .select('*, bulletin_images(*)', { count: 'exact' })
      .is('deleted_at', null)
      .order('sunday_date', { ascending: false });

    if (year) {
      itemsQuery = itemsQuery
        .gte('sunday_date', `${year}-01-01`)
        .lte('sunday_date', `${year}-12-31`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const [itemsRes, allDatesRes, latestRes] = await Promise.all([
      itemsQuery.range(from, to),
      supabase.from(BULLETIN_BUCKET).select('sunday_date').is('deleted_at', null),
      supabase
        .from(BULLETIN_BUCKET)
        .select('*, bulletin_images(*)')
        .is('deleted_at', null)
        .order('sunday_date', { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

    const years = [
      ...new Set((allDatesRes.data ?? []).map((b) => new Date(b.sunday_date).getFullYear()))
    ].sort((a, b) => b - a);

    const error = itemsRes.error || allDatesRes.error || latestRes.error;

    return {
      data: {
        latest: latestRes.data as BulletinWithImages | null,
        years,
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
          url: img.url,
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
          url: img.url,
          order_index: img.orderIndex
        })),
        p_image_ids_to_delete: imageIdsToDelete
      })
      .maybeSingle();

    return handleResponse(res);
  }
});
