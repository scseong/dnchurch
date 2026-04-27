import { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';
import { useFieldContext } from './Field';
import styles from './primitives.module.scss';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({
  id,
  'aria-required': ariaRequired,
  'aria-describedby': ariaDescribedBy,
  className,
  children,
  ...rest
}: SelectProps) {
  const ctx = useFieldContext();
  return (
    <select
      id={id ?? ctx?.id}
      aria-required={ariaRequired ?? (ctx?.required || undefined)}
      aria-describedby={ariaDescribedBy ?? ctx?.hintId}
      className={clsx(styles.control, styles.select, className)}
      {...rest}
    >
      {children}
    </select>
  );
}
