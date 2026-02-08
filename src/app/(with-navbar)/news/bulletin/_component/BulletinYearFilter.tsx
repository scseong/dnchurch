import Link from 'next/link';
import styles from './BulletinYearFilter.module.scss';

type Props = {
  selectedYear?: number;
  years: number[];
};

export default function BulletinYearFilter({ selectedYear, years }: Props) {
  return (
    <ul className={styles.yearList}>
      <li>
        <Link href="/news/bulletin" scroll={false}>
          전체
        </Link>
      </li>
      {years?.map((year) => (
        <li key={year}>
          <Link
            href={`/news/bulletin?year=${year}`}
            scroll={false}
            className={selectedYear === year ? styles.active : ''}
          >
            {year}
          </Link>
        </li>
      ))}
    </ul>
  );
}
