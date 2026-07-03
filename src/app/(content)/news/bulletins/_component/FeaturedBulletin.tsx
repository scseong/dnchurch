import Link from 'next/link';
import { IoChevronForward, IoImagesOutline } from 'react-icons/io5';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { bulletinDateLabel } from '@/utils/date';
import type { BulletinWithImages } from '@/types/bulletin';
import styles from './FeaturedBulletin.module.scss';

type Props = {
  bulletin: BulletinWithImages | null;
};

/** '이번 주 주보' featured 카드 — 표지 이미지 + 날짜 + 제목 + 이미지 수. 통째로 상세 링크. */
export default function FeaturedBulletin({ bulletin }: Props) {
  if (!bulletin) {
    return <div className={styles.empty}>아직 게시된 주보가 없습니다.</div>;
  }

  const cover = [...bulletin.bulletin_images].sort((a, b) => a.order_index - b.order_index)[0];
  const imageCount = bulletin.bulletin_images.length;

  return (
    <Link href={`/news/bulletins/${bulletin.id}`} className={styles.card} prefetch={false}>
      <div className={styles.cover}>
        {cover ? (
          <CloudinaryImage
            src={cover.cloudinary_id}
            alt={`${bulletin.title} 표지`}
            fill
            sizes="(min-width: 768px) 640px, 100vw"
          />
        ) : (
          <div className={styles.cover_placeholder} aria-hidden="true" />
        )}
        <span className={styles.badge}>
          <span className={styles.badge_dot} aria-hidden="true" />
          이번 주 주보
        </span>
      </div>
      <div className={styles.body}>
        <p className={styles.date}>{bulletinDateLabel(bulletin.sunday_date)}</p>
        <h2 className={styles.title}>{bulletin.title}</h2>
        <div className={styles.foot}>
          {imageCount > 0 && (
            <span className={styles.count}>
              <IoImagesOutline aria-hidden="true" />
              {imageCount}장
            </span>
          )}
          <span className={styles.cta}>
            펼쳐보기
            <IoChevronForward aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
