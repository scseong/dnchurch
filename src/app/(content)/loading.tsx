import { LayoutContainer } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import styles from './loading.module.scss';

export default function ContentLoading() {
  return (
    <LayoutContainer>
      <div className={styles.wrapper}>
        <Skeleton height="24rem" />
        <Skeleton variant="text" width="35%" height="2.4rem" />
        <div className={styles.row}>
          <Skeleton height="16rem" />
          <Skeleton height="16rem" />
        </div>
        <Skeleton variant="text" width="60%" />
      </div>
    </LayoutContainer>
  );
}
