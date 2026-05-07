'use client';

import { useEffect, useRef } from 'react';
import useScrollLock from './useScrollLock';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type UseDialogOptions = {
  open: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel?: string;
  /** dev 경고에 표시될 컴포넌트 이름 (예: 'Modal', 'BottomSheet'). */
  componentName: string;
  /**
   * ESC 키로 닫히지 않게 함. WAI-ARIA `alertdialog`에서 권장 — 명시적 응답 강제.
   * @default false
   */
  disableEscape?: boolean;
};

/**
 * Dialog 공통 동작: scroll lock, ESC, focus trap, open 시 첫 focusable로 포커스,
 * close 시 trigger로 포커스 복귀, a11y label trim + dev 경고.
 *
 * BottomSheet · Modal에서 공유.
 */
export function useDialog({
  open,
  onClose,
  title,
  ariaLabel,
  componentName,
  disableEscape = false
}: UseDialogOptions) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  // onClose identity 변경 시 effect 재실행으로 focus가 리셋되는 것을 방지 — 최신값을 ref로 보관.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;

    previousActiveRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    if (panel) {
      const focusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable ?? panel).focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableEscape) {
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && panel) {
        const focusables = Array.from(
          panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // trigger가 unmount된 경우 focus 복귀 생략 (페이지 전환·동적 제거 케이스).
      const prev = previousActiveRef.current;
      if (prev?.isConnected) prev.focus();
    };
  }, [open, disableEscape]);

  const trimmedTitle = title?.trim();
  const trimmedAria = ariaLabel?.trim();
  const accessibleLabel = trimmedTitle || trimmedAria || '다이얼로그';

  if (process.env.NODE_ENV !== 'production' && open && !trimmedTitle && !trimmedAria) {
    console.warn(
      `[${componentName}] title 또는 ariaLabel을 반드시 지정하세요. 접근성 라벨이 비어있습니다.`
    );
  }

  return {
    panelRef,
    trimmedTitle,
    accessibleLabel
  };
}
