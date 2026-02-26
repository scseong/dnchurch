import KakaoShareBtn from '@/app/_component/common/KakaoShare';
import LatestBulletinImages from '@/app/(with-navbar)/news/bulletin/_component/LatestBulletinImages';
import { getCloudinaryUrl } from '@/utils/cloudinary';
import { BulletinType } from '@/types/common';
import styles from './LastBulletin.module.scss';

export default function LatestBulletin({
  title,
  image_url: images
}: Pick<BulletinType, 'title' | 'image_url'>) {
  return (
    <section className={styles.latest_bulletin}>
      <div className={styles.notification}>
        <h3>이번 주 주보</h3>
        <p>{title || '게시된 주보가 없습니다.'} </p>
      </div>
      <div className={styles.images_wrap}>
        <LatestBulletinImages images={images} />
      </div>
      <div className={styles.share}>
        <KakaoShareBtn
          title={`${title} | 대구동남교회`}
          description="이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요."
          imageUrl={getCloudinaryUrl(images[0])}
        />
      </div>
    </section>
  );
}
