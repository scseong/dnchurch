import clsx from 'clsx';
import { HiOutlineEye, HiOutlineX } from 'react-icons/hi';
import BasicInfoCard from './sections/BasicInfoCard';
import VideoCard from './sections/VideoCard';
import ScriptureCard from './sections/ScriptureCard';
import ResourcesCard from './sections/ResourcesCard';
import PublishCard from './sections/PublishCard';
import PreviewCard from './Preview/PreviewCard';
import Checklist from './Preview/Checklist';
import styles from './index.module.scss';

export default function SermonForm() {
  return (
    <>
      <form className={styles.wrap}>
        <div className={styles.form_col}>
          <BasicInfoCard />
          <VideoCard />
          <ScriptureCard />
          <ResourcesCard />
          <PublishCard />
        </div>
        <aside className={styles.pv_col} aria-label="미리보기">
          <PreviewCard />
          <Checklist />
        </aside>
      </form>

      <div className={styles.mb_bar}>
        <button type="button" className={styles.mb_pv_btn} aria-label="미리보기 열기">
          <HiOutlineEye />
        </button>
        <button type="button" className={clsx(styles.mb_btn, styles.outline)}>
          임시저장
        </button>
        <button type="button" className={clsx(styles.mb_btn, styles.pri)}>
          발행
        </button>
      </div>

      {/* 1-10: 스타일 확인용으로 open 기본. 다음 단계에서 state로 교체. */}
      <div className={clsx(styles.pv_ov, styles.open)}>
        <div className={styles.pv_sh}>
          <div className={styles.pv_sh_bar} aria-hidden />
          <header className={styles.pv_sh_h}>
            <h2 className={styles.pv_sh_title}>미리보기</h2>
            <button type="button" className={styles.pv_sh_close} aria-label="닫기">
              <HiOutlineX />
            </button>
          </header>
          <div className={styles.pv_sh_b}>
            <PreviewCard />
            <Checklist />
          </div>
        </div>
      </div>
    </>
  );
}
