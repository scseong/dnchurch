import { LayoutContainer } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import bannerStyles from './Banner.module.scss';
import recentSermonsStyles from './RecentSermons.module.scss';
import feedStyles from './FeedSection.module.scss';

// 각 async 섹션의 Suspense 폴백 — 원본 섹션의 컨테이너 클래스를 재사용해 스트리밍 교체 시 레이아웃 시프트를 막는다.

export function BannerFallback() {
  return <section className={bannerStyles.banner} aria-hidden="true" />;
}

export function RecentSermonsFallback() {
  return (
    <section className={recentSermonsStyles.section} aria-hidden="true">
      <LayoutContainer>
        <Skeleton height="32rem" />
      </LayoutContainer>
    </section>
  );
}

export function FeedSectionFallback() {
  return (
    <section className={feedStyles.section} aria-hidden="true">
      <LayoutContainer>
        <Skeleton height="28rem" />
      </LayoutContainer>
    </section>
  );
}
