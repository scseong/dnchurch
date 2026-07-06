'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { usePathname } from 'next/navigation';
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
  /**
   * 열릴 때 history 엔트리를 쌓아 기기 뒤로가기로 닫히게 한다(모바일 시트용).
   * @default false
   */
  enableHistory?: boolean;
};

type DialogNavigate = () => void;
type DialogClose = () => void;

type HistoryNavigationController = {
  closeWithNavigation: (navigate: DialogNavigate, close: DialogClose) => void;
};

let activeHistoryNavigationController: HistoryNavigationController | null = null;

export function closeDialogWithNavigation(navigate: DialogNavigate, close: DialogClose) {
  if (!activeHistoryNavigationController) {
    navigate();
    close();
    return;
  }
  activeHistoryNavigationController.closeWithNavigation(navigate, close);
}

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
  disableEscape = false,
  enableHistory = false
}: UseDialogOptions) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  // onClose identity 변경 시 effect 재실행으로 focus가 리셋되는 것을 방지 — 최신값을 ref로 보관.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useScrollLock(open);

  // ── 뒤로가기로 닫기(enableHistory) — 모바일 시트. controlled open을 history와 동기화한다. ──
  const pushedRef = useRef(false);
  const closingFromPopRef = useRef(false);
  const pathname = usePathname();

  const closeWithNavigation = useCallback((navigate: DialogNavigate, close: DialogClose) => {
    if (!enableHistory || !pushedRef.current) {
      navigate();
      close();
      return;
    }

    const historyState = window.history.state as { __sheet?: boolean } | null;
    if (!historyState?.__sheet) {
      navigate();
      close();
      return;
    }

    pushedRef.current = false;

    const handleConsumedPopState = () => {
      navigate();
      close();
    };

    window.addEventListener('popstate', handleConsumedPopState, { once: true });
    window.history.back();
  }, [enableHistory]);

  useEffect(() => {
    if (!enableHistory || !open) return;

    const controller: HistoryNavigationController = {
      closeWithNavigation
    };
    activeHistoryNavigationController = controller;

    return () => {
      if (activeHistoryNavigationController === controller) {
        activeHistoryNavigationController = null;
      }
    };
  }, [open, enableHistory, closeWithNavigation]);

  useEffect(() => {
    if (!enableHistory) return;

    if (open && !pushedRef.current) {
      // 열림 → 더미 엔트리를 쌓아 기기 back이 페이지 이동 대신 시트만 닫게 한다.
      window.history.pushState({ __sheet: true }, '', window.location.href);
      pushedRef.current = true;
      return;
    }
    if (!open && pushedRef.current && !closingFromPopRef.current) {
      // 버튼·backdrop으로 닫음(popstate 아님) → 쌓은 엔트리를 back으로 되돌린다.
      // 단, 시트 안에서 router.replace/push로 URL을 바꿨다면 우리 엔트리가 사라졌으므로 back하지 않는다
      // (back하면 방금 적용한 필터·쿼리가 되돌려진다 — 월별 보기·설교 필터).
      pushedRef.current = false;
      const historyState = window.history.state as { __sheet?: boolean } | null;
      if (historyState?.__sheet) window.history.back();
    }
    closingFromPopRef.current = false;
  }, [open, enableHistory]);

  useEffect(() => {
    if (!enableHistory) return;
    const handlePopState = () => {
      if (!pushedRef.current) return;
      pushedRef.current = false;
      // 뒤이은 open 동기화 effect가 back()을 다시 부르지 않게 표시.
      closingFromPopRef.current = true;
      onCloseRef.current();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [enableHistory]);

  // 라우트 이동·unmount 시 쌓은 엔트리 추적을 정리한다.
  useEffect(() => {
    return () => {
      pushedRef.current = false;
      closingFromPopRef.current = false;
    };
  }, [pathname]);

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
    accessibleLabel,
    titleId
  };
}
