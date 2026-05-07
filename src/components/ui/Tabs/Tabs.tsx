'use client';

import { KeyboardEvent, ReactNode, useRef } from 'react';
import clsx from 'clsx';
import styles from './Tabs.module.scss';

export type TabItem = {
  id: string;
  label: string;
  count?: number;
  /** 레이블 앞 아이콘 */
  leadingIcon?: ReactNode;
  /** 레이블 뒤 아이콘 */
  trailingIcon?: ReactNode;
  /** 연결되는 tabpanel의 DOM id. 지정 시 `aria-controls`로 ARIA tab pattern 완성. */
  panelId?: string;
};

export type TabsVariant = 'underline' | 'pill';
export type TabsSize = 'sm' | 'md' | 'lg';

type TabsProps = {
  /**
   * - `underline` — 페이지·섹션 전환의 기본 형태 (Codeit 권장)
   * - `pill` — 컴팩트한 토글 그룹
   * @default 'underline'
   */
  variant?: TabsVariant;
  /** @default 'md' */
  size?: TabsSize;
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  /** 모바일에서 가로 스크롤 허용. 탭이 많을 때 사용. */
  scrollable?: boolean;
  /**
   * 각 탭이 컨테이너 너비를 균등하게 차지. 탭 2~4개의 모바일 화면에서 좌측 쏠림 방지.
   * `scrollable`과 동시 사용 시 동작이 충돌 — 둘 중 하나만 사용.
   */
  fitted?: boolean;
  className?: string;
};

/**
 * 탭 네비게이션 (Codeit 디자인 시스템 준거).
 *
 * 키보드 네비:
 * - Tab/Shift+Tab — 탭 사이 포커스 이동 (활성화는 Enter/Space)
 * - Arrow Left/Right — 순환 이동 + 자동 활성화
 * - Home/End — 첫/마지막 탭으로 이동 + 자동 활성화
 *
 * 페이지는 항상 탭 하나가 선택된 상태로 렌더되어야 합니다.
 *
 * @example
 * ```tsx
 * <Tabs
 *   variant="underline"
 *   items={[{ id: 'info', label: '정보', count: 12 }, { id: 'media', label: '미디어' }]}
 *   activeId={active}
 *   onChange={setActive}
 * />
 * ```
 */
export function Tabs({
  variant = 'underline',
  size = 'md',
  items,
  activeId,
  onChange,
  scrollable,
  fitted,
  className
}: TabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | null = null;
    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = items.length - 1;
        break;
    }
    if (nextIndex !== null) {
      e.preventDefault();
      onChange(items[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={clsx(
        styles.tabs,
        styles[variant],
        styles[size],
        scrollable && styles.scrollable,
        fitted && styles.fitted,
        className
      )}
    >
      {items.map((item, index) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={item.panelId}
            tabIndex={0}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={clsx(styles.tab, isActive && styles.active)}
          >
            {item.leadingIcon}
            {item.label}
            {item.count !== undefined && <span className={styles.count}>{item.count}</span>}
            {item.trailingIcon}
          </button>
        );
      })}
    </div>
  );
}
