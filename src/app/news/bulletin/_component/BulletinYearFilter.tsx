'use client';

import Link from 'next/link';
import styles from './BulletinYearFilter.module.scss';
import { useSearchParams } from 'next/navigation';

export default function BulletinYearFilter() {
  const searchParams = useSearchParams();

  const STARTYEAR = 2024;
  const currentYear = new Date().getFullYear();
  const yearList = [];

  for (let year = currentYear; year >= STARTYEAR; year--) {
    yearList.push(year);
  }

  return (
    <ul className={styles.filter}>
      <li>
        <Link href="/news/bulletin" scroll={false}>
          전체
        </Link>
      </li>
      {yearList.map((year) => (
        <li key={year}>
          <Link href={`/news/bulletin?year=${year}`} scroll={false}>
            {year}
          </Link>
        </li>
      ))}
    </ul>
  );
}
