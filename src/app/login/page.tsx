import Link from 'next/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LayoutContainer } from '@/app/_component/layout/common';
import KakaoLoginBtn from '@/app/_component/auth/KakaoLoginBtn';
import SignInForm from '@/app/_component/auth/SignInForm';
import styles from './page.module.scss';

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
            <h1>로그인</h1>
            <p>
              환영합니다.
              <br />
              로그인 후, 더욱 편리한 서비스를 이용해 보세요.
            </p>
          </div>
          <SignInForm />
          <div className={styles.link_group}>
            <Link href="sign-up">회원가입</Link>
            <Link href="forget-password">비밀번호 찾기</Link>
          </div>
          <div className={styles.divide}>
            <span className={styles.divide_line} />
            <span className={styles.caption}>SNS 계정으로 로그인</span>
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
