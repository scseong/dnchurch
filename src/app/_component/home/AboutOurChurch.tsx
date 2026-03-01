import Link from 'next/link';
import { LayoutContainer } from '@/components/layout';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import styles from './AboutOurChurch.module.scss';

export default async function AboutOurChurch() {
  const IMAGE_PUBLIC_ID = 'about_church_qyqtpk';

  return (
    <section className={styles.about}>
      <LayoutContainer>
        <div className={styles.container}>
          <div className={styles.image_container}>
            <div className={styles.frame}>
              <CloudinaryImage
                src={IMAGE_PUBLIC_ID}
                alt="대구동남교회 입구 아치형 구조물"
                fill
                sizes="(max-width:768px) 100vw, 40vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
          </div>
          <div className={styles.about_info}>
            <span>바른 신학, 바른 교회, 바른 생활</span>
            <h2>동남교회를 소개합니다</h2>
            <div className={styles.about_content}>
              <p>
                동남교회는 대한예수교장로회(합신) 교단 소속으로, 오직 성경만을 유일한 규칙으로 삼는
                개혁주의 신앙을 고백합니다. 바른 신학 위에 굳건히 서서 이 땅에 하나님 나라를
                확장하는 건강한 공동체를 세우는 것을 최우선 목적으로 합니다.
              </p>
              <p>
                바른 신학의 토대 위에서 바른 교회, 바른 생활의 정신을 실천합니다. 그리스도께서
                모범을 보이신 것처럼 모든 성도가 겸손한 섬김의 자세로 서로를 존중하며 사랑 안에서
                굳건히 연합하는 공동체를 지향합니다.
              </p>
            </div>
            <Link href="/about">교회소개 살펴보기</Link>
          </div>
        </div>
      </LayoutContainer>
    </section>
  );
}
