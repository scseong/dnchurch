import Script from 'next/script';
import type { Metadata } from 'next';
import { Nanum_Myeongjo } from 'next/font/google';
import { Header, Footer } from '@/components/layout';
import SessionContextProvider from '@/context/SessionContextProvider';
import KakaoScript from '@/components/lib/KakaoScript';
import '@/styles/globals.scss';
import 'photoswipe/dist/photoswipe.css';

export const metadata: Metadata = {
  title: {
    template: '%s | 대구동남교회',
    default: '대구동남교회'
  },
  openGraph: {
    title: {
      template: '%s | 대구동남교회',
      default: '대구동남교회'
    },
    description: '주님의 기도를 배우는 교회(성도), 동남교회'
  }
};

const myeongjo = Nanum_Myeongjo({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  variable: '--font-myeongjo',
  display: 'swap'
});

const API_KEY = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&libraries=services,clusterer&autoload=false`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${myeongjo.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 렌더링 전 스크롤 위치 판단: globals.scss의 html[data-scrolled] header 규칙과 연동 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(window.scrollY>40)document.documentElement.setAttribute('data-scrolled','');`
          }}
        />
      </head>
      <body>
        <Script src={API_KEY} strategy="lazyOnload" />
        <KakaoScript />
        <div id="root">
          <SessionContextProvider>
            <Header />
            <main id="main">{children}</main>
          </SessionContextProvider>
          <Footer />
        </div>
        <div id="modal-root"></div>
      </body>
    </html>
  );
}
