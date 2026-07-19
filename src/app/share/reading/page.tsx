import type { Metadata } from 'next';
import Link from 'next/link';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import {
  PERIOD_LABEL,
  parsePeriod,
  parseCount,
  subLine,
  CHAPTERS_MAX,
  SECONDARY_MAX,
  SHARE_BRAND,
  SHARE_EYEBROW_SUFFIX,
  SHARE_STAT_SUFFIX,
  SHARE_VERSE,
  SHARE_VERSE_REF
} from '@/utils/bible-share';
import styles from './share.module.scss';

// 트래커 기록 공유 페이지 — 카카오 카드·링크 복사의 수신 대상.
// 통계를 URL 파라미터로만 받고(이름·개인정보 없음) 로그아웃 상태에서도 열린다.
// 검색 유입 콘텐츠가 아니라 수신자 확인용이라 색인은 막는다(generateMetadata robots).
// 파싱·문구·렌더 상수는 OG 이미지 라우트와 bible-share 모듈에서 공유한다(드리프트 방지).

type PageProps = {
  searchParams: Promise<{ p?: string; c?: string; s?: string }>;
};

async function resolveShare(searchParams: PageProps['searchParams']) {
  const { p, c, s } = await searchParams;
  return {
    period: parsePeriod(p),
    chapters: parseCount(c, CHAPTERS_MAX),
    secondary: parseCount(s, SECONDARY_MAX)
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { period, chapters, secondary } = await resolveShare(searchParams);
  const title = `${PERIOD_LABEL[period]} 성경 ${chapters}장을 읽었어요`;
  const description = subLine(period, secondary);
  // 통계를 그린 동적 카드. 상대 경로 → root metadataBase가 절대화(prod). 링크 언펄·카카오 카드와 같은 그림.
  const image = `/share/reading/image?p=${period}&c=${chapters}&s=${secondary}`;

  return {
    title,
    description,
    // 통계 조합마다 얇은 중복 URL이 색인되지 않게 페이지 단위로 막는다(robots.ts는 /share 허용).
    robots: { index: false },
    // 루트 OG 기본값(siteName·locale)을 펼친 뒤 title·description·images를 통계로 덮어쓴다.
    // images는 base 배너를 대체해야 하므로 spread 뒤에 둔다(openGraph 얕은 병합).
    openGraph: {
      ...OPEN_GRAPH_BASE,
      title,
      description,
      images: [{ url: image, width: 800, height: 400 }]
    }
  };
}

export default async function ShareReadingPage({ searchParams }: PageProps) {
  const { period, chapters, secondary } = await resolveShare(searchParams);

  return (
    <main className={styles.page}>
      <article className={styles.card}>
        <span className={styles.brand}>{SHARE_BRAND}</span>
        <span className={styles.eyebrow}>
          {PERIOD_LABEL[period]} {SHARE_EYEBROW_SUFFIX}
        </span>
        <p className={styles.stat}>
          <strong>{chapters}</strong>
          {SHARE_STAT_SUFFIX}
        </p>
        <p className={styles.sub}>{subLine(period, secondary)}</p>
        <p className={styles.verse}>
          “{SHARE_VERSE}”
          <span className={styles.verse_ref}>{SHARE_VERSE_REF}</span>
        </p>
      </article>
      <Link href="/" className={styles.cta}>
        나도 성경읽기 시작하기
      </Link>
    </main>
  );
}
