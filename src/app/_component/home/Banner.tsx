import Link from 'next/link';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import SettingsText from '@/components/common/SettingsText';
import { getSiteSettings } from '@/apis/site-settings';
import styles from './Banner.module.scss';

export default async function Banner() {
  const settings = await getSiteSettings(['banner_title', 'banner_subtitle', 'banner_image']);

  return (
    <section className={styles.banner}>
      <div className={styles.bg}>
        <CloudinaryImage
          src={settings.banner_image ?? 'banner_nkbhnp'}
          alt="대구동남교회 전경과 십자가 탑"
          fill
          fetchPriority="high"
          sizes="100vw"
        />
        <div className={styles.overlay} aria-hidden="true" />
      </div>
      <div className={styles.content}>
        <h1><SettingsText value={settings.banner_title} /></h1>
        <p><SettingsText value={settings.banner_subtitle} /></p>
        <Link href="/about" className={styles.learn_more}>
          처음 오셨나요?
        </Link>
      </div>
    </section>
  );
}
