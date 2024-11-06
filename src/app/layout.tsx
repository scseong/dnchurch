import Header from './_component/Header';
import Footer from './_component/Footer';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '동남교회',
  description: '서로서로 세워가는 교회, 동남교회'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div id="root">
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
