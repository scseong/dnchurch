import Link from 'next/link';
import { LayoutContainer } from '@/components/layout';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import styles from './Banner.module.scss';

export default async function Banner() {
  const BANNER_PUBLIC_ID = 'banner_nkbhnp';

  return (
    <section>
      <div className={styles.banner}>
        <LayoutContainer>
          <CloudinaryImage
            src={BANNER_PUBLIC_ID}
            alt="대구동남교회 전경과 십자가 탑"
            fill
            fetchPriority="high"
            sizes="100vw"
            className={styles.banner_image}
          />
          <div className={styles.overlay} aria-hidden="true" />
          <div className={styles.content}>
            <h1>
              동남교회에 오신 것을
              <br />
              환영합니다
            </h1>
            <p>
              수고하고 무거운 짐진 당신을 주님의 사랑으로 초대합니다.&nbsp;
              <br className="hidden-on-mobile" />
              마음의 짐을 내려놓고 참된 안식을 누리세요.
            </p>
            <Link href="/about" className={styles.learn_more}>
              처음 오셨나요?
            </Link>
          </div>
        </LayoutContainer>
      </div>
    </section>
  );
}
