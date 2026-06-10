import type { Metadata, Viewport } from 'next';
import { Noto_Serif_KR } from 'next/font/google';
import ScrollToTop from '@/components/common/ScrollToTop';
import ToastContainer from '@/components/common/Toast/ToastContainer';
import SessionContextProvider from '@/context/SessionContextProvider';
import { OPEN_GRAPH_BASE } from '@/config/seo';
// Pretendard(본문 폰트)를 jsdelivr 외부 스타일시트 대신 self-host. 외부 도메인 렌더 차단(DNS·TLS) 비용 제거.
// dynamic-subset CSS라 unicode-range로 필요한 한글 슬라이스만 받는 효율은 그대로. woff2는 Turbopack이 같은 출처 자산으로 emit한다.
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import '@/styles/globals.scss';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: {
    template: '%s | 대구동남교회',
    default: '대구동남교회'
  },
  description:
    '대한예수교장로회(합신) 대구동남교회 — 성경 위에 서서 예배·설교·교회 소식을 전합니다.',
  openGraph: OPEN_GRAPH_BASE,
  twitter: {
    card: 'summary_large_image',
    title: '대구동남교회',
    description: '주님의 기도를 배우는 교회(성도), 동남교회',
    images: ['/images/aboutBanner.jpg']
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

// 세리프는 로고타입·헤딩·인용구 강조용. CJK 폰트는 weight마다 unicode-range @font-face가 생성돼
// 렌더 차단 CSS와 폰트 바이트가 weight 수에 비례한다. 실제 쓰는 400·700만 남긴다(500→400, 600→700로 매핑).
const notoserifKR = Noto_Serif_KR({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-notoserifKR',
  display: 'swap'
});

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoserifKR.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body>
        <div id="root">
          <SessionContextProvider>
            <ScrollToTop />
            <ToastContainer />
            {children}
          </SessionContextProvider>
        </div>
        <div id="modal-root"></div>
      </body>
    </html>
  );
}
