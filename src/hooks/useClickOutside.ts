import { useEffect } from 'react';

interface ClickOutsideOptions {
  /** 리스너 등록 여부. 닫혀 있을 땐 false로 두어 글로벌 리스너 비용을 없앤다. */
  enabled: boolean;
  /** "내부"로 간주할 영역의 CSS selector. 예: '[data-dropdown]', '[data-popover]'. */
  selector: string;
  /** 외부 mousedown 또는 (옵션이 켜져 있다면) ESC 시 호출. */
  onClickOutside: () => void;
  /** ESC 키도 외부 동작으로 처리할지. 기본 true. */
  closeOnEscape?: boolean;
}

/**
 * dropdown / popover / tooltip 등 "내부 영역 외부에서 인터랙션이 일어나면 닫기" 패턴.
 * 내부 영역에 selector에 매치되는 마커(예: data-dropdown)를 두고,
 * 호출자는 onClickOutside에서 닫기 상태를 갱신한다.
 */
export function useClickOutside({
  enabled,
  selector,
  onClickOutside,
  closeOnEscape = true
}: ClickOutsideOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(selector)) return;
      onClickOutside();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClickOutside();
    };

    document.addEventListener('mousedown', handlePointerDown);
    if (closeOnEscape) window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      if (closeOnEscape) window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, selector, onClickOutside, closeOnEscape]);
}
