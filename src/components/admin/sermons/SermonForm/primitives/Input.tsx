import { InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './primitives.module.scss';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...rest }: InputProps) {
  return <input className={clsx(styles.control, className)} {...rest} />;
}
