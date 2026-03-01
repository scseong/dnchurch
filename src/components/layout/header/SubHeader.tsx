import CloudinaryImage from '@/components/common/CloudinaryImage';
import styles from './SubHeader.module.scss';

export default function SubHeader({ title }: { title: string }) {
  const IMAGE_URL = 'dnchurch_nxmttl';

  return (
    <section className={styles.hero}>
      <CloudinaryImage
        src={IMAGE_URL}
        alt="대구동남교회 이미지"
        fill
        preload
        fetchPriority="high"
        className={styles.hero_image}
      />
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>DONGNAM PRESBYTERIAN CHURCH</p>
      </div>
    </section>
  );
}
