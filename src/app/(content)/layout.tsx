import Script from 'next/script';
import { PropsWithChildren } from 'react';
import { Header, Hero, Footer, BottomNav } from '@/components/layout';
import KakaoScript from '@/components/lib/KakaoScript';
import { SCROLL_THRESHOLD } from '@/constants';

const API_KEY = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&libraries=services,clusterer&autoload=false`;

export default function ContentLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Script src={API_KEY} strategy="afterInteractive" />
      <KakaoScript />
      <script
        dangerouslySetInnerHTML={{
          __html: `if(window.scrollY>${SCROLL_THRESHOLD})document.documentElement.setAttribute('data-scrolled','');`
        }}
      />
      <Header />
      <main id="main">
        <Hero />
        {children}
      </main>
      <Footer />
      <BottomNav />
      <Script
        id="scroll-reveal-observer"
        src="/scripts/scroll-reveal-observer.js"
        strategy="afterInteractive"
      />
    </>
  );
}
