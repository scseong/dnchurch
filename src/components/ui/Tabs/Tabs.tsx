'use client';

import clsx from 'clsx';
import styles from './Tabs.module.scss';

export type TabItem = {
  id: string;
  label: string;
  count?: number;
};

type TabsProps = {
  variant?: 'underline' | 'pill';
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  scrollable?: boolean;
  className?: string;
};

export function Tabs({ variant = 'underline', items, activeId, onChange, scrollable, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={clsx(
        styles.tabs,
        styles[variant],
        scrollable && styles.scrollable,
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={clsx(styles.tab, isActive && styles.active)}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={styles.count}>{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
