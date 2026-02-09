import { CldImage } from 'next-cloudinary';
import styles from './TopHero.module.scss';

export default function TopHero({ title }: { title: string }) {
  const publicId = 'dnchurch_nxmttl';

  return (
    <section className={styles.hero}>
      <CldImage
        src={publicId}
        alt="Dongnam Presbyterian Church"
        fill
        crop="fill"
        gravity="auto"
        quality="auto"
        format="auto"
        rawTransformations={['f_auto', 'q_auto:eco']}
        className={styles.hero_image}
        sizes="(max-width: 1280px) 100vw, 1200px"
        preload
        fetchPriority="high"
      />

      <h2>{title}</h2>
      <p>DONGNAM PRESBYTERIAN CHURCH</p>
    </section>
  );
}
