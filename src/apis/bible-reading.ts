import { createServerSideClient } from '@/lib/supabase/server';
import type { ReadingRecord, BibleReadingSettings } from '@/utils/bible-tracker';

const DEFAULT_SETTINGS: BibleReadingSettings = { weekly_goal: 50, current_cycle: 1 };
const PAGE_SIZE = 1000;

// RLS owner 정책이 본인 행만 돌려주지만, 인덱스를 타도록 user_id도 명시한다.
// 첫 페이지 응답의 count로 남은 페이지를 병렬 요청한다 — 순차 루프는 1,000행마다 왕복이 하나씩 늘었다.
export async function getBibleReadingRecords(userId: string): Promise<ReadingRecord[]> {
  const supabase = await createServerSideClient();

  const selectPage = (from: number, withCount: boolean) =>
    supabase
      .from('bible_reading_records')
      .select('book_order, chapter, read_date, cycle', withCount ? { count: 'exact' } : undefined)
      .eq('user_id', userId)
      .order('read_date', { ascending: true })
      .order('book_order', { ascending: true })
      .order('chapter', { ascending: true })
      // prior 행(read_date null)은 (책·장)이 회차만 다르게 중복될 수 있어 cycle까지 넣어야 완전 순서다.
      // 완전 순서가 아니면 동률이 페이지 경계에 걸릴 때 병렬 offset 페이지가 행을 중복·누락할 수 있다.
      .order('cycle', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

  const { data, error, count } = await selectPage(0, true);
  if (error) throw error;

  const records: ReadingRecord[] = data ?? [];
  if (count === null) {
    for (let from = PAGE_SIZE; records.length === from; from += PAGE_SIZE) {
      const page = await selectPage(from, false);
      if (page.error) throw page.error;
      records.push(...(page.data ?? []));
    }
    return records;
  }

  const total = count;
  if (total <= PAGE_SIZE) return records;

  const restStarts: number[] = [];
  for (let from = PAGE_SIZE; from < total; from += PAGE_SIZE) restStarts.push(from);

  const restPages = await Promise.all(restStarts.map((from) => selectPage(from, false)));
  for (const page of restPages) {
    if (page.error) throw page.error;
    records.push(...(page.data ?? []));
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
