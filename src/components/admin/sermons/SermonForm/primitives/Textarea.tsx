import { TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';
import { useFieldContext } from './Field';
import styles from './primitives.module.scss';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  tall?: boolean;
}

export default function Textarea({
  id,
  'aria-required': ariaRequired,
  'aria-describedby': ariaDescribedBy,
  tall,
  className,
  ...rest
}: TextareaProps) {
  const ctx = useFieldContext();
  return (
    <textarea
      id={id ?? ctx?.id}
      aria-required={ariaRequired ?? (ctx?.required || undefined)}
      aria-describedby={ariaDescribedBy ?? ctx?.hintId}
      className={clsx(styles.control, styles.textarea, tall && styles.tall, className)}
      {...rest}
    />
  );
}
