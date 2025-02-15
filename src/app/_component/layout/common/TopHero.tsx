import styles from './TopHero.module.scss';

export default function TopHero({ title }: { title: string }) {
  return (
    <section className={styles.hero}>
      <h2>{title}</h2>
      <p>DONGNAM PRESBYTERIAN CHURCH</p>
    </section>
  );
}
