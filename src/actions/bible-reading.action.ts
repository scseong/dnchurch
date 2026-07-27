'use server';

import { createServerSideClient } from '@/lib/supabase/server';
import { isValidChapter, BIBLE_TOTAL_CHAPTERS } from '@/constants/bible';
import { kstToday } from '@/utils/bible-tracker';
import type { ActionResult } from './_types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const WEEKLY_GOAL_MIN = 5;
const WEEKLY_GOAL_MAX = 150;

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

  // 현재 회차(없으면 1)는 RPC 안에서 조회해 기록에 박는다 (D5) — settings select 왕복을 줄인다.
  // user_id는 RPC 안 auth.uid()로 채운다 — 클라이언트가 남의 id를 넣을 수 없다.
  const { error } = await supabase.rpc('record_chapters', {
    p_book_order: bookOrder,
    p_chapters: validated.chapters,
    p_read_date: readDate
  });

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

  // 부분 유니크(read_date is null 전용)는 PostgREST onConflict로 못 겨냥 →
  // RPC가 on conflict do nothing으로 원자 insert. user_id는 RPC 안 auth.uid()로 채우고,
  // 회차도 RPC 안에서 읽는다 — 액션에서 조회해 넘기면 조회 실패·회차 전환 경합 시 낡은 값이 들어간다.
  const { error } = await supabase.rpc('record_prior_chapters', {
    p_book_order: bookOrder,
    p_chapters: validated.chapters
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

  // 조회 실패를 확인하지 않으면 회차가 1로 대체돼 엉뚱한 회차를 겨냥한다.
  const { data: settings, error: settingsError } = await supabase
    .from('bible_reading_settings')
    .select('current_cycle')
    .eq('user_id', user.id)
    .maybeSingle();
  if (settingsError) return { success: false, message: '기록 해제에 실패했습니다.' };
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
  // distinct(book, chapter) 카운트는 서버에서 센다 — 전 행을 내려받아 JS로 세지 않는다.
  const { data: readCount, error: countError } = await supabase.rpc('count_cycle_chapters', {
    p_cycle: currentCycle
  });
  if (countError) return { success: false, message: '통독 진행을 확인하지 못했습니다.' };

  if ((readCount ?? 0) < BIBLE_TOTAL_CHAPTERS) {
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
