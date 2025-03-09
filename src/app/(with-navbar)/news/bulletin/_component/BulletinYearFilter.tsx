'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './BulletinYearFilter.module.scss';

const START_YEAR = 2025;
const currentYear = new Date().getFullYear();

type BulletinYearFilterProps = {
  currentYearParam: string;
};

export default function BulletinYearFilter({ currentYearParam }: BulletinYearFilterProps) {
  const router = useRouter();
  const years = Array.from({ length: currentYear - START_YEAR + 1 }, (_, idx) => START_YEAR + idx);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, year?: string) => {
    e.preventDefault();
    if (year === currentYearParam) return;

    const targetUrl = year ? `/news/bulletin?year=${year}` : '/news/bulletin';
    router.push(targetUrl, { scroll: false });
  };

  return (
    <ul className={styles.yearList}>
      <li>
        <Link href="/news/bulletin" onClick={(props) => handleClick(props)} scroll={false}>
          전체
        </Link>
      </li>
      {years.map((year) => (
        <li key={year}>
          <Link
            href={`/news/bulletin?year=${year}`}
            onClick={(props) => handleClick(props, year + '')}
            scroll={false}
            className={currentYearParam === year.toString() ? styles.active : ''}
          >
            {year}
          </Link>
        </li>
      ))}
    </ul>
  );
}
