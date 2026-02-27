'use client';

import Script from 'next/script';

export default function KakaoScript() {
  const kakaoInit = () => {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
    }
  };

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
      crossOrigin="anonymous"
      onLoad={kakaoInit}
    />
  );
}
