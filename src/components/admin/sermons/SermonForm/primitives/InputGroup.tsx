import { InputHTMLAttributes, ReactNode } from 'react';
import styles from './primitives.module.scss';

interface InputGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  prefix: ReactNode;
}

export default function InputGroup({ prefix, ...rest }: InputGroupProps) {
  return (
    <div className={styles.group}>
      <span className={styles.prefix}>{prefix}</span>
      <input className={styles.control} {...rest} />
    </div>
  );
}
