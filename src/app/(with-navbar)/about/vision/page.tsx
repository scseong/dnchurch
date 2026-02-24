import type { Metadata } from 'next';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import CloudinaryImage from '@/app/_component/common/CloudinaryImage';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '교회의 비전 - 대구동남교회',
  description: '2025년 교회목표 - 주님의 기도를 배우는 교회(성도)',
  openGraph: {
    title: '교회의 비전 - 대구동남교회',
    description: '2025년 교회목표 - 주님의 기도를 배우는 교회(성도)'
  }
};

const IMAGE_URL = 'dnchurch_nxmttl';

export default function Vision() {
  return (
    <MainContainer title="교회의 비전">
      <div className={styles.wrap}>
        {/* TODO: 임시 내용을 실제 내용으로 변경  */}
        <div className={styles.vision_text}>
          <p className={styles.greeting_text}>
            <em>동남교회에 오신 것을 환영합니다.</em>
          </p>
          <p>
            동남교회는 1952년에 설립된 이후, 하나님의 사랑을 나누고 믿음의 공동체를 세우기 위해
            함께하는 곳입니다. 우리는 복음을 전파하여 더 많은 사람들이 예수 그리스도를 알게 되고 그
            사랑을 경험하도록 힘쓰고 있습니다. 우리의 비전은 하나님의 사랑을 모든 이와 나누고,
            서로를 격려하며 지지하는 믿음의 공동체를 형성하는 것입니다.
          </p>
          <p>
            우리는 함께 기도하고 성장하며, 복음을 확산시키는 사역에 헌신하고 있습니다. 지역 사회와
            세계를 향한 사역을 통해, 많은 이들에게 하나님의 사랑과 은혜를 전하는 데 힘쓰고 있습니다.
            또한, 우리는 다음 세대의 양육을 중요시하며, 어린이와 청소년들이 하나님을 경험하고 신앙을
            심화할 수 있는 다양한 프로그램을 제공하고 있습니다.
          </p>
          <p>
            동남교회는 모든 사람이 하나님의 사랑을 경험하고, 믿음의 공동체 안에서 함께 성장할 수
            있도록 최선을 다하고 있습니다. 우리는 각자의 재능과 은사를 활용하여 서로를 섬기고,
            하나님의 사역에 동참하길 원합니다. 이러한 비전을 통해, 우리는 하나님께서 우리에게 주신
            사명을 충실히 이행하며, 세상을 변화시키는 도구로 살아가고자 합니다.
          </p>
          <p>
            우리의 목표는 각 성도가 하나님과의 깊은 관계를 구축하고, 이웃과 사회에 긍정적인 영향을
            미치는 것입니다. 우리는 함께 이 비전을 이루어 나가길 소망하며, 하나님께서 주신 사랑을
            세상에 전하기 위해 끊임없이 노력할 것입니다.
          </p>
        </div>
        <div className={styles.image_wrap}>
          <CloudinaryImage
            src={IMAGE_URL}
            width={1920}
            height={1080}
            alt="대구동남교회 전경"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>
      </div>
    </MainContainer>
  );
}
