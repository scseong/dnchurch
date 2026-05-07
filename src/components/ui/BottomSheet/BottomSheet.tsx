'use client';

import { PropsWithChildren, ReactNode, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { IoClose } from 'react-icons/io5';
import useScrollLock from '@/hooks/useScrollLock';
import styles from './BottomSheet.module.scss';

type Props = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  /** 헤더 타이틀. 생략하면 헤더 타이틀 영역이 렌더되지 않습니다. dialog의 `aria-label`로도 사용됨. */
  title?: string;
  /** `title` 없이 사용할 때 dialog의 접근성 라벨. */
  ariaLabel?: string;
  /** 헤더 닫기 버튼 노출. @default true */
  showClose?: boolean;
  /** 하단 액션 영역. 적용/저장 등 명시적 확정이 필요한 워크플로우에서만 사용. */
  footer?: ReactNode;
}>;

/**
 * 모바일 바텀시트. 모바일 select/dropdown 대체용. PC(`pc-sm` 이상)에서는 중앙 모달로 전환됩니다.
 * dismiss: backdrop 클릭 / ESC / 닫기 버튼.
 *
 * @example
 * ```tsx
 * <BottomSheet open={open} onClose={close} title="분류 선택">
 *   <ul>...</ul>
 * </BottomSheet>
 * ```
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  ariaLabel,
  showClose = true,
  footer,
  children
}: Props) {
  useScrollLock(open);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  if (typeof window === 'undefined') return null;

  const trimmedTitle = title?.trim();
  const trimmedAria = ariaLabel?.trim();
  const accessibleLabel = trimmedTitle || trimmedAria || '다이얼로그';
  const showHeader = Boolean(trimmedTitle) || showClose;

  if (process.env.NODE_ENV !== 'production' && !trimmedTitle && !trimmedAria) {
    console.warn('[BottomSheet] title 또는 ariaLabel을 반드시 지정하세요. 접근성 라벨이 비어있습니다.');
  }

  return createPortal(
    <div
      className={clsx(styles.overlay, open && styles.open)}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        className={clsx(styles.sheet, open && styles.open)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={accessibleLabel}
      >
        <div className={styles.handle} aria-hidden="true" />
        {showHeader && (
          <header className={styles.header}>
            {trimmedTitle && <h2 className={styles.title}>{title}</h2>}
            {showClose && (
              <button
                type="button"
                className={styles.close_btn}
                onClick={onClose}
                aria-label="닫기"
              >
                <IoClose />
              </button>
            )}
          </header>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.getElementById('modal-root') ?? document.body
  );
}
