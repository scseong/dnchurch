import { InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { useFieldContext } from './Field';
import styles from './primitives.module.scss';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  id,
  'aria-required': ariaRequired,
  'aria-describedby': ariaDescribedBy,
  className,
  ...rest
}: InputProps) {
  const ctx = useFieldContext();
  return (
    <input
      id={id ?? ctx?.id}
      aria-required={ariaRequired ?? (ctx?.required || undefined)}
      aria-describedby={ariaDescribedBy ?? ctx?.hintId}
      className={clsx(styles.control, className)}
      {...rest}
    />
  );
}
