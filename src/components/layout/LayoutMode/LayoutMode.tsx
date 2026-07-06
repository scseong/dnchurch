'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { isPcLayoutRoute } from '@/config/navigation';
import styles from './LayoutMode.module.scss';

/**
 * 레이아웃 모드 래퍼. 현재 경로가 PC 유지 대상이면 'pc', 아니면 'app'(모바일 프레임)로 둔다.
 * 하위 컴포넌트 SCSS가 `:global([data-layout='app']) &`로 분기한다.
 * #root(flex column)의 flex 체인을 잇도록 flex:1 열로 렌더한다.
 */
export default function LayoutMode({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mode = isPcLayoutRoute(pathname) ? 'pc' : 'app';

  return (
    <div className={styles.shell} data-layout={mode}>
      {children}
    </div>
  );
}
