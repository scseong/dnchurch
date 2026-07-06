import Script from 'next/script';
import { PropsWithChildren } from 'react';
import { Header, BottomNav, LayoutMode } from '@/components/layout';
import KakaoScript from '@/components/lib/KakaoScript';
// import { getWorshipScheduleGroups } from '@/services/worship'; // 임시: Footer 주석처리로 미사용
import { SCROLL_THRESHOLD } from '@/constants';
import styles from './layout.module.scss';

const API_KEY = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&libraries=services,clusterer&autoload=false`;

export default function ContentLayout({ children }: PropsWithChildren) {
  // 임시(사용자 요청): Footer 숨김. 복원 시 아래 fetch·worshipLine·<Footer>와 Footer/getWorshipScheduleGroups import·async를 되살린다.
  // const { sunday } = await getWorshipScheduleGroups();
  // const worshipLine = sunday.map((service) => `${service.name} ${service.time}`).join(' · ');

  return (
    <LayoutMode>
      <Script src={API_KEY} strategy="afterInteractive" />
      <KakaoScript />
      <script
        dangerouslySetInnerHTML={{
          __html: `if(window.scrollY>${SCROLL_THRESHOLD})document.documentElement.setAttribute('data-scrolled','');`
        }}
      />
      <div className={styles.content_shell}>
        <Header />
        <main id="main">{children}</main>
        {/* 임시(사용자 요청): Footer 숨김 */}
        {/* <Footer worshipLine={worshipLine} /> */}
      </div>
      <BottomNav />
      <Script
        id="scroll-reveal-observer"
        src="/scripts/scroll-reveal-observer.js"
        strategy="afterInteractive"
      />
    </LayoutMode>
  );
}
