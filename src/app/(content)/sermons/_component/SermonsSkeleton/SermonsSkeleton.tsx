import { Skeleton } from '@/components/ui';
import { LayoutContainer } from '@/components/layout';
import styles from './SermonsSkeleton.module.scss';

type Variant = 'main' | 'archive' | 'sermon-detail' | 'series-detail';

const CAROUSEL = Array.from({ length: 4 });
const LIST_ROWS = Array.from({ length: 6 });
const SIDEBAR_OPTS = Array.from({ length: 4 });
const EPISODES = Array.from({ length: 6 });

function VerticalCardSkeleton() {
  return (
    <div className={styles.v_card}>
      <Skeleton className={styles.v_thumb} />
      <Skeleton variant="text" width="55%" />
      <Skeleton variant="text" width="92%" />
      <Skeleton variant="text" width="40%" className={styles.v_meta} />
    </div>
  );
}

function HorizontalCardSkeleton() {
  return (
    <div className={styles.h_card}>
      <Skeleton className={styles.h_thumb} />
      <div className={styles.h_meta}>
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="65%" />
        <Skeleton variant="text" width="50%" className={styles.h_foot} />
      </div>
    </div>
  );
}

function FilterCard() {
  return (
    <div className={styles.sidebar_card}>
      <Skeleton className={styles.search_bar} />
      {[0, 1].map((section) => (
        <div key={section} className={styles.sidebar_section}>
          <Skeleton variant="text" width="30%" />
          {SIDEBAR_OPTS.map((_, index) => (
            <Skeleton key={index} className={styles.opt_row} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function SermonsSkeleton({ variant }: { variant: Variant }) {
  return (
    <LayoutContainer>
      <div className={styles.root} aria-busy="true" aria-live="polite">
        {variant === 'main' && (
          <>
            <div className={styles.featured}>
              <Skeleton className={styles.feat_video} />
              <div className={styles.feat_meta}>
                <Skeleton variant="text" width="35%" />
                <Skeleton variant="text" width="80%" height="2rem" />
                <Skeleton variant="text" width="55%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="90%" />
              </div>
            </div>

            {[0, 1].map((row) => (
              <section key={row} className={styles.section}>
                <Skeleton variant="text" width="12rem" height="1.6rem" />
                <div className={styles.carousel}>
                  {CAROUSEL.map((_, index) => (
                    <VerticalCardSkeleton key={index} />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}

        {variant === 'archive' && (
          <div className={styles.body}>
            <FilterCard />
            <div className={styles.main_col}>
              <Skeleton className={styles.toolbar} />
              <Skeleton variant="text" width="40%" className={styles.result_bar} />
              <div className={styles.list}>
                {LIST_ROWS.map((_, index) => (
                  <HorizontalCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>
        )}

        {variant === 'sermon-detail' && (
          <div className={styles.detail}>
            <div className={styles.d_main}>
              <Skeleton className={styles.d_video} />
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="text" width="85%" height="2rem" />
              <Skeleton variant="text" width="55%" />
              <Skeleton className={styles.d_block} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="95%" />
              <Skeleton variant="text" width="80%" />
            </div>
            <div className={styles.sidebar_card}>
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="80%" />
              {EPISODES.map((_, index) => (
                <Skeleton key={index} className={styles.opt_row} />
              ))}
            </div>
          </div>
        )}

        {variant === 'series-detail' && (
          <>
            <Skeleton className={styles.hero} />
            <div className={styles.ep_header}>
              <Skeleton variant="text" width="8rem" height="1.4rem" />
              <Skeleton variant="text" width="4rem" />
            </div>
            <div className={styles.grid}>
              {EPISODES.map((_, index) => (
                <HorizontalCardSkeleton key={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </LayoutContainer>
  );
}
