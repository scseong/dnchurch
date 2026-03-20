import Link from 'next/link';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { getSiteSettings } from '@/apis/site-settings';
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
        <span className={styles.scripture}>{settings.banner_scripture}</span>
        <h1>{settings.banner_title}</h1>
        <p>{settings.banner_subtitle}</p>
        <div className={styles.cta}>
          <Link href="/about" className={styles.btn_primary}>
            처음 오셨나요?
          </Link>
          <Link href="/news/bulletin" className={styles.btn_secondary}>
            이번 주 말씀 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
