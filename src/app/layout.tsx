import Script from 'next/script';
import { Footer, Header } from './_component/layout';
import SessionContextProvider from '@/context/SessionContextProvider';
import localFont from 'next/font/local';
import KakaoScript from './_component/lib/KakaoScript';
import type { Metadata } from 'next';
import '../app/styles/globals.scss';
import 'swiper/scss';
import 'swiper/scss/autoplay';
import 'swiper/scss/free-mode';
import 'swiper/scss/effect-fade';
import 'swiper/scss/pagination';
import 'swiper/scss/parallax';

export const metadata: Metadata = {
  title: '대구동남교회',
  openGraph: {
    title: '대구동남교회',
    description: '주님의 기도를 배우는 교회(성도), 동남교회'
  }
};

const notoSans = localFont({
  src: [
    {
      path: './fonts/NotoSansKR-Light.woff2',
      weight: '300',
      style: 'normal'
    },
    {
      path: './fonts/NotoSansKR-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: './fonts/NotoSansKR-Medium.woff2',
      weight: '500',
      style: 'normal'
    },
    {
      path: './fonts/NotoSansKR-SemiBold.woff2',
      weight: '600',
      style: 'normal'
    },
    {
      path: './fonts/NotoSansKR-Bold.woff2',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--font-notosans'
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

export default async function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${myeongjo.variable} ${notoSans.variable}`}>
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
        {modal}
        <div id="modal-root"></div>
      </body>
    </html>
  );
}
