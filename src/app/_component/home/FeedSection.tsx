'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { LayoutContainer } from '@/components/layout';
import { revealStyle, REVEAL_STEP, REVEAL_STEP_CONTENT } from '@/utils/reveal';
import styles from './FeedSection.module.scss';

type Tab = 'news' | 'sharing';

type NewsItem = {
  id: number;
  title: string;
  date: string;
  isBulletin?: boolean;
  isNew?: boolean;
};

type SharingItem = {
  id: number;
  title: string;
  author: string;
  date: string;
  isNew?: boolean;
};

// 임시 목 데이터 (추후 API 연동)
const NEWS_ITEMS: NewsItem[] = [
  { id: 1, title: '2026년 3월 셋째주 주보', date: '2026.03.22', isBulletin: true, isNew: true },
  { id: 2, title: '부활절 연합예배 안내', date: '2026.03.20', isNew: true },
  { id: 3, title: '2026년 3월 둘째주 주보', date: '2026.03.15', isBulletin: true },
  { id: 4, title: '봄맞이 교회 환경미화 봉사 안내', date: '2026.03.12' },
  { id: 5, title: '제직회의 일정 변경 공지', date: '2026.03.10' }
];

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

export default function FeedSection() {
  const [activeTab, setActiveTab] = useState<Tab>('news');

  return (
    <section className={styles.section}>
      <LayoutContainer>
        <div data-reveal style={revealStyle()} className={styles.header}>
          <span className={styles.caption}>Church Feeds</span>
          <h2>교회 소식과 은혜 나눔</h2>
          <p className={styles.subtitle}>
            교회의 최신 소식과 성도님들의 은혜로운 나눔을 확인하세요
          </p>
        </div>
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
          <div className={clsx(styles.column, activeTab !== 'news' && styles.column_hidden)}>
            <div className={styles.column_header}>
              <h3 className={styles.column_title}>
                <span className={styles.color_bar_news} />
                교회 소식
              </h3>
              <Link href="/news" className={styles.more_link}>
                더 보기 →
              </Link>
            </div>
            <div className={styles.list_card}>
              {NEWS_ITEMS.map((item, i) => (
                <div
                  key={item.id}
                  className={styles.item}
                  data-reveal
                  style={revealStyle(REVEAL_STEP_CONTENT + (i + 1) * REVEAL_STEP)}
                >
                  {item.isBulletin && <span className={styles.badge_bulletin}>주보</span>}
                  <span className={styles.item_title}>{item.title}</span>
                  {item.isNew && <span className={styles.badge_new}>N</span>}
                  <span className={styles.item_date}>{item.date}</span>
                </div>
              ))}
            </div>
          </div>

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
                  <div className={styles.item_text}>
                    <span className={styles.item_title}>{item.title}</span>
                    <span className={styles.item_author}>{item.author}</span>
                  </div>
                  {item.isNew && <span className={styles.badge_new}>N</span>}
                  <span className={styles.item_date}>{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Link
          href={activeTab === 'news' ? '/news' : '/fellowship'}
          className={styles.more_button}
          data-reveal
          style={revealStyle(REVEAL_STEP_CONTENT + 0.6)}
        >
          더 보기
        </Link>
      </LayoutContainer>
    </section>
  );
}
