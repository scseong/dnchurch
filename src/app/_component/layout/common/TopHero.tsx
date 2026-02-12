import CloudinaryImage from '@/app/_component/common/CloudinaryImage';
import styles from './TopHero.module.scss';

export default function TopHero({ title }: { title: string }) {
  const IMAGE_URL =
    'https://res.cloudinary.com/dnchurch/image/upload/v1770628693/dnchurch_nxmttl.png';

  return (
    <section className={styles.hero}>
      <CloudinaryImage
        src={IMAGE_URL}
        alt="대구동남교회 이미지"
        width={1920}
        sizes="100vw"
        crop="fill"
        srcsetWidths={[1024, 1920]}
        priority
        className={styles.hero_image}
      />
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>DONGNAM PRESBYTERIAN CHURCH</p>
      </div>
    </section>
  );
}
