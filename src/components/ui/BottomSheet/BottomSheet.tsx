'use client';

import { MouseEvent, PropsWithChildren, ReactNode, useRef } from 'react';
import clsx from 'clsx';
import { IoClose } from 'react-icons/io5';
import { useDialog } from '@/hooks/useDialog';
import { ClientPortal } from '../ClientPortal/ClientPortal';
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
  /** 열릴 때 history 엔트리를 쌓아 기기 뒤로가기로 시트를 닫는다(모바일 콘텐츠 시트용). @default false */
  enableHistory?: boolean;
  /** `full`은 모바일 풀스크린(핸들·바디 패딩 제거). PC에서는 좁은 중앙 모달. @default 'default' */
  size?: 'default' | 'full';
  /** 커스텀 헤더. 제공하면 기본 title/close 헤더 대신 이 노드를 렌더한다(뒤로가기·진행바·우측 액션 등). 이때 dialog 라벨은 `ariaLabel`을 쓴다. */
  header?: ReactNode;
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
  enableHistory = false,
  size = 'default',
  header,
  children
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { panelRef, trimmedTitle, accessibleLabel, titleId } = useDialog({
    open,
    onClose,
    title,
    ariaLabel,
    componentName: 'BottomSheet',
    enableHistory
  });

  const showHeader = Boolean(trimmedTitle) || showClose;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <ClientPortal>
      <div
        ref={overlayRef}
        className={clsx(styles.overlay, open && styles.open)}
        onClick={handleOverlayClick}
        aria-hidden={!open}
        inert={!open}
      >
        <div
          ref={panelRef}
          className={clsx(styles.sheet, size === 'full' && styles.full, open && styles.open)}
          role="dialog"
          aria-modal="true"
          {...(trimmedTitle && !header
            ? { 'aria-labelledby': titleId }
            : { 'aria-label': accessibleLabel })}
          tabIndex={-1}
        >
          {size !== 'full' && <div className={styles.handle} aria-hidden="true" />}
          {header ? (
            <div className={styles.custom_header}>{header}</div>
          ) : (
            showHeader && (
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
            )
          )}
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      </div>
    </ClientPortal>
  );
}
