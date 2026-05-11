import clsx from 'clsx';
import styles from './Skeleton.module.scss';

type SkeletonProps = {
  variant?: 'rect' | 'text' | 'circle';
  width?: string;
  height?: string;
  className?: string;
};

export function Skeleton({ variant = 'rect', width, height, className }: SkeletonProps) {
  return (
    <span
      className={clsx(styles.skeleton, styles[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
