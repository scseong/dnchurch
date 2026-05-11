'use client';

import { MouseEvent, PropsWithChildren, ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { IoClose } from 'react-icons/io5';
import { useDialog } from '@/hooks/useDialog';
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
 *
 * 동작: open 시 첫 focusable로 자동 포커스 + Tab 트랩, close 시 trigger로 포커스 복귀.
 * dismiss: backdrop 클릭 / ESC / 닫기 버튼.
 *
 * @example
 * ```tsx
 * <BottomSheet open={open} onClose={close} title="분류 선택">
 *   <ul>...</ul>
 * </BottomSheet>
 * ```
 */
export function BottomSheet({
  open,
  onClose,
  title,
  ariaLabel,
  showClose = true,
  footer,
  children
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { panelRef, trimmedTitle, accessibleLabel, titleId } = useDialog({
    open,
    onClose,
    title,
    ariaLabel,
    componentName: 'BottomSheet'
  });

  if (typeof window === 'undefined') return null;

  const showHeader = Boolean(trimmedTitle) || showClose;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return createPortal(
    <div
      ref={overlayRef}
      className={clsx(styles.overlay, open && styles.open)}
      onClick={handleOverlayClick}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        ref={panelRef}
        className={clsx(styles.sheet, open && styles.open)}
        role="dialog"
        aria-modal="true"
        {...(trimmedTitle
          ? { 'aria-labelledby': titleId }
          : { 'aria-label': accessibleLabel })}
        tabIndex={-1}
      >
        <div className={styles.handle} aria-hidden="true" />
        {showHeader && (
          <header className={styles.header}>
            {trimmedTitle && <h2 id={titleId} className={styles.title}>{title}</h2>}
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
