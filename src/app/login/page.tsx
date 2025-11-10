import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LayoutContainer } from '@/app/_component/layout/common';
import KakaoLoginBtn from '../_component/auth/KakaoLoginBtn';
import styles from './page.module.scss';
import SignInForm from '@/app/_component/auth/SignInForm';

export const metadata: Metadata = {
  title: '로그인 - 대구동남교회',
  description:
    '대구동남교회 로그인 페이지입니다. 소셜 로그인으로 간편하게 로그인하고, 믿음의 공동체에 참여하세요.'
};

export default function Login() {
  return (
    <section>
      <LayoutContainer>
        <div className={styles.wrap}>
          <div className={styles.header}>
            <h1>
              대구동남교회 <span>로그인</span>
            </h1>
            <p>믿음의 공동체에 참여하세요.</p>
          </div>
          <SignInForm />
          <div className={styles.divide}>
            <span className={styles.divide_line} />
            <span className={styles.caption}>로그인/회원가입</span>
          </div>
          <div className={styles.btn_group}>
            <Suspense fallback={null}>
              <KakaoLoginBtn />
            </Suspense>
          </div>
        </div>
      </LayoutContainer>
    </section>
  );
}
