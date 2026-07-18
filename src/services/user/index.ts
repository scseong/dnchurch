import 'server-only';

import { getUserSession } from '@/apis/auth-server';
import { getProfileByIdServer } from '@/apis/user-server';

// 마이 페이지 등 로그인 사용자 화면용 — 세션과 프로필을 한 번에 조회한다
export const getMySessionProfile = async () => {
  const user = await getUserSession();
  if (!user) return null;

  const profile = await getProfileByIdServer(user.id);

  return { user, profile };
};
