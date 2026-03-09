'use client';

import clsx from 'clsx';
import MobileNavigation from '@/components/layout/header/MobileNavigation';
import styles from './Drawer.module.scss';

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  return (
    <div
      className={clsx(styles.drawer, isOpen && styles.animate)}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.top}>
        <button className={styles.close_button} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={styles.scroll_area}>
        <MobileNavigation />
      </div>
    </div>
  );
}
