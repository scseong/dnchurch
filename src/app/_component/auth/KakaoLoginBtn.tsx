'use client';

import { signInWithKakao } from '@/apis/auth';

export default function KakaoLoginBtn() {
  const handleKakaoLogin = async () => {
    try {
      await signInWithKakao();
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
