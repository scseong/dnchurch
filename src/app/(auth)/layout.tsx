import { PropsWithChildren } from 'react';
import { LayoutContainer } from '@/components/layout';
import styles from './layout.module.scss';

// login·sign-up·forget-password·reset-password 공용 레이아웃.
// (content) 그룹 밖 top-level 라우트라 전역 헤더가 없어, 여기서 <main> 랜드마크와 가운데 정렬 래퍼를 제공한다.
export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main id="main">
      <LayoutContainer>
        <div className={styles.wrap}>{children}</div>
      </LayoutContainer>
    </main>
  );
}
