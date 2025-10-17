import { PiChurch } from 'react-icons/pi';
import { LayoutContainer } from '../layout/common';
import IconWrap from '../common/IconWrap';
import styles from './HomeAbout.module.scss';

export default function HomeAbout() {
  return (
    <section className={styles.about}>
      <LayoutContainer>
        <div className={styles.title}>
          <span className={styles.caption}>우리의 비전</span>
          <h2>동남교회의 핵심 사역</h2>
        </div>
        <div className={styles.feature_container}>
          <div className={styles.feature}>
            <div className={styles.icon}>
              <IconWrap Icon={PiChurch} />
            </div>
            <h5>말씀과 훈련</h5>
            <p>
              성경공부, 제자훈련, 신앙교육을 통해 하나님의 주권을 높이는 견고한 개혁주의 신앙 위에
              서도록 훈련합니다.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.icon}>
              <IconWrap Icon={PiChurch} />
            </div>
            <h5>말씀과 훈련</h5>
            <p>
              성경공부, 제자훈련, 신앙교육을 통해 하나님의 주권을 높이는 견고한 개혁주의 신앙 위에
              서도록 훈련합니다.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.icon}>
              <IconWrap Icon={PiChurch} />
            </div>
            <h5>말씀과 훈련</h5>
            <p>
              성경공부, 제자훈련, 신앙교육을 통해 하나님의 주권을 높이는 견고한 개혁주의 신앙 위에
              서도록 훈련합니다.
            </p>
          </div>
        </div>
      </LayoutContainer>
    </section>
  );
}
