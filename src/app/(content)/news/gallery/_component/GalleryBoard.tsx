'use client';

import { useState } from 'react';
import GalleryComposer from './GalleryComposer';
import GalleryFeed from './GalleryFeed';
import GalleryComposeSheet from './GalleryComposeSheet';
import GalleryPostSheet from './GalleryPostSheet';
import type { GalleryPost } from '../_types';

// 피드 + 두 모달의 상태를 쥐는 client 래퍼. 컴포저 → 작성 모달, 카드 → 상세 모달.
export default function GalleryBoard({ posts }: { posts: GalleryPost[] }) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [detailPost, setDetailPost] = useState<GalleryPost | null>(null);

  return (
    <>
      <GalleryComposer onClick={() => setComposeOpen(true)} />
      <GalleryFeed posts={posts} onOpenDetail={setDetailPost} />
      <GalleryComposeSheet open={composeOpen} onClose={() => setComposeOpen(false)} />
      <GalleryPostSheet post={detailPost} onClose={() => setDetailPost(null)} />
    </>
  );
}
