import Link from 'next/link';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { getSiteSettings } from '@/apis/site-settings';
import { revealStyle, REVEAL_STEP_CONTENT } from '@/utils/reveal';
import styles from './Banner.module.scss';

export default async function Banner() {
  const settings = await getSiteSettings([
    'banner_scripture',
    'banner_title',
    'banner_subtitle',
    'banner_image'
  ]);

  return (
    <section className={styles.banner}>
      <div className={styles.bg}>
        <CloudinaryImage
          src={settings.banner_image}
          alt="대구동남교회 전경과 십자가 탑"
          fetchPriority="high"
          preload
          sizes="100vw"
          fill
        />
        <div className={styles.overlay} aria-hidden="true" />
      </div>
      <div className={styles.content}>
        <span className={styles.scripture} data-reveal style={revealStyle()}>
          {settings.banner_scripture}
        </span>
        <h1 data-reveal style={revealStyle(REVEAL_STEP_CONTENT)}>
          {settings.banner_title}
        </h1>
        <p data-reveal style={revealStyle(REVEAL_STEP_CONTENT * 2)}>
          {settings.banner_subtitle}
        </p>
        <div className={styles.cta} data-reveal style={revealStyle(REVEAL_STEP_CONTENT * 3)}>
          <Link href="/about" className={styles.btn_primary}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            처음 오셨나요?
          </Link>
          <Link href="/news/bulletin" className={styles.btn_secondary}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              width="16"
              height="16"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            이번 주 말씀 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
