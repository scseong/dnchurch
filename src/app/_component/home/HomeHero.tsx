import styles from './HomeHero.module.scss';

export default function HomeHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.intro}>
        <h2>동남교회에 오신 것을 환영합니다</h2>
        <div>
          <p>
            <strong>바른 신학, 바른 교회, 바른 생활</strong>의 3대 이념 아래 흔들림 없이 서서,
            하나님의 말씀이 삶의 기준이 되는 견고하고 건강한 공동체를 세워가는 것을 최우선 목적으로
            합니다. 이 땅에 하나님 나라를 확장하는 소명 앞에 굳게 서 있습니다.
          </p>
        </div>
      </div>
      <div className={styles.img_container}>
        <div className={styles.img_wrap}>
          <img src="/images/church.png" alt="대구동남교회" />
        </div>
        <div className={styles.content_wrapper}>
          <dl>
            <div>
              <dt>주일예배</dt>
              <dd>
                <time dateTime="일 11:00">일 11:00</time>
                <time dateTime="일 18:00">일 18:00</time>
              </dd>
            </div>
            <div>
              <dt>기도회</dt>
              <dd>
                <time dateTime="수 19:00">수 19:00</time>
                <time dateTime="금 20:00">금 20:00</time>
              </dd>
            </div>
            <div>
              <dt>주소</dt>
              <dd>
                <address>달서구 달구벌대로307길 58</address>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
