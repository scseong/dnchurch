'use client';

import { ReactNode } from 'react';
import { IoClose } from 'react-icons/io5';
import clsx from 'clsx';
import styles from './Pill.module.scss';

type PillProps = {
  active?: boolean;
  /** 해제 가능 표시. `true` 시 outer는 `<span>`, 내부에 close `<button>`. `onClick`과 동시 사용 불가. */
  closable?: boolean;
  onClose?: () => void;
  /** 클릭 가능 칩. `closable`과 동시 사용 불가 (button-in-button HTML 위반). */
  onClick?: () => void;
  children: ReactNode;
  className?: string;
};

/**
 * 인터랙티브 칩 — 필터 토글, 카테고리 선택, 해제 가능 태그.
 *
 * 정보 표시(분류·상태)는 `Label` 사용.
 *
 * 모드:
 * - `closable`: outer span + inner close button (해제 가능 칩)
 * - `onClick`: outer button (선택 칩)
 * - 둘 다 없음: 정적 span
 *
 * `closable`과 `onClick`은 상호 배타 — button 중첩 방지를 위해 closable 우선.
 */
export function Pill({ active, closable, onClose, onClick, children, className }: PillProps) {
  if (process.env.NODE_ENV !== 'production' && closable && onClick) {
    console.warn('[Pill] `closable`과 `onClick`은 동시 사용할 수 없습니다. closable이 우선 적용됩니다.');
  }

  const cls = clsx(styles.pill, active && styles.active, closable && styles.dismissible, className);

  if (closable) {
    return (
      <span className={cls}>
        {children}
        <button type="button" onClick={onClose} className={styles.close} aria-label="해제">
          <IoClose aria-hidden="true" />
        </button>
      </span>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {children}
      </button>
    );
  }

  return <span className={cls}>{children}</span>;
}
