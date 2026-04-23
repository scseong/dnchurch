import { ReactNode } from 'react';
import styles from './Field.module.scss';

interface FieldProps {
  label: string;
  required?: boolean;
  /** `true` → "선택" 뱃지, 문자열 → 해당 문자열 뱃지 (예: "자동 생성") */
  optional?: boolean | string;
  hint?: string;
  counter?: string;
  children: ReactNode;
}

export default function Field({
  label,
  required,
  optional,
  hint,
  counter,
  children
}: FieldProps) {
  const optionalLabel = typeof optional === 'string' ? optional : optional ? '선택' : null;

  return (
    <div className={styles.field}>
      <div className={styles.label_row}>
        <span className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden>
              *
            </span>
          )}
        </span>
        {optionalLabel && <span className={styles.optional}>{optionalLabel}</span>}
      </div>
      {children}
      {(hint || counter) && (
        <div className={styles.foot}>
          {hint && <span className={styles.hint}>{hint}</span>}
          {counter && <span className={styles.counter}>{counter}</span>}
        </div>
      )}
    </div>
  );
}
