import { LayoutContainer } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import styles from './loading.module.scss';

const SKELETON_ROWS = Array.from({ length: 6 });

export default function NewsLoading() {
  return (
    <LayoutContainer>
      <div className={styles.wrapper}>
        <Skeleton variant="text" width="30%" height="2.4rem" />
        {SKELETON_ROWS.map((_, index) => (
          <Skeleton key={index} height="5.6rem" />
        ))}
      </div>
    </LayoutContainer>
  );
}
