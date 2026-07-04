import Link from 'next/link';
import clsx from 'clsx';
import { IoChevronUp, IoChevronDown, IoCreateOutline } from 'react-icons/io5';
import PhotoSwipe from '@/components/common/PhotoSwipeLazy';
import UserIdMatcher from '@/app/_component/auth/UserIdMatcher';
import BulletinShareCard from '@/app/(content)/news/bulletins/_component/BulletinShareCard';
import { generateFileDownloadList } from '@/utils/file';
import { getOgImageUrl } from '@/utils/cloudinary';
import type { BulletinWithImages } from '@/types/bulletin';
import styles from './BulletinDetail.module.scss';

type AdjacentBulletin = { id: number; title: string } | null;

type PrevNext = {
  prev_id: number;
  prev_title: string;
  next_id: number;
  next_title: string;
} | null;

type Props = {
  bulletin: BulletinWithImages;
  prevNext: PrevNext;
};

/** 주보 상세 — 제목·이미지 갤러리(PhotoSwipe 확대)·공유 카드·이전/다음. 헤더 공유 버튼과 별개로 본문 공유 카드도 둔다(목업 일치). */
export default function BulletinDetail({ bulletin, prevNext }: Props) {
  const imageIds = [...bulletin.bulletin_images]
    .sort((a, b) => a.order_index - b.order_index)
    .map((image) => image.cloudinary_id);
  const files = generateFileDownloadList({ urls: imageIds });
  const shareImageUrl = getOgImageUrl(imageIds[0]) ?? undefined;

  const prev: AdjacentBulletin = prevNext?.prev_title
    ? { id: prevNext.prev_id, title: prevNext.prev_title }
    : null;
  const next: AdjacentBulletin = prevNext?.next_title
    ? { id: prevNext.next_id, title: prevNext.next_title }
    : null;

  return (
    <article className={styles.detail}>
      <header className={styles.head}>
        <div className={styles.title_row}>
          <h1 className={styles.title}>{bulletin.title}</h1>
          <UserIdMatcher userId={bulletin.author_id ?? ''}>
            <Link href={`/news/bulletins/${bulletin.id}/update`} className={styles.edit}>
              <IoCreateOutline aria-hidden="true" />
              수정
            </Link>
          </UserIdMatcher>
        </div>
      </header>

      {imageIds.length > 0 ? (
        <div className={styles.images}>
          <PhotoSwipe images={imageIds} width={2105} height={1488} pageBadge className={styles.gallery} />
        </div>
      ) : (
        <div className={styles.no_image}>등록된 주보 이미지가 없습니다.</div>
      )}

      <BulletinShareCard title={bulletin.title} imageUrl={shareImageUrl} files={files} />

      <nav className={styles.adjacent} aria-label="이전·다음 주보">
        <AdjacentRow direction="prev" bulletin={prev} />
        <AdjacentRow direction="next" bulletin={next} />
      </nav>
    </article>
  );
}

function AdjacentRow({
  direction,
  bulletin
}: {
  direction: 'prev' | 'next';
  bulletin: AdjacentBulletin;
}) {
  const label = direction === 'prev' ? '이전 주보' : '다음 주보';
  const Icon = direction === 'prev' ? IoChevronUp : IoChevronDown;

  if (!bulletin) {
    const emptyText = direction === 'prev' ? '이전 주보가 없습니다' : '다음 주보가 없습니다';
    return (
      <div className={clsx(styles.adjacent_row, styles.adjacent_empty)}>
        <span className={styles.adjacent_label}>
          <Icon aria-hidden="true" />
          {label}
        </span>
        <span className={styles.adjacent_none}>{emptyText}</span>
      </div>
    );
  }

  return (
    <Link href={`/news/bulletins/${bulletin.id}`} className={styles.adjacent_row}>
      <span className={styles.adjacent_label}>
        <Icon aria-hidden="true" />
        {label}
      </span>
      <span className={styles.adjacent_title}>{bulletin.title}</span>
    </Link>
  );
}
