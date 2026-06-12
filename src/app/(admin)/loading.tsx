import { Skeleton } from '@/components/ui';
import styles from './loading.module.scss';

export default function AdminLoading() {
  return (
    <div className={styles.wrapper}>
      <Skeleton variant="text" width="30%" height="2.4rem" />
      <Skeleton height="12rem" />
      <Skeleton height="12rem" />
    </div>
  );
}
