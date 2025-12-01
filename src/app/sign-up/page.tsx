import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { LayoutContainer } from '@/app/_component/layout/common';
import SignUpForm from '@/app/_component/auth/SignUpForm';
import styles from '../login/page.module.scss';

export const metadata: Metadata = {
  title: '회원가입 - 대구동남교회',
  description: '대구동남교회 회원가입 페이지입니다. 소셜 로그인 및 이메일로 가입하실 수 있습니다.'
};

export default function SignUpPage() {
  return (
    <section>
      <LayoutContainer>
        <div className={styles.wrap}>
          <div className={styles.header}>
            <h1>회원가입</h1>
            <p>
              환영합니다.
              <br />
              회원가입 후, 더욱 편리한 서비스를 이용해 보세요.
            </p>
          </div>
          <Suspense fallback={null}>
            <SignUpForm />
          </Suspense>
          <div className={styles.link_group}>
            <p>이미 계정이 있으신가요?</p>
            <Link href="/login">로그인</Link>
          </div>
        </div>
      </LayoutContainer>
    </section>
  );
}
