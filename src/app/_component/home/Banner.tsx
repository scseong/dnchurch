import Link from 'next/link';
import CloudinaryImage from '@/components/common/CloudinaryImage';
// eslint-disable-next-line no-restricted-imports -- 점진 마이그레이션 대상 (tech-debt-tracker.md)
import { getSiteSettings } from '@/apis/site-settings';
import { getRevealStyle } from '@/utils/reveal';
import styles from './Banner.module.scss';
import SettingsText from '@/components/common/SettingsText';

export default async function Banner() {
  const settings =
    (await getSiteSettings(['banner_label', 'banner_title', 'banner_subtitle', 'banner_image'])) ||
    {};

  const { banner_label, banner_title, banner_subtitle, banner_image } = settings;

  return (
    <section className={styles.banner}>
      <div className={styles.bg}>
        <CloudinaryImage
          src={banner_image}
          alt="대구동남교회 전경과 십자가 탑"
          fetchPriority="high"
          preload
          sizes="100vw"
          fill
        />
        <div className={styles.overlay} aria-hidden="true" />
      </div>
      <div className={styles.content}>
        <span className={styles.label} data-reveal style={getRevealStyle()}>
          {banner_label}
        </span>
        <h1 data-reveal style={getRevealStyle(1)}>
          <SettingsText value={banner_title} lineClassNames={{ 1: styles.title_highlight }} />
        </h1>
        <p data-reveal style={getRevealStyle(2)}>
          {banner_subtitle}
        </p>
        <div className={styles.cta} data-reveal style={getRevealStyle(3)}>
          <Link href="/about" className={styles.btn_primary}>
            <UserIcon />
            처음 오셨나요?
          </Link>
          <Link href="/news/bulletin" className={styles.btn_secondary}>
            <PlayIcon />
            이번 주 말씀 보기
          </Link>
        </div>
      </div>
    </section>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
