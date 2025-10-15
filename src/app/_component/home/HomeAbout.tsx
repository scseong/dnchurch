import styles from './HomeAbout.module.scss';

export default function HomeAbout() {
  return (
    <section className={styles.about}>
      <div className={styles.container}>
        <div className={styles.content_wrap}>
          <div className={styles.image}>
            <img src="/images/church2.png" alt="동남교회" />
          </div>
          <div>
            <h3>동남교회는</h3>
            <p>...</p>
          </div>
        </div>
      </div>
    </section>
  );
}
