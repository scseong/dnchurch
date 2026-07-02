'use server';

import { incrementSermonViewCount } from '@/services/sermon';

// 공개 액션 — 조회수는 admin 정렬용 근사치라 인증·dedup 없이 받는다 (exec-plan Non-goals).
export async function incrementSermonViewsAction(sermonId: number): Promise<void> {
  if (!Number.isInteger(sermonId) || sermonId <= 0) return;

  try {
    await incrementSermonViewCount(sermonId);
  } catch (error) {
    // 방문자 UX에 영향 없는 실패지만 숨기지 않는다 — 서버 로그로 남긴다.
    console.error('[sermon-views] 조회수 증가 실패', error);
  }
}
