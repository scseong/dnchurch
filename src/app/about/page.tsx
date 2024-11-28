import styles from './page.module.scss';

export default function About() {
  return (
    <section className={styles.about}>
      <h2>교회소개</h2>
      <div className={styles.banner}>
        <div className={styles.banner_info}>
          <h3>서로서로 세워가는 교회</h3>
          <ul>
            <li>1. 예배로</li>
            <li>2. 믿음과 행함으로</li>
            <li>3. 전도로</li>
          </ul>
        </div>
        <div className={styles.banner_bg}></div>
      </div>
      <div className={styles.greeting}>
        <h3>
          동남교회에
          <br />
          오신 것을 환영합니다.
        </h3>
        <p>
          1952년에 설립된 동남교회는 하나님의 사랑을 나누고
          <br />
          믿음의 공동체를 세우기 위해 함께하는 곳입니다.
          <br />
          복음을 전파하여 더 많은 사람들이 예수 그리스도를 알게 되고
          <br />그 사랑을 경험하도록 힘씁니다.
        </p>
      </div>
    </section>
  );
}
