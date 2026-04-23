import { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './primitives.module.scss';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className, children, ...rest }: SelectProps) {
  return (
    <select className={clsx(styles.control, styles.select, className)} {...rest}>
      {children}
    </select>
  );
}
