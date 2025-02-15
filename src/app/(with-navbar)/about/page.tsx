import { MdOutlineEmail, MdOutlineCall, MdLocationOn, MdDirectionsBus } from 'react-icons/md';
import styles from './page.module.scss';
import WorshipSchedule from './_component/WorshipSchedule';
import LocationMap from './_component/LocationMap';

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
      <section className={styles.wrap}>
        <h3 id="worship_info">예배안내</h3>
        <WorshipSchedule />
      </section>
      <section className={styles.wrap}>
        <h3>오시는 길</h3>
        <div className={styles.directions}>
          <LocationMap
            lat={35.85262832577055}
            lng={128.53467835707838}
            width="60%"
            height="30rem"
          />
          <div className={styles.directions_info}>
            <div className={styles.container}>
              <div className={styles.icon}>
                <MdLocationOn />
              </div>
              <div className={styles.info}>
                <h4>주소</h4>
                <p>대구광역시 달서구 달구벌대로307길 58 (죽전동)</p>
              </div>
            </div>
            <div className={styles.container}>
              <div className={styles.icon}>
                <MdDirectionsBus />
              </div>
              <div className={styles.info}>
                <h4>대중교통</h4>
                <p>
                  <span>지하철</span> 2호선 죽전역 1번 출구
                </p>
                <p>
                  <span>버스</span> 405, 425, 503, 509, 527, 달서5, 성서2, 250
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
