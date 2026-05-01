import KakaoShareBtn from '@/components/common/KakaoShareButton';
import LatestBulletinImages from '@/app/(content)/news/bulletins/_component/LatestBulletinImages';
import { getCloudinaryUrl } from '@/utils/cloudinary';
import type { BulletinImageType } from '@/types/common';
import styles from './LastBulletin.module.scss';

type Props = {
  title: string;
  images: BulletinImageType[];
};

export default function LatestBulletin({ title, images }: Props) {
  const imageIds = images.map((img) => img.cloudinary_id);

  return (
    <section className={styles.latest_bulletin}>
      <div className={styles.notification}>
        <h3>이번 주 주보</h3>
        <p>{title || '게시된 주보가 없습니다.'} </p>
      </div>
      <div className={styles.images_wrap}>
        <LatestBulletinImages images={imageIds} />
      </div>
      <div className={styles.share}>
        <KakaoShareBtn
          title={`${title} | 대구동남교회`}
          description="이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요."
          imageUrl={getCloudinaryUrl(imageIds[0])}
        />
      </div>
    </section>
  );
}
