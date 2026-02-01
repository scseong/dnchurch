import Script from 'next/script';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Footer, Header } from './_component/layout';
import SessionContextProvider from '@/context/SessionContextProvider';
import KakaoScript from './_component/lib/KakaoScript';
import '@/styles/globals.scss';

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

const pretendard = localFont({
  src: [
    {
      path: './fonts/Pretendard-Thin.subset.woff2',
      weight: '100',
      style: 'normal'
    },
    {
      path: './fonts/Pretendard-ExtraLight.subset.woff2',
      weight: '200',
      style: 'normal'
    },
    {
      path: './fonts/Pretendard-Light.subset.woff2',
      weight: '300',
      style: 'normal'
    },
    {
      path: './fonts/Pretendard-Regular.subset.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: './fonts/Pretendard-Medium.subset.woff2',
      weight: '500',
      style: 'normal'
    },
    {
      path: './fonts/Pretendard-SemiBold.subset.woff2',
      weight: '600',
      style: 'normal'
    },
    {
      path: './fonts/Pretendard-Bold.subset.woff2',
      weight: '700',
      style: 'normal'
    },
    {
      path: './fonts/Pretendard-ExtraBold.subset.woff2',
      weight: '800',
      style: 'normal'
    },
    {
      path: './fonts/Pretendard-Black.subset.woff2',
      weight: '900',
      style: 'normal'
    }
  ],
  variable: '--font-pretendard'
});

const myeongjo = localFont({
  src: [
    {
      path: '/fonts/NanumMyeongjo-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: '/fonts/NanumMyeongjo-Bold.woff2',
      weight: '700',
      style: 'normal'
    },
    {
      path: '/fonts/NanumMyeongjo-Black.woff2',
      weight: '800',
      style: 'normal'
    }
  ],
  variable: '--font-myeongjo'
});

const API_KEY = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&libraries=services,clusterer&autoload=false`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${myeongjo.variable} ${pretendard.variable}`}>
      <body>
        <Script src={API_KEY} strategy="beforeInteractive" />
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
