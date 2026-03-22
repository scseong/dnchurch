'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { revealStyle, REVEAL_STEP, REVEAL_STEP_CONTENT } from '@/utils/reveal';
import { isRecent, formattedDate } from '@/utils/date';
import type { NoticeType } from '@/types/notice';
import styles from './FeedContent.module.scss';

type Tab = 'news' | 'sharing';

type SharingItem = {
  id: number;
  title: string;
  author: string;
  date: string;
  isNew?: boolean;
};

// 임시 목 데이터 (추후 API 연동)
const SHARING_ITEMS: SharingItem[] = [
  {
    id: 1,
    title: '하나님의 은혜로 치유 받은 간증',
    author: '김은혜',
    date: '2026.03.21',
    isNew: true
  },
  { id: 2, title: '새가족 환영 예배 후기', author: '박새롬', date: '2026.03.19', isNew: true },
  { id: 3, title: '선교지에서 보내온 편지', author: '이선교', date: '2026.03.17' },
  { id: 4, title: '성경통독 완주 소감', author: '정성실', date: '2026.03.14' },
  { id: 5, title: '구역모임 나눔 이야기', author: '최사랑', date: '2026.03.11' }
];

type Props = {
  notices: NoticeType[];
};

export default function FeedContent({ notices }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('news');

  return (
    <>
      <div data-reveal style={revealStyle(REVEAL_STEP_CONTENT)} className={styles.tab_switcher}>
        <button
          type="button"
          className={activeTab === 'news' ? styles.tab_active : styles.tab_inactive}
          onClick={() => setActiveTab('news')}
        >
          교회 소식
        </button>
        <button
          type="button"
          className={activeTab === 'sharing' ? styles.tab_active : styles.tab_inactive}
          onClick={() => setActiveTab('sharing')}
        >
          은혜 나눔
        </button>
      </div>

      <div className={styles.grid} data-reveal style={revealStyle(REVEAL_STEP_CONTENT)}>
        {/* 교회 소식 */}
        <div className={clsx(styles.column, activeTab !== 'news' && styles.column_hidden)}>
          <div className={styles.column_header}>
            <h3 className={styles.column_title}>
              <span className={styles.color_bar_news} />
              교회 소식
            </h3>
            <Link href="/news/notice" className={styles.more_link}>
              더 보기 →
            </Link>
          </div>
          <div className={styles.list_card}>
            {notices.map((notice, i) => (
              <Link
                key={notice.id}
                href={`/news/notice/${notice.id}`}
                className={styles.item}
                data-reveal
                style={revealStyle(REVEAL_STEP_CONTENT + (i + 1) * REVEAL_STEP)}
              >
                <div className={styles.item_body}>
                  <span className={styles.item_title_row}>
                    {isRecent(notice.created_at) && (
                      <span className={styles.badge_new}>N</span>
                    )}
                    <span className={styles.item_title}>{notice.title}</span>
                  </span>
                  <span className={styles.item_meta}>
                    <span className={styles.item_date}>
                      {formattedDate(notice.created_at, 'YYYY.MM.DD')}
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 은혜 나눔 */}
        <div className={clsx(styles.column, activeTab !== 'sharing' && styles.column_hidden)}>
          <div className={styles.column_header}>
            <h3 className={styles.column_title}>
              <span className={styles.color_bar_sharing} />
              은혜 나눔
            </h3>
            <Link href="/fellowship" className={styles.more_link}>
              더 보기 →
            </Link>
          </div>
          <div className={styles.list_card}>
            {SHARING_ITEMS.map((item, i) => (
              <div
                key={item.id}
                className={styles.item}
                data-reveal
                style={revealStyle(REVEAL_STEP_CONTENT + REVEAL_STEP + (i + 1) * REVEAL_STEP)}
              >
                <div className={styles.item_body}>
                  <span className={styles.item_title_row}>
                    {item.isNew && <span className={styles.badge_new}>N</span>}
                    <span className={styles.item_title}>{item.title}</span>
                  </span>
                  <span className={styles.item_meta}>
                    <span className={styles.item_author}>{item.author}</span>
                    <span className={styles.item_date}>{item.date}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link
        href={activeTab === 'news' ? '/news/notice' : '/fellowship'}
        className={styles.more_button}
        data-reveal
        style={revealStyle(REVEAL_STEP_CONTENT + 0.6)}
      >
        더 보기
      </Link>
    </>
  );
}
