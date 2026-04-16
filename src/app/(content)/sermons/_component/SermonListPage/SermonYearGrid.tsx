import Link from 'next/link';
import type { YearCount } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  yearCounts: YearCount[];
};

export default function SermonYearGrid({ yearCounts }: Props) {
  if (yearCounts.length === 0) return null;

  return (
    <section className={styles.past_section} aria-labelledby="past-years-heading">
      <h2 id="past-years-heading" className={styles.past_heading}>
        지난 말씀 아카이브
      </h2>
      <ul role="list" className={styles.year_grid}>
        {yearCounts.map(({ year, count }) => (
          <li key={year}>
            <Link
              href={`/sermons?year=${year}`}
              className={styles.year_card}
              aria-label={`${year}년 설교 ${count}편 보기`}
            >
              <span className={styles.year_card_year}>{year}</span>
              <span className={styles.year_card_count}>{count}편</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
