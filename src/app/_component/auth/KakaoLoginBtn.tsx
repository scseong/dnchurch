'use client';

import { signInWithKakao } from '@/apis/auth';
import { useSearchParams } from 'next/navigation';

export default function KakaoLoginBtn() {
  const pathname = useSearchParams();

  const handleClick = () => {
    const nextUrl = pathname.get('redirect');
    signInWithKakao(nextUrl);
  };

  return (
    <button onClick={handleClick}>
      <img src="/images/kakao_login_large_wide.png" alt="카카오 로그인" />
    </button>
  );
}
