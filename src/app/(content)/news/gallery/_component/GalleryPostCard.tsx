'use client';

import clsx from 'clsx';
import type { IconType } from 'react-icons';
import { LuSun, LuHeart, LuFlame, LuSparkles, LuMessageCircle } from 'react-icons/lu';
import Avatar from './Avatar';
import GalleryPhotos from './GalleryPhotos';
import { REACTION_TYPES, type GalleryPost, type ReactionType } from '../_types';
import styles from './gallery.module.scss';

// 교회형 반응 아이콘 매핑 (읽기 전용 표시).
const REACTION_ICON: Record<ReactionType, IconType> = {
  은혜: LuSun,
  아멘: LuHeart,
  기도해요: LuFlame,
  축복: LuSparkles
};

type Props = {
  post: GalleryPost;
  onOpenDetail: () => void;
};

export default function GalleryPostCard({ post, onOpenDetail }: Props) {
  const topComment = post.comments[0] ?? null;

  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <Avatar initial={post.avatarInitial} color={post.avatarColor} size="lg" />
        <div className={styles.head_text}>
          <b className={styles.author}>{post.authorName}</b>
          <span className={styles.meta}>
            {post.department} · {post.createdLabel}
          </span>
        </div>
      </header>

      {post.photos.length > 0 && <GalleryPhotos photos={post.photos} onOpen={onOpenDetail} />}

      {post.text && <p className={styles.caption}>{post.text}</p>}

      {/* 반응은 읽기 전용 표시 — 카운트만 보여주고 토글은 후속 단계. */}
      <div className={styles.reactions}>
        {REACTION_TYPES.map((type) => {
          const Icon = REACTION_ICON[type];
          const active = post.viewerReaction === type;

          return (
            <span key={type} className={clsx(styles.reaction, active && styles.reaction_on)}>
              <Icon className={styles.reaction_icon} aria-hidden="true" />
              <span className={styles.reaction_label}>{type}</span>
              <span className={styles.reaction_count}>{post.reactions[type]}</span>
            </span>
          );
        })}
      </div>

      <div className={styles.foot}>
        <button type="button" className={styles.comment_stat} onClick={onOpenDetail}>
          <LuMessageCircle aria-hidden="true" />
          댓글 {post.commentCount}
        </button>
      </div>

      {topComment && (
        <div className={styles.preview}>
          <Avatar initial={topComment.avatarInitial} color={topComment.avatarColor} size="sm" />
          <div className={styles.preview_body}>
            <b className={styles.preview_author}>{topComment.authorName}</b>
            <span className={styles.preview_text}>{topComment.text}</span>
            {post.commentCount > 1 && (
              <button type="button" className={styles.preview_more} onClick={onOpenDetail}>
                댓글 {post.commentCount}개 모두 보기
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
