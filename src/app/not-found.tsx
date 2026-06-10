import type { Metadata } from 'next';
import Link from 'next/link';
import clsx from 'clsx';
import NotFoundBackground from './_component/NotFoundBackground';
import NotFoundBackButton from './_component/NotFoundBackButton';
import styles from './not-found.module.scss';

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
  robots: { index: false }
};

const QUICK_LINKS = [
  { label: '예배 안내', href: '/about/worship' },
  { label: '오시는 길', href: '/about/location' },
  { label: '교회 소개', href: '/about' },
  { label: '섬기는 사람들', href: '/about/serving-people' }
];

export default function NotFound() {
  return (
    <div className={styles.page}>
      {/* z0: 사진 로드 실패 시 보이는 "길과 빛"(시편 119:105) 폴백 일러스트 */}
      <div className={styles.scene} aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="nf-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#16222e" />
              <stop offset="0.55" stopColor="#1d2f3f" />
              <stop offset="0.82" stopColor="#2b4257" />
              <stop offset="1" stopColor="#33506a" />
            </linearGradient>
            <radialGradient id="nf-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fbe6c2" stopOpacity="0.95" />
              <stop offset="0.28" stopColor="#e7bd78" stopOpacity="0.7" />
              <stop offset="0.6" stopColor="#c4924a" stopOpacity="0.22" />
              <stop offset="1" stopColor="#c4924a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="nf-path" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#5a6b78" />
              <stop offset="0.5" stopColor="#9d8f72" />
              <stop offset="1" stopColor="#eccf9e" />
            </linearGradient>
            <linearGradient id="nf-hill-back" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#24394b" />
              <stop offset="1" stopColor="#1b2c3a" />
            </linearGradient>
            <linearGradient id="nf-hill-front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#172430" />
              <stop offset="1" stopColor="#101a23" />
            </linearGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#nf-sky)" />
          <g fill="#eccf9e">
            <circle cx="220" cy="120" r="2.4" />
            <circle cx="400" cy="200" r="1.8" />
            <circle cx="640" cy="90" r="2" />
            <circle cx="1120" cy="150" r="2.2" />
            <circle cx="1280" cy="240" r="1.6" />
            <circle cx="980" cy="80" r="1.8" />
            <circle cx="160" cy="300" r="1.6" />
            <circle cx="1340" cy="120" r="2" />
          </g>
          <g>
            <circle cx="965" cy="486" r="320" fill="url(#nf-glow)" />
            <circle cx="965" cy="486" r="20" fill="#fdf1d4" />
            <circle cx="965" cy="486" r="46" fill="#f6dca6" opacity="0.5" />
          </g>
          <path
            d="M0,512 C260,452 520,498 760,486 C1000,474 1240,512 1440,484 L1440,900 L0,900 Z"
            fill="url(#nf-hill-back)"
          />
          <path
            d="M512,900 C636,776 800,612 944,506 L988,506 C868,616 752,784 904,900 Z"
            fill="url(#nf-path)"
            opacity="0.92"
          />
          <path
            d="M716,886 C772,772 856,628 956,512"
            stroke="#fbe6c2"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="2 26"
            opacity="0.7"
            fill="none"
          />
          <path
            d="M0,628 C320,576 660,650 1020,624 C1220,609 1360,640 1440,632 L1440,900 L0,900 Z"
            fill="url(#nf-hill-front)"
          />
        </svg>
      </div>

      {/* z1: 교회 사진 (흑백 정규화) */}
      <NotFoundBackground />

      {/* z2: 듀오톤 틴트 */}
      <div className={clsx(styles.tint, styles.tint_navy)} />
      <div className={clsx(styles.tint, styles.tint_gold)} />

      {/* z3: 스크림 */}
      <div className={styles.scrim} />
      <div className={styles.scrim_edge} />

      {/* z4: 콘텐츠 */}
      <div className={styles.frame}>
        <Link href="/" className={clsx(styles.brand, styles.rise, styles.d1)}>
          <svg
            className={styles.brand_mark}
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="20" cy="20" r="19.5" stroke="currentColor" strokeOpacity="0.45" />
            <rect x="18.6" y="11" width="2.8" height="18" rx="1" fill="currentColor" />
            <rect x="14" y="16.4" width="12" height="2.8" rx="1" fill="currentColor" />
          </svg>
          <span className={styles.brand_text}>
            <span className={styles.brand_name}>대구동남교회</span>
            <span className={styles.brand_sub}>Daegu Dongnam Church</span>
          </span>
        </Link>

        <div className={styles.body}>
          <span className={clsx(styles.tag, styles.rise, styles.d2)}>Error 404</span>
          <h1 className={clsx(styles.title, styles.rise, styles.d2)}>페이지를 찾을 수 없습니다</h1>
          <p className={clsx(styles.lead, styles.rise, styles.d3)}>
            요청하신 페이지가 존재하지 않거나 주소가 변경되었습니다. 아래에서 다시 길을 찾으실 수
            있습니다.
          </p>
          <div className={clsx(styles.actions, styles.rise, styles.d4)}>
            <Link href="/" className={styles.btn_home}>
              <span>홈으로 돌아가기</span>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </Link>
            <NotFoundBackButton />
          </div>
        </div>

        <div className={clsx(styles.foot, styles.rise, styles.d5)}>
          <nav className={styles.quick}>
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <p className={styles.verse}>
            “주의 말씀은 내 발에 등이요 내 길에 빛이니이다”
            <span className={styles.verse_ref}>시편 119:105</span>
          </p>
        </div>
      </div>
    </div>
  );
}
