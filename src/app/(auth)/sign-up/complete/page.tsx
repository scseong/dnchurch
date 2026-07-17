import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getSessionUser } from '@/services/auth';
import { safeInternalPath } from '@/utils/url';
import ConfirmedWelcome from '../_component/ConfirmedWelcome';

export const metadata: Metadata = {
  title: '가입 완료 - 대구동남교회',
  description: '대구동남교회 회원가입이 완료되었습니다.'
};

type Props = {
  searchParams: Promise<{ next?: string }>;
};

// 이메일 인증(/auth/confirm) 성공 후 착지하는 완료 화면. verifyOtp가 세션을 만들어 이미 로그인된 상태다.
export default async function SignUpCompletePage({ searchParams }: Props) {
  const { next: rawNext } = await searchParams;

  // next는 이미 confirm 라우트가 검증했지만, 이 페이지로 직접 들어올 수도 있어 다시 origin 동일성으로 막는다
  const headerList = await headers();
  const host = headerList.get('host') ?? '';
  const proto = headerList.get('x-forwarded-proto') ?? 'http';
  const next = safeInternalPath(rawNext ?? null, `${proto}://${host}`);

  const user = await getSessionUser();
  const nameMeta = user?.user_metadata?.name;
  const name = typeof nameMeta === 'string' ? nameMeta : '';

  return <ConfirmedWelcome name={name} next={next} />;
}
