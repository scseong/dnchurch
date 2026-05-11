import Link from 'next/link';
import { LayoutContainer } from '@/components/layout';
import CloudinaryImage from '@/components/common/CloudinaryImage';
// eslint-disable-next-line no-restricted-imports -- 점진 마이그레이션 대상 (tech-debt-tracker.md)
import { getSiteSettings } from '@/apis/site-settings';
import { revealStyle } from '@/utils/reveal';
import styles from './AboutOurChurch.module.scss';

export default async function AboutOurChurch() {
  const settings = await getSiteSettings(['about_slogan', 'about_intro_1', 'about_intro_2', 'about_church_image']);

  return (
    <section className={styles.about}>
      <LayoutContainer>
        <div className={styles.container}>
          <div data-reveal style={revealStyle()} className={styles.image_container}>
            <div className={styles.frame}>
              <CloudinaryImage
                src={settings.about_church_image ?? 'about_church_qyqtpk'}
                alt="대구동남교회 입구 아치형 구조물"
                fill
                sizes="(max-width:768px) 100vw, 40vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
          </div>
          <div data-reveal style={revealStyle(0.15)} className={styles.about_info}>
            <span>{settings.about_slogan}</span>
            <h2>동남교회를 소개합니다</h2>
            <div className={styles.about_content}>
              <p>{settings.about_intro_1}</p>
              <p>{settings.about_intro_2}</p>
            </div>
            <Link href="/about" className={styles.about_link}>교회소개 살펴보기 →</Link>
          </div>
        </div>
      </LayoutContainer>
    </section>
  );
}
