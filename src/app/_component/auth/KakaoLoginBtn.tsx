'use client';

import { signInWithKakao } from '@/apis/auth';

export default function KakaoLoginBtn() {
  return (
    <button onClick={signInWithKakao}>
      <img src="/images/kakao_login_large_wide.png" alt="카카오 로그인" />
    </button>
  );
}
