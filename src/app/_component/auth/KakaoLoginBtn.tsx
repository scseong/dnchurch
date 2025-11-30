'use client';

import { useSearchParams } from 'next/navigation';
import { signInWithKakao } from '@/apis/auth';

export default function KakaoLoginBtn() {
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const handleKakaoLogin = async () => {
    try {
      await signInWithKakao(redirect);
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
    }
  };

  return (
    <button onClick={handleKakaoLogin}>
      <img src="/images/kakao_login_large_wide.png" alt="카카오 로그인 버튼" />
    </button>
  );
}
