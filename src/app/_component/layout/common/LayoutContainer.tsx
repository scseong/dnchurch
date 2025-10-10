import type { PropsWithChildren } from 'react';
import styles from './Layout.module.scss';

export default function LayoutContainer({ children }: PropsWithChildren) {
  return <div className={styles.container}>{children}</div>;
}
