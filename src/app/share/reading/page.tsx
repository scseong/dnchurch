import type { Metadata } from 'next';
import Link from 'next/link';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import styles from './share.module.scss';

// 트래커 기록 공유 페이지 — 카카오 스크랩·링크 복사의 수신 대상.
// 통계를 URL 파라미터로만 받고(이름·개인정보 없음) 로그아웃 상태에서도 열린다.
// 검색 유입 콘텐츠가 아니라 수신자 확인·스크랩용이라 색인은 막는다(generateMetadata robots).

type PageProps = {
  searchParams: Promise<{ p?: string; c?: string; s?: string }>;
};

const PERIODS = ['day', 'week', 'month'] as const;
type Period = (typeof PERIODS)[number];

const PERIOD_LABEL: Record<Period, string> = {
  day: '오늘',
  week: '이번 주',
  month: '이번 달'
};

function parsePeriod(value: string | undefined): Period {
  return PERIODS.includes(value as Period) ? (value as Period) : 'week';
}

// 통계 숫자는 조작 가능한 공개 파라미터 — 비정수·음수·과대값을 안전 범위로 자른다.
function parseCount(value: string | undefined, max: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return 0;
  return Math.min(parsed, max);
}

function subLine(period: Period, secondary: number): string {
  if (period === 'week') return `${secondary}일 함께한 한 주`;
  if (period === 'month') return `${secondary}일 읽은 이번 달`;
  return '오늘도 말씀과 함께했어요';
}

async function resolveShare(searchParams: PageProps['searchParams']) {
  const { p, c, s } = await searchParams;
  return {
    period: parsePeriod(p),
    chapters: parseCount(c, 9999),
    secondary: parseCount(s, 366)
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { period, chapters, secondary } = await resolveShare(searchParams);
  const title = `${PERIOD_LABEL[period]} 성경 ${chapters}장을 읽었어요`;
  const description = subLine(period, secondary);

  return {
    title,
    description,
    // 통계 조합마다 얇은 중복 URL이 색인되지 않게 페이지 단위로 막는다(robots.ts는 /share 허용).
    robots: { index: false },
    // 루트 OG 기본값(siteName·locale·배너 이미지)을 펼쳐 카카오 카드에 출처를 남기고,
    // title·description만 통계로 덮어쓴다. 이미지는 base의 상대 경로 → root metadataBase가 절대화.
    openGraph: {
      ...OPEN_GRAPH_BASE,
      title,
      description
    }
  };
}

export default async function ShareReadingPage({ searchParams }: PageProps) {
  const { period, chapters, secondary } = await resolveShare(searchParams);

  return (
    <main className={styles.page}>
      <article className={styles.card}>
        <span className={styles.brand}>대구동남교회</span>
        <span className={styles.eyebrow}>{PERIOD_LABEL[period]} 성경읽기</span>
        <p className={styles.stat}>
          <strong>{chapters}</strong>장 읽음
        </p>
        <p className={styles.sub}>{subLine(period, secondary)}</p>
        <p className={styles.verse}>
          “주의 말씀은 내 발에 등이요 내 길에 빛이니이다”
          <span className={styles.verse_ref}>시편 119:105</span>
        </p>
      </article>
      <Link href="/" className={styles.cta}>
        나도 성경읽기 시작하기
      </Link>
    </main>
  );
}
