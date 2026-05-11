'use client';

import clsx from 'clsx';
import { useDialog } from '@/hooks/useDialog';
import MobileNavigation from './MobileNavigation';
import styles from './Drawer.module.scss';

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const { panelRef, accessibleLabel } = useDialog({
    open: isOpen,
    onClose,
    ariaLabel: '전체 메뉴',
    componentName: 'Drawer'
  });

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={accessibleLabel}
      tabIndex={-1}
      className={clsx(styles.drawer, isOpen && styles.animate)}
    >
      <div className={styles.top}>
        <button
          type="button"
          className={styles.close_button}
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
      <div className={styles.scroll_area}>
        <MobileNavigation />
      </div>
    </div>
  );
}
