import { getUserSession } from '@/apis/auth-server';

/**
 * 로그인된 유저(없으면 null)를 반환한다.
 * app/은 apis/를 직접 못 부르므로(레이어 규칙), 서버 컴포넌트가 세션 유저를 읽을 때 이 seam을 쓴다.
 */
export async function getSessionUser() {
  return getUserSession();
}
