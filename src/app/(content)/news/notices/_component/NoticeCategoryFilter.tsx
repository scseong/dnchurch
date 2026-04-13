import Link from 'next/link';
import clsx from 'clsx';
import { NOTICE_CATEGORIES } from '@/constants/notice';
import type { NoticeCategory } from '@/types/notice';
import styles from './NoticeCategoryFilter.module.scss';

type Props = {
  selectedCategory?: NoticeCategory;
  categoryCounts: Record<string, number>;
  totalCount: number;
};

export default function NoticeCategoryFilter({
  selectedCategory,
  categoryCounts,
  totalCount
}: Props) {
  const allCount = Object.values(categoryCounts).reduce((sum, v) => sum + v, 0) || totalCount;

  return (
    <nav className={styles.filter} aria-label="카테고리 필터">
      <ul className={styles.chip_list}>
        <li>
          <Link
            href="/news/notices"
            scroll={false}
            className={clsx(styles.chip, !selectedCategory && styles.selected)}
          >
            전체
            <span className={styles.count}>{allCount}</span>
          </Link>
        </li>
        {Object.entries(NOTICE_CATEGORIES).map(([key, label]) => {
          const count = categoryCounts[key] ?? 0;
          return (
            <li key={key}>
              <Link
                href={`/news/notices?category=${key}`}
                scroll={false}
                className={clsx(styles.chip, selectedCategory === key && styles.selected)}
              >
                {label}
                <span className={styles.count}>{count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
