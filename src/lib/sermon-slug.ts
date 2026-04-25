import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

function slugify(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function buildBaseSlug(sermonDate: string, title: string): string {
  return `${sermonDate}-${slugify(title)}`;
}

export async function ensureUniqueSlug(
  base: string,
  supabase: SupabaseClient<Database>,
  excludeId?: number
): Promise<string> {
  let slug = base;
  let counter = 2;

  while (true) {
    let query = supabase.from('sermons').select('id').eq('slug', slug).maybeSingle();
    if (excludeId) {
      query = supabase
        .from('sermons')
        .select('id')
        .eq('slug', slug)
        .neq('id', excludeId)
        .maybeSingle();
    }
    const { data, error } = await query;
    if (error) throw error;
    if (!data) return slug;
    slug = `${base}-${counter++}`;
  }
}
