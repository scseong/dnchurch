import { InputHTMLAttributes, ReactNode } from 'react';
import { useFieldContext } from './Field';
import styles from './primitives.module.scss';

interface InputGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix: ReactNode;
}

export default function InputGroup({
  id,
  'aria-required': ariaRequired,
  'aria-describedby': ariaDescribedBy,
  prefix,
  ...rest
}: InputGroupProps) {
  const ctx = useFieldContext();
  return (
    <div className={styles.group}>
      <span className={styles.prefix}>{prefix}</span>
      <input
        id={id ?? ctx?.id}
        aria-required={ariaRequired ?? (ctx?.required || undefined)}
        aria-describedby={ariaDescribedBy ?? ctx?.hintId}
        className={styles.control}
        {...rest}
      />
    </div>
  );
}
