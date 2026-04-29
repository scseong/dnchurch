import clsx from 'clsx';
import { HiOutlineInbox, HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi';
import styles from '../table.module.scss';

interface Props {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateNew: () => void;
}

export default function SermonEmptyState({ hasActiveFilters, onClearFilters, onCreateNew }: Props) {
  if (hasActiveFilters) {
    return (
      <div className={styles.empty}>
        <span className={styles.empty_icon}>
          <HiOutlineSearch aria-hidden />
        </span>
        <p className={styles.empty_title}>결과가 없습니다</p>
        <p className={styles.empty_desc}>검색어나 필터 조건을 바꿔보세요</p>
        <button type="button" className={styles.empty_action} onClick={onClearFilters}>
          필터 초기화
        </button>
      </div>
    );
  }

  return (
    <div className={styles.empty}>
      <span className={styles.empty_icon}>
        <HiOutlineInbox aria-hidden />
      </span>
      <p className={styles.empty_title}>아직 등록된 설교가 없습니다</p>
      <p className={styles.empty_desc}>첫 설교를 등록해보세요</p>
      <button
        type="button"
        className={clsx(styles.empty_action, styles.primary)}
        onClick={onCreateNew}
      >
        <HiOutlinePlus aria-hidden />
        첫 설교 등록하기
      </button>
    </div>
  );
}
