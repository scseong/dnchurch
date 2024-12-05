import Script from 'next/script';
import { Header, Footer } from './_component';
import localFont from 'next/font/local';
import type { Metadata } from 'next';
import { getCurrnetUser } from '@/apis/user';
import '../app/styles/globals.scss';
import 'swiper/scss';
import 'swiper/scss/autoplay';
import 'swiper/scss/free-mode';
import 'swiper/scss/effect-fade';
import 'swiper/scss/pagination';
import 'swiper/scss/parallax';

export const metadata: Metadata = {
  title: '동남교회',
  description: '서로서로 세워가는 교회, 동남교회'
};

const myFont = localFont({
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

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrnetUser();

  return (
    <html lang="ko" className={myFont.variable}>
      <body>
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&libraries=services,clusterer&autoload=false`}
          strategy="beforeInteractive"
        />
        <div id="root">
          <Header user={user} />
          <main id="main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
