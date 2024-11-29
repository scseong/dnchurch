import { MdOutlineEmail, MdOutlineCall } from 'react-icons/md';
import styles from './page.module.scss';

export default function About() {
  const servingInfo = [
    {
      name: '김성규',
      role: '담임목사',
      email: 'purityk@hanmail.net',
      phone: '053) 561-2787',
      photoUrl: '/images/senior.png'
    },
    {
      name: '박지권',
      role: '교육목사',
      email: 'email@hanmail.net',
      phone: '(053) 552-3403',
      photoUrl: '/images/education.png'
    }
  ];

  return (
    <section className={styles.about}>
      <h2>교회소개</h2>
      <section className={styles.banner}>
        <div className={styles.banner_info}>
          <h3>서로서로 세워가는 교회</h3>
          <ul>
            <li>1. 예배로</li>
            <li>2. 믿음과 행함으로</li>
            <li>3. 전도로</li>
          </ul>
        </div>
        <div className={styles.banner_bg}></div>
      </section>
      <section className={styles.greeting}>
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
      </section>
      <section className={`${styles.serving_people} ${styles.wrap}`}>
        <h3>섬기는 이</h3>
        <div>
          {servingInfo.map((info) => (
            <article className={styles.profile} key={info.name}>
              <div className={styles.profile_photo}>
                <img src={info.photoUrl} alt={`${info.name} ${info.role}`} />
              </div>
              <div className={styles.profile_info}>
                <div>
                  <h4>
                    {info.name} {info.role}
                  </h4>
                  <address>
                    <p>
                      <MdOutlineEmail /> {info.email}
                    </p>
                    <p>
                      <MdOutlineCall /> {info.phone}
                    </p>
                  </address>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
