import type { Metadata } from 'next';
import { Noto_Serif_KR } from 'next/font/google';
import ScrollToTop from '@/components/common/ScrollToTop';
import ToastContainer from '@/components/common/Toast/ToastContainer';
import SessionContextProvider from '@/context/SessionContextProvider';
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
