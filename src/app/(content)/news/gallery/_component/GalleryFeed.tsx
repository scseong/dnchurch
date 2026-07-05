import GalleryPostCard from './GalleryPostCard';
import type { GalleryPost } from '../_types';
import styles from './gallery.module.scss';

export default function GalleryFeed({ posts }: { posts: GalleryPost[] }) {
  if (posts.length === 0) {
    return <p className={styles.empty}>조건에 맞는 순간이 없어요</p>;
  }

  return (
    <div className={styles.feed}>
      {posts.map((post) => (
        <GalleryPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
