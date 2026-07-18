import { createServerSideClient } from '@/lib/supabase/server';
import type { ReadingRecord, BibleReadingSettings } from '@/utils/bible-tracker';

const DEFAULT_SETTINGS: BibleReadingSettings = { weekly_goal: 50, current_cycle: 1 };
const PAGE_SIZE = 1000;

// RLS owner 정책이 본인 행만 돌려주지만, 인덱스를 타도록 user_id도 명시한다.
export async function getBibleReadingRecords(userId: string): Promise<ReadingRecord[]> {
  const supabase = await createServerSideClient();
  const records: ReadingRecord[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('bible_reading_records')
      .select('book_order, chapter, read_date, cycle')
      .eq('user_id', userId)
      .order('read_date', { ascending: true })
      .order('book_order', { ascending: true })
      .order('chapter', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    records.push(...(data ?? []));
    if ((data?.length ?? 0) < PAGE_SIZE) break;
  }

  return records;
}

// settings 행은 지연 생성이라 없으면 기본값으로 취급한다.
export async function getBibleReadingSettings(userId: string): Promise<BibleReadingSettings> {
  const supabase = await createServerSideClient();
  const { data, error } = await supabase
    .from('bible_reading_settings')
    .select('weekly_goal, current_cycle')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ?? DEFAULT_SETTINGS;
}
