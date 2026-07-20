'use server';

import { createServerSideClient } from '@/lib/supabase/server';
import { isValidChapter, BIBLE_TOTAL_CHAPTERS } from '@/constants/bible';
import { kstToday } from '@/utils/bible-tracker';
import type { ActionResult } from './_types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const WEEKLY_GOAL_MIN = 5;
const WEEKLY_GOAL_MAX = 150;
const PAGE_SIZE = 1000;

// 기록/해제 공통 입력 검증 — 날짜 형식·미래 금지·유효 장만 남긴다.
function validateRecordInput(
  bookOrder: number,
  chapters: number[],
  readDate: string
): { ok: true; chapters: number[] } | { ok: false; message: string } {
  if (!DATE_RE.test(readDate) || readDate > kstToday()) {
    return { ok: false, message: '올바른 날짜가 아닙니다.' };
  }
  const valid = [...new Set(chapters)].filter((chapter) => isValidChapter(bookOrder, chapter));
  if (valid.length === 0) {
    return { ok: false, message: '기록할 장이 없습니다.' };
  }
  return { ok: true, chapters: valid };
}

export async function recordChaptersAction(
  bookOrder: number,
  chapters: number[],
  readDate: string
): Promise<ActionResult> {
  const validated = validateRecordInput(bookOrder, chapters, readDate);
  if (!validated.ok) return { success: false, message: validated.message };

  const supabase = await createServerSideClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { success: false, message: '로그인이 필요합니다.' };

  // 현재 회차를 기록에 박는다 (없으면 1). 통독 진행은 이 cycle로 구분한다 (D5).
  const { data: settings } = await supabase
    .from('bible_reading_settings')
    .select('current_cycle')
    .eq('user_id', user.id)
    .maybeSingle();
  const cycle = settings?.current_cycle ?? 1;

  // user_id는 세션에서만 채운다 — 클라이언트가 남의 id를 넣을 수 없다.
  const rows = validated.chapters.map((chapter) => ({
    user_id: user.id,
    book_order: bookOrder,
    chapter,
    read_date: readDate,
    cycle
  }));

  const { error } = await supabase
    .from('bible_reading_records')
    .upsert(rows, { onConflict: 'user_id,book_order,chapter,read_date', ignoreDuplicates: true });

  if (error) return { success: false, message: '기록에 실패했습니다.' };
  return { success: true, message: '기록했습니다.' };
}

export async function unrecordChaptersAction(
  bookOrder: number,
  chapters: number[],
  readDate: string
): Promise<ActionResult> {
  const validated = validateRecordInput(bookOrder, chapters, readDate);
  if (!validated.ok) return { success: false, message: validated.message };

  const supabase = await createServerSideClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { success: false, message: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('bible_reading_records')
    .delete()
    .eq('user_id', user.id)
    .eq('book_order', bookOrder)
    .eq('read_date', readDate)
    .in('chapter', validated.chapters);

  if (error) return { success: false, message: '기록 해제에 실패했습니다.' };
  return { success: true, message: '기록을 해제했습니다.' };
}

// prior-read 입력 검증 — 날짜가 없으니 유효 장만 남긴다.
function validatePriorInput(
  bookOrder: number,
  chapters: number[]
): { ok: true; chapters: number[] } | { ok: false; message: string } {
  const valid = [...new Set(chapters)].filter((chapter) => isValidChapter(bookOrder, chapter));
  if (valid.length === 0) {
    return { ok: false, message: '기록할 장이 없습니다.' };
  }
  return { ok: true, chapters: valid };
}

// 이전에 읽은 기록(prior-read) 저장 — 날짜 없이(read_date null) 현재 회차 통독에만 반영한다.
export async function recordPriorChaptersAction(
  bookOrder: number,
  chapters: number[]
): Promise<ActionResult> {
  const validated = validatePriorInput(bookOrder, chapters);
  if (!validated.ok) return { success: false, message: validated.message };

  const supabase = await createServerSideClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { success: false, message: '로그인이 필요합니다.' };

  const { data: settings } = await supabase
    .from('bible_reading_settings')
    .select('current_cycle')
    .eq('user_id', user.id)
    .maybeSingle();
  const cycle = settings?.current_cycle ?? 1;

  // 부분 유니크(read_date is null 전용)는 PostgREST onConflict로 못 겨냥 →
  // RPC가 on conflict do nothing으로 원자 insert. user_id는 RPC 안 auth.uid()로 채운다.
  const { error } = await supabase.rpc('record_prior_chapters', {
    p_book_order: bookOrder,
    p_chapters: validated.chapters,
    p_cycle: cycle
  });

  if (error) return { success: false, message: '기록에 실패했습니다.' };
  return { success: true, message: '기록했습니다.' };
}

// prior-read 해제 — 부분 유니크와 무관해 평범한 delete. read_date is null·현재 회차만 지운다.
export async function unrecordPriorChaptersAction(
  bookOrder: number,
  chapters: number[]
): Promise<ActionResult> {
  const validated = validatePriorInput(bookOrder, chapters);
  if (!validated.ok) return { success: false, message: validated.message };

  const supabase = await createServerSideClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { success: false, message: '로그인이 필요합니다.' };

  const { data: settings } = await supabase
    .from('bible_reading_settings')
    .select('current_cycle')
    .eq('user_id', user.id)
    .maybeSingle();
  const cycle = settings?.current_cycle ?? 1;

  const { error } = await supabase
    .from('bible_reading_records')
    .delete()
    .eq('user_id', user.id)
    .eq('book_order', bookOrder)
    .eq('cycle', cycle)
    .is('read_date', null)
    .in('chapter', validated.chapters);

  if (error) return { success: false, message: '기록 해제에 실패했습니다.' };
  return { success: true, message: '기록을 해제했습니다.' };
}

export async function setWeeklyGoalAction(goal: number): Promise<ActionResult> {
  if (!Number.isInteger(goal) || goal < WEEKLY_GOAL_MIN || goal > WEEKLY_GOAL_MAX) {
    return { success: false, message: `주간 목표는 ${WEEKLY_GOAL_MIN}~${WEEKLY_GOAL_MAX}장 사이여야 합니다.` };
  }

  const supabase = await createServerSideClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { success: false, message: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('bible_reading_settings')
    .upsert(
      { user_id: user.id, weekly_goal: goal, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  if (error) return { success: false, message: '목표 저장에 실패했습니다.' };
  return { success: true, message: '주간 목표를 저장했습니다.' };
}

export async function startNextCycleAction(): Promise<ActionResult> {
  const supabase = await createServerSideClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { success: false, message: '로그인이 필요합니다.' };

  const { data: settings } = await supabase
    .from('bible_reading_settings')
    .select('current_cycle')
    .eq('user_id', user.id)
    .maybeSingle();
  const currentCycle = settings?.current_cycle ?? 1;

  // 현재 회차를 다 읽었을 때만 다음 회독을 연다 — 실수로 진행이 리셋되지 않게.
  const rows: Array<{ book_order: number; chapter: number }> = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error: readError } = await supabase
      .from('bible_reading_records')
      .select('book_order, chapter')
      .eq('user_id', user.id)
      .eq('cycle', currentCycle)
      .order('book_order', { ascending: true })
      .order('chapter', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (readError) return { success: false, message: '통독 진행을 확인하지 못했습니다.' };

    rows.push(...(data ?? []));
    if ((data?.length ?? 0) < PAGE_SIZE) break;
  }

  const distinct = new Set(rows.map((row) => `${row.book_order}:${row.chapter}`));
  if (distinct.size < BIBLE_TOTAL_CHAPTERS) {
    return { success: false, message: '아직 통독을 마치지 않았습니다.' };
  }

  const { error } = await supabase
    .from('bible_reading_settings')
    .upsert(
      { user_id: user.id, current_cycle: currentCycle + 1, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  if (error) return { success: false, message: '다음 회독 시작에 실패했습니다.' };
  return { success: true, message: '다음 회독을 시작했습니다.' };
}
