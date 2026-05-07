'use client';

import { InputHTMLAttributes, useId } from 'react';
import clsx from 'clsx';
import styles from './TextField.module.scss';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label?: string;
  helper?: string;
  error?: string;
  id?: string;
  className?: string;
};

export function TextField({ label, helper, error, id, required, disabled, className, ...inputProps }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helperId = `${inputId}-helper`;
  const hasHelper = !!(helper || error);

  return (
    <div className={clsx(styles.field, className)}>
      {label && (
        <label htmlFor={inputId} className={clsx(styles.label, required && styles.required)}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={hasHelper ? helperId : undefined}
        className={clsx(styles.input, error && styles.input_error, disabled && styles.input_disabled)}
        {...inputProps}
      />
      {hasHelper && (
        <p id={helperId} className={error ? styles.error : styles.helper}>
          {error ?? helper}
        </p>
      )}
    </div>
  );
}
