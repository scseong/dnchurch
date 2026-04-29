import 'server-only';

import { createServerSideClient } from '@/lib/supabase/server';
import { sermonService } from '@/services/sermon/sermon-service';
import type {
  AdminSermonListParams,
  AdminSermonListResult
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
