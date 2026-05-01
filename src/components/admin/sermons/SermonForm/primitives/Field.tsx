import { createContext, useContext, useId, ReactNode } from 'react';
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

interface FieldContextValue {
  id: string;
  hintId?: string;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldContext() {
  return useContext(FieldContext);
}

export default function Field({
  label,
  required,
  optional,
  hint,
  counter,
  children
}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const optionalLabel = typeof optional === 'string' ? optional : optional ? '선택' : null;

  return (
    <FieldContext.Provider value={{ id, hintId, required: !!required }}>
      <div className={styles.field}>
        <div className={styles.label_row}>
          <label htmlFor={id} className={styles.label}>
            {label}
            {required && (
              <span className={styles.required} aria-hidden>
                *
              </span>
            )}
          </label>
          {optionalLabel && <span className={styles.optional}>{optionalLabel}</span>}
        </div>
        {children}
        {(hint || counter) && (
          <div className={styles.foot}>
            {hint && (
              <span id={hintId} className={styles.hint}>
                {hint}
              </span>
            )}
            {counter && <span className={styles.counter}>{counter}</span>}
          </div>
        )}
      </div>
    </FieldContext.Provider>
  );
}
