import { PiChurchLight, PiHandHeartLight } from 'react-icons/pi';
import { LiaBibleSolid } from 'react-icons/lia';
import { LayoutContainer } from '@/app/_component/layout/common';
import IconWrap from '@/app/_component/common/IconWrap';
import styles from './ChurchVision.module.scss';

export default function ChurchVision() {
  return (
    <section className={styles.vision}>
      <LayoutContainer>
        <div className={styles.title}>
          <span className={styles.caption}>우리의 비전</span>
          <h2>동남교회의 핵심 사역</h2>
        </div>
        <div className={styles.feature_container}>
          <div className={styles.feature}>
            <div className={styles.icon}>
              <IconWrap Icon={LiaBibleSolid} />
            </div>
            <h3>말씀과 훈련</h3>
            <p>
              성경공부, 제자훈련, 신앙교육을 통해 하나님의 주권을 높이는 견고한 개혁주의 신앙 위에
              서도록 훈련합니다.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.icon}>
              <IconWrap Icon={PiChurchLight} />
            </div>
            <h3>따뜻한 교제</h3>
            <p>
              구역모임과 소그룹 활동을 통해 예수 그리스도의 통치를 인정하는 신자들의 따뜻한 사랑의
              공동체를 세워갑니다.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.icon}>
              <IconWrap Icon={PiHandHeartLight} />
            </div>
            <h3>지역 사회 섬김</h3>
            <p>
              우리 자신을 부인하는 내적 성결과 겸손을 바탕으로 봉사와 선교를 통해 신앙과 윤리가
              일치된 삶을 실천합니다.
            </p>
          </div>
        </div>
      </LayoutContainer>
    </section>
  );
}
