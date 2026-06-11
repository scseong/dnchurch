import 'server-only';

import { createServerSideClient } from '@/lib/supabase/server';
import { mapRowsWithSermonCount, sermonService } from '@/services/sermon/sermon-service';
import type {
  AdminSermonListParams,
  AdminSermonListResult,
  PreacherWithSermonCount,
  SeriesWithSermonCount
} from '@/types/sermon';

/**
 * [어드민] 설교 목록 + 발행 상태별 카운트 조회
 *
 * 인증 체크 없음 — `(admin)/layout.tsx`의 `checkAdminPermission()`이 라우트를 게이트한다.
 * 캐시 없음 — admin은 항상 최신 데이터.
 */
export const getAdminSermons = async (
  params: AdminSermonListParams
): Promise<AdminSermonListResult> => {
  const supabase = await createServerSideClient();
  const service = sermonService(supabase);
  const [list, statusCounts] = await Promise.all([
    service.adminList(params),
    service.adminStatusCounts()
  ]);
  return { ...list, statusCounts };
};

/**
 * 공개 `getAllPreachers`와 같지만 inner join 해제(공개에서 `!inner` 키워드만 제거).
 * 발행 0편 신규 설교자도 select에 노출 — 어드민 첫 설교 등록 흐름이 차단되던 결함 해소.
 * count 의미는 공개와 동일(발행+미삭제 회차 수) — `sermons.is_published` / `sermons.deleted_at` 필터 유지.
 */
export const getAdminPreachers = async (): Promise<PreacherWithSermonCount[]> => {
  const supabase = await createServerSideClient();
  const res = await supabase
    .from('preachers')
    .select('*, sermons(count)')
    .eq('sermons.is_published', true)
    .is('sermons.deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  return mapRowsWithSermonCount<PreacherWithSermonCount>(res);
};

/** 공개 `getAllSeries`와 같지만 inner join 해제. count 의미는 공개와 동일(발행+미삭제 회차 수). */
export const getAdminSeries = async (): Promise<SeriesWithSermonCount[]> => {
  const supabase = await createServerSideClient();
  const res = await supabase
    .from('sermon_series')
    .select('*, sermons(count)')
    .eq('sermons.is_published', true)
    .is('sermons.deleted_at', null)
    .order('started_at', { ascending: false })
    .order('sort_order', { ascending: true, nullsFirst: false });

  return mapRowsWithSermonCount<SeriesWithSermonCount>(res);
};
