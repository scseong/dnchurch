import clsx from 'clsx';
import { HiOutlineEye, HiOutlinePhotograph } from 'react-icons/hi';
import parent from '../index.module.scss';
import styles from './preview.module.scss';

export default function PreviewCard() {
  return (
    <section className={parent.card}>
      <header className={styles.pv_head}>
        <HiOutlineEye />
        <span>실시간 미리보기</span>
      </header>
      <div className={styles.pv_body}>
        <div className={styles.pv_thumb}>
          <div className={styles.pv_thumb_empty}>
            <HiOutlinePhotograph />
            <span>썸네일 없음</span>
          </div>
          <span className={styles.pv_thumb_tag}>단독 설교</span>
        </div>
        <p className={styles.pv_meta}>2026년 3월 29일 (일) · 김은혜 목사</p>
        <h4 className={clsx(styles.pv_title, styles.pv_title_empty)}>
          설교 제목을 입력하세요
        </h4>
        <div className={styles.pv_summary_block}>
          <p className={styles.pv_summary}>설교 요약이 여기에 표시됩니다</p>
        </div>
      </div>
    </section>
  );
}
