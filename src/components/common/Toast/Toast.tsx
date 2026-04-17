'use client';

import clsx from 'clsx';
import styles from './Toast.module.scss';

type Props = {
  message: string;
  show: boolean;
};

export default function Toast({ message, show }: Props) {
  return (
    <div
      className={clsx(styles.toast, show && styles.show)}
      role="status"
      aria-live="polite"
      aria-hidden={!show}
    >
      {message}
    </div>
  );
}
