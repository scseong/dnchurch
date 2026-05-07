'use client';

import { MouseEvent, PropsWithChildren, ReactNode, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { IoClose } from 'react-icons/io5';
import useScrollLock from '@/hooks/useScrollLock';
import styles from './Modal.module.scss';

type Props = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  /** 헤더 타이틀. 생략 시 헤더 타이틀 영역이 렌더되지 않습니다. dialog의 `aria-label`로도 사용. */
  title?: string;
  /** `title` 없이 사용할 때 dialog의 접근성 라벨. */
  ariaLabel?: string;
  /** confirm·destructive에서는 `'alertdialog'`. @default 'dialog' */
  role?: 'dialog' | 'alertdialog';
  /**
   * 헤더 닫기 버튼 노출. footer에 cancel이 있으면 `false` 권장
   * (Codeit "close vs cancel 동시 표시 금지").
   * @default false
   */
  showClose?: boolean;
  /** 하단 액션 영역. 보통 `<Button>` 1~2개. */
  footer?: ReactNode;
}>;

/**
 * 모달 다이얼로그 (Codeit 디자인 시스템 준거).
 * confirm·alert·form 등 PC 우선 케이스에 사용. 모바일 select 대체에는 `BottomSheet`.
 * dismiss: backdrop 클릭 / ESC / 닫기 버튼.
 *
 * @example
 * ```tsx
 * <Modal
 *   open={open}
 *   onClose={close}
 *   title="삭제 확인"
 *   role="alertdialog"
 *   footer={<><Button variant="secondary" onClick={close}>취소</Button><Button variant="danger" onClick={confirm}>삭제</Button></>}
 * >
 *   <p>정말 삭제하시겠습니까?</p>
 * </Modal>
 * ```
 */
export default function Modal({
  open,
  onClose,
  title,
  ariaLabel,
  role = 'dialog',
  showClose = false,
  footer,
  children
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
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
    console.warn('[Modal] title 또는 ariaLabel을 반드시 지정하세요. 접근성 라벨이 비어있습니다.');
  }

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return createPortal(
    <div
      ref={overlayRef}
      className={clsx(styles.overlay, open && styles.open)}
      onClick={handleOverlayClick}
      aria-hidden={!open}
    >
      <div
        className={styles.panel}
        role={role}
        aria-modal="true"
        aria-label={accessibleLabel}
      >
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
