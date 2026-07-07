import Link from 'next/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LayoutContainer } from '@/components/layout';
import KakaoLoginBtn from '@/app/_component/auth/KakaoLoginBtn';
import SignInForm from '@/app/_component/auth/SignInForm';
import BackButton from './_component/BackButton';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '로그인 - 대구동남교회',
  description:
    '대구동남교회 로그인 페이지입니다. 소셜 로그인으로 간편하게 로그인하고, 믿음의 공동체에 참여하세요.'
};

export default function Login() {
  return (
    <section id="login">
      <LayoutContainer>
        <div className={styles.wrap}>
          <div className={styles.topbar}>
            <BackButton />
          </div>
          <span className={styles.logo} aria-hidden="true">
            <LeafMark />
          </span>
          <div className={styles.header}>
            <h1>로그인</h1>
            <p>
              이메일로 로그인하고
              <br />
              대구동남교회 가족 서비스를 이용하세요
            </p>
          </div>
          <Suspense fallback={null}>
            <SignInForm />
          </Suspense>
          <div className={styles.divide}>
            <span className={styles.divide_line} />
            <span className={styles.caption}>또는</span>
          </div>
          <Suspense fallback={null}>
            <KakaoLoginBtn />
          </Suspense>
          <div className={styles.link_group}>
            <Link href="/forget-password">비밀번호 찾기</Link>
          </div>
          <p className={styles.signup}>
            계정이 없으신가요? <Link href="/sign-up">회원가입</Link>
          </p>
        </div>
      </LayoutContainer>
    </section>
  );
}

function LeafMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 9-4 15-9 15Z" />
      <path d="M4 20c4-1 7-4 12-9" />
    </svg>
  );
}
