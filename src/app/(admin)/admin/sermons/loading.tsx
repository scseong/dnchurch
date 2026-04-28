import PageHeader from '@/components/admin/layout/PageHeader';
import styles from './loading.module.scss';

const SKELETON_ROWS = Array.from({ length: 8 });
const SKELETON_TABS = Array.from({ length: 3 });
const SKELETON_TOOLBAR = Array.from({ length: 3 });

const HEAD_CELLS = Array.from({ length: 7 });

export default function SermonAdminListLoading() {
  return (
    <>
      <PageHeader
        eyebrow="설교"
        title="설교 관리"
        description="등록된 설교를 검색하고 발행 상태를 관리합니다"
      />
      <div className={styles.wrapper}>
        <div className={styles.tabs_row}>
          {SKELETON_TABS.map((_, index) => (
            <span key={index} className={styles.tab_pill} />
          ))}
        </div>

        <div className={styles.toolbar_row}>
          <span className={styles.toolbar_search} />
          {SKELETON_TOOLBAR.map((_, index) => (
            <span key={index} className={styles.toolbar_chip} />
          ))}
        </div>

        <div className={styles.table_card}>
          <div className={styles.table_head}>
            {HEAD_CELLS.map((_, index) => (
              <span key={index} className={styles.head_cell} />
            ))}
          </div>
          {SKELETON_ROWS.map((_, index) => (
            <div key={index} className={styles.table_row}>
              <span className={styles.thumb} />
              <div className={styles.title_block}>
                <span className={styles.title_line} />
                <span className={styles.scripture_line} />
              </div>
              <span className={styles.pill_short} />
              <span className={styles.text_short} />
              <span className={styles.text_mid} />
              <span className={styles.pill_mid} />
              <span className={styles.text_short} />
              <span className={styles.action_dots} />
            </div>
          ))}
        </div>

        <div className={styles.mobile_list}>
          {SKELETON_ROWS.slice(0, 5).map((_, index) => (
            <div key={index} className={styles.mobile_card}>
              <div className={styles.mobile_top}>
                <span className={styles.mobile_thumb} />
                <div className={styles.mobile_meta}>
                  <span className={styles.mobile_title} />
                  <span className={styles.mobile_sub} />
                  <div className={styles.mobile_tags}>
                    <span className={styles.pill_short} />
                    <span className={styles.pill_mid} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
