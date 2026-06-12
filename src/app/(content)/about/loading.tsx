import { LayoutContainer } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import styles from './loading.module.scss';

export default function AboutLoading() {
  return (
    <LayoutContainer>
      <div className={styles.wrapper}>
        <Skeleton variant="text" width="40%" height="2.8rem" />
        <Skeleton variant="text" width="70%" />
        <Skeleton height="28rem" />
        <Skeleton variant="text" width="85%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </LayoutContainer>
  );
}
