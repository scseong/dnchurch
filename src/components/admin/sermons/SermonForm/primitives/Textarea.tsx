import { TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './primitives.module.scss';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  tall?: boolean;
}

export default function Textarea({ tall, className, ...rest }: TextareaProps) {
  return (
    <textarea
      className={clsx(styles.control, styles.textarea, tall && styles.tall, className)}
      {...rest}
    />
  );
}
