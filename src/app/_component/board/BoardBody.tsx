import type { PropsWithChildren } from 'react';
import styles from './BoardBody.module.scss';

export default function BoardBody({ children }: PropsWithChildren) {
  return <div className={styles.body}>{children}</div>;
}
