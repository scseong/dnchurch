'use client';

import { ReactNode } from 'react';
import { IoClose } from 'react-icons/io5';
import clsx from 'clsx';
import styles from './Pill.module.scss';

type PillProps = {
  active?: boolean;
  closable?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
};

export function Pill({ active, closable, onClose, onClick, children, className }: PillProps) {
  const cls = clsx(styles.pill, active && styles.active, closable && styles.dismissible, className);

  const content = (
    <>
      {children}
      {closable && (
        <button type="button" onClick={onClose} className={styles.close} aria-label="해제">
          <IoClose aria-hidden="true" />
        </button>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {content}
      </button>
    );
  }

  return <span className={cls}>{content}</span>;
}
