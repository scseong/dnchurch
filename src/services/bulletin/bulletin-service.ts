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
    const bulletinRes = await supabase
      .from(BULLETIN_BUCKET)
      .insert({ title, sunday_date: sundayDate, author_id: authorId })
      .select()
      .single();

    const bulletinData = handleResponse(bulletinRes);
    if (bulletinRes.error || !bulletinRes.data) return bulletinData;

    const bulletinId = bulletinRes.data.id;

    if (images.length > 0) {
      await supabase.from('bulletin_images').insert(
        images.map((img) => ({
          bulletin_id: bulletinId,
          cloudinary_id: img.cloudinaryId,
          url: img.url,
          order_index: img.orderIndex
        }))
      );
    }

    return bulletinData;
  },

  update: async ({
    bulletinId,
    title,
    sundayDate,
    imagesToAdd = [],
    imageIdsToDelete = []
  }: BulletinEditFormParams) => {
    const updatePayload: { title?: string; sunday_date?: string } = {};
    if (title !== undefined) updatePayload.title = title;
    if (sundayDate !== undefined) updatePayload.sunday_date = sundayDate;

    const bulletinRes = await supabase
      .from(BULLETIN_BUCKET)
      .update(updatePayload)
      .eq('id', Number(bulletinId))
      .select()
      .single();

    const bulletinData = handleResponse(bulletinRes);
    if (bulletinRes.error) return bulletinData;

    if (imageIdsToDelete.length > 0) {
      await supabase.from('bulletin_images').delete().in('id', imageIdsToDelete);
    }

    if (imagesToAdd.length > 0) {
      await supabase.from('bulletin_images').insert(
        imagesToAdd.map((img) => ({
          bulletin_id: Number(bulletinId),
          cloudinary_id: img.cloudinaryId,
          url: img.url,
          order_index: img.orderIndex
        }))
      );
    }

    return bulletinData;
  }
});
