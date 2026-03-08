'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import styles from './Dropdown.module.scss';

type DropdownProps = {
  label: string;
  items: { path: string; label: string }[];
  currentPath: string;
  isActive?: boolean;
};

export default function Dropdown({ label, items, currentPath, isActive }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.dropdown} ref={ref}>
      <button
        type="button"
        className={clsx(styles.trigger, {
          [styles.triggerOpen]: open,
          [styles.triggerActive]: isActive
        })}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{label}</span>
        <svg
          className={clsx(styles.chevron, { [styles.chevronOpen]: open })}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul className={styles.menu} role="listbox" aria-label={`${label} 하위 메뉴`}>
          {items.map((item) => {
            const isItemSelected = currentPath.startsWith(item.path);
            return (
              <li key={item.path} role="option" aria-selected={isItemSelected}>
                <button
                  type="button"
                  className={clsx(styles.menuItem, {
                    [styles.menuItemActive]: isItemSelected
                  })}
                  onClick={() => {
                    router.push(item.path);
                    setOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
