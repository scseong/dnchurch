import type { ReactNode } from 'react';
import styles from './MainContainer.module.scss';

export default function MainContainer({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className={styles.container}>
      <div className={styles.title}>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
