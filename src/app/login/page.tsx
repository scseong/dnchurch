import { Suspense } from 'react';
import KakaoLoginBtn from '../_component/auth/KakaoLoginBtn';
import type { Metadata } from 'next';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '로그인 - 대구동남교회',
  description:
    '대구동남교회 로그인 페이지입니다. 소셜 로그인으로 간편하게 로그인하고, 믿음의 공동체에 참여하세요.'
};

export default async function Login() {
  return (
    <section className={styles.login}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <h2>
            대구동남교회 <span>로그인</span>
          </h2>
          <p>믿음의 공동체에 참여하세요.</p>
        </div>
        <div className={styles.divide}>
          <span className={styles.divide_line} />
          <span className={styles.caption}>로그인/회원가입</span>
        </div>
        <div className={styles.btn_group}>
          <Suspense fallback={null}>
            <KakaoLoginBtn />
          </Suspense>
          {/* TODO: Naver, Google 중 소셜 로그인 추가 */}
        </div>
      </div>
    </section>
  );
}
