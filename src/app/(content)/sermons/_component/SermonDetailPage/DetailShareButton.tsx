'use client';

import { useState } from 'react';
import { IoShareSocialOutline } from 'react-icons/io5';
import ShareSheet from '@/components/layout/Header/ShareSheet';
import styles from './SermonDetailPage.module.scss';

// 데스크톱 전용 공유 트리거 — 모바일은 헤더 공유 버튼(MobileHeader)이 담당하고,
// PC·태블릿은 헤더가 경로별 액션을 바꾸지 않아 상세 본문에서 같은 ShareSheet를 연다.
export default function DetailShareButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.share_button}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <IoShareSocialOutline aria-hidden="true" />
        <span>공유</span>
      </button>
      <ShareSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
