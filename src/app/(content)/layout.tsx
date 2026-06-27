import Script from 'next/script';
import { PropsWithChildren } from 'react';
import { Header, Hero, Footer, BottomNav } from '@/components/layout';
import KakaoScript from '@/components/lib/KakaoScript';
import { getWorshipScheduleGroups } from '@/services/worship';
import { SCROLL_THRESHOLD } from '@/constants';
import styles from './layout.module.scss';

const API_KEY = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&libraries=services,clusterer&autoload=false`;

export default async function ContentLayout({ children }: PropsWithChildren) {
  // Footer 예배안내 — components/는 services/를 직접 못 부르므로 app 레이어에서 fetch해 주입한다.
  const { sunday } = await getWorshipScheduleGroups();
  const worshipLine = sunday.map((service) => `${service.name} ${service.time}`).join(' · ');

  return (
    <>
      <Script src={API_KEY} strategy="afterInteractive" />
      <KakaoScript />
      <script
        dangerouslySetInnerHTML={{
          __html: `if(window.scrollY>${SCROLL_THRESHOLD})document.documentElement.setAttribute('data-scrolled','');`
        }}
      />
      <div className={styles.content_shell}>
        <Header />
        <main id="main">
          <Hero />
          {children}
        </main>
        <Footer worshipLine={worshipLine} />
      </div>
      <BottomNav />
      <Script
        id="scroll-reveal-observer"
        src="/scripts/scroll-reveal-observer.js"
        strategy="afterInteractive"
      />
    </>
  );
}
