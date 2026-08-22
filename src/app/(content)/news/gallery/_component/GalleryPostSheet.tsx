'use client';

import { useState } from 'react';
import { IoChevronBack } from 'react-icons/io5';
import {
  LuEllipsis,
  LuSend,
  LuSun,
  LuHeart,
  LuFlame,
  LuSparkles,
  LuMessageCircle
} from 'react-icons/lu';
import type { IconType } from 'react-icons';
import clsx from 'clsx';
import { BottomSheet, Textarea } from '@/components/ui';
import { useToastStore } from '@/store/toast.store';
import Avatar from './Avatar';
import GalleryPhotos from './GalleryPhotos';
import { REACTION_TYPES, type GalleryPost, type ReactionType } from '../_types';
import styles from './gallery.module.scss';

const REACTION_ICON: Record<ReactionType, IconType> = {
  은혜: LuSun,
  아멘: LuHeart,
  기도해요: LuFlame,
  축복: LuSparkles
};

type Props = {
  post: GalleryPost | null;
  onClose: () => void;
};

// 게시글 상세 모달 — 목업의 풀스크린 상세. 사진 라이트박스·댓글 목록을 보여준다.
// 읽기 전용/UI 단계라 댓글 전송·반응 토글은 없다(안내 토스트).
export default function GalleryPostSheet({ post, onClose }: Props) {
  const info = useToastStore((state) => state.info);
  const [comment, setComment] = useState('');

  // 닫힘 애니메이션 동안 콘텐츠가 즉시 사라지지 않게 마지막 post를 유지한다(open은 post로, 렌더는 activePost로).
  const [activePost, setActivePost] = useState<GalleryPost | null>(post);
  if (post && post !== activePost) {
    setActivePost(post);
  }

  const handleSend = () => {
    info('댓글은 준비 중이에요. 곧 남길 수 있어요.');
    setComment('');
  };

  const header = (
    <div className={styles.sheet_head}>
      <button type="button" className={styles.sheet_head_btn} onClick={onClose} aria-label="뒤로 가기">
        <IoChevronBack />
      </button>
      <h2 className={styles.sheet_title}>게시글</h2>
      <button
        type="button"
        className={styles.sheet_head_btn}
        onClick={() => info('준비 중이에요.')}
        aria-label="더보기"
      >
        <LuEllipsis />
      </button>
    </div>
  );

  const footer = activePost ? (
    <div className={styles.comment_form}>
      <span className={styles.self_avatar_sm} aria-hidden="true">
        나
      </span>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={1}
        autoGrow
        aria-label="댓글 입력"
        placeholder="따뜻한 한마디를 남겨보세요"
        className={styles.comment_input}
      />
      <button type="button" className={styles.comment_send} onClick={handleSend} aria-label="댓글 남기기">
        <LuSend aria-hidden="true" />
      </button>
    </div>
  ) : null;

  return (
    <BottomSheet
      open={Boolean(post)}
      onClose={onClose}
      size="full"
      ariaLabel="게시글"
      enableHistory
      header={header}
      footer={footer}
    >
      {activePost && (
        <div className={styles.detail_body}>
          <div className={styles.detail_head}>
            <Avatar initial={activePost.avatarInitial} color={activePost.avatarColor} size="lg" />
            <div className={styles.head_text}>
              <b className={styles.author}>{activePost.authorName}</b>
              <span className={styles.meta}>
                {activePost.department} · {activePost.createdLabel}
              </span>
            </div>
            <span className={styles.detail_cat}>{activePost.category}</span>
          </div>

          {activePost.photos.length > 0 && <GalleryPhotos photos={activePost.photos} />}

          {activePost.text && <p className={styles.detail_caption}>{activePost.text}</p>}

          <div className={styles.reactions}>
            {REACTION_TYPES.map((type) => {
              const Icon = REACTION_ICON[type];
              const active = activePost.viewerReaction === type;

              return (
                <span key={type} className={clsx(styles.reaction, active && styles.reaction_on)}>
                  <Icon className={styles.reaction_icon} aria-hidden="true" />
                  <span className={styles.reaction_label}>{type}</span>
                  <span className={styles.reaction_count}>{activePost.reactions[type]}</span>
                </span>
              );
            })}
          </div>

          <h3 className={styles.comment_title}>
            댓글 <span className={styles.comment_num}>{activePost.commentCount}</span>
          </h3>

          {activePost.comments.length === 0 ? (
            <p className={styles.comment_empty}>
              <LuMessageCircle aria-hidden="true" />
              아직 댓글이 없어요. 첫 마음을 남겨보세요.
            </p>
          ) : (
            <ul className={styles.comment_list}>
              {activePost.comments.map((item) => (
                <li key={item.id} className={styles.comment_item}>
                  <Avatar initial={item.avatarInitial} color={item.avatarColor} size="sm" />
                  <div className={styles.comment_body}>
                    <div className={styles.comment_meta}>
                      <b className={styles.comment_author}>{item.authorName}</b>
                      <span className={styles.comment_time}>{item.createdLabel}</span>
                    </div>
                    <p className={styles.comment_text}>{item.text}</p>
                    <div className={styles.comment_actions}>
                      <span className={styles.comment_action}>공감</span>
                      <span className={styles.comment_action}>답글</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
