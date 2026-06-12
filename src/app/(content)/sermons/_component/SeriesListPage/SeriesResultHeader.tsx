import styles from './SeriesListPage.module.scss';

type Props = {
  resultCount: number;
  query?: string;
};

export default function SeriesResultHeader({ resultCount, query }: Props) {
  const trimmed = query?.trim();

  return (
    <header className={styles.result_header}>
      <p className={styles.result_count}>
        {trimmed ? (
          <>
            <strong className={styles.result_query}>
              &ldquo;{trimmed}&rdquo;
            </strong>
            <span> 검색 결과 </span>
            <strong>{resultCount}</strong>
            <span>개</span>
          </>
        ) : (
          <>
            <span>총 </span>
            <strong>{resultCount}</strong>
            <span>개 시리즈</span>
          </>
        )}
      </p>
    </header>
  );
}
