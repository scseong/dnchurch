import type { Metadata, Viewport } from 'next';
import { Noto_Serif_KR } from 'next/font/google';
import ScrollToTop from '@/components/common/ScrollToTop';
import ToastContainer from '@/components/common/Toast/ToastContainer';
import SessionContextProvider from '@/context/SessionContextProvider';
import '@/styles/globals.scss';
import 'photoswipe/dist/photoswipe.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: {
    template: '%s | 대구동남교회',
    default: '대구동남교회'
  },
  description:
    '대한예수교장로회(합신) 대구동남교회 — 성경 위에 서서 예배·설교·교회 소식을 전합니다.',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '대구동남교회',
    title: {
      template: '%s | 대구동남교회',
      default: '대구동남교회'
    },
    description: '주님의 기도를 배우는 교회(성도), 동남교회',
    images: ['/images/aboutBanner.jpg']
  },
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

const notoserifKR = Noto_Serif_KR({
  weight: ['400', '500', '700', '800'],
  subsets: ['latin'],
  variable: '--font-notoserifKR',
  display: 'swap'
});

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoserifKR.variable}`}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
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
