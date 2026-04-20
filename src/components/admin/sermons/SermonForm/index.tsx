'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { HiOutlineEye, HiOutlineX } from 'react-icons/hi';
import BasicInfoCard from './sections/BasicInfoCard';
import VideoCard from './sections/VideoCard';
import ScriptureCard from './sections/ScriptureCard';
import ResourcesCard from './sections/ResourcesCard';
import PublishCard from './sections/PublishCard';
import PreviewCard from './Preview/PreviewCard';
import Checklist from './Preview/Checklist';
import { INITIAL_SERMON_FORM_DATA, type SermonFormData } from '@/types/sermon-form';
import styles from './index.module.scss';

export default function SermonForm() {
  const [data, setData] = useState<SermonFormData>(INITIAL_SERMON_FORM_DATA);

  return (
    <>
      <form className={styles.wrap}>
        <div className={styles.form_col}>
          <BasicInfoCard data={data} setData={setData} />
          <VideoCard data={data} setData={setData} />
          <ScriptureCard data={data} setData={setData} />
          <ResourcesCard data={data} setData={setData} />
          <PublishCard data={data} setData={setData} />
        </div>
        <aside className={styles.preview_col} aria-label="미리보기">
          <PreviewCard />
          <Checklist />
        </aside>
      </form>

      <div className={styles.mobile_bar}>
        <button type="button" className={styles.mobile_preview_button} aria-label="미리보기 열기">
          <HiOutlineEye />
        </button>
        <button type="button" className={clsx(styles.mobile_button, styles.outline)}>
          임시저장
        </button>
        <button type="button" className={clsx(styles.mobile_button, styles.primary)}>
          발행
        </button>
      </div>

      {/* 1-10: 스타일 확인용으로 open 기본. 다음 단계에서 state로 교체. */}
      <div className={clsx(styles.preview_overlay, styles.open)}>
        <div className={styles.preview_sheet}>
          <div className={styles.preview_sheet_bar} aria-hidden />
          <header className={styles.preview_sheet_header}>
            <h2 className={styles.preview_sheet_title}>미리보기</h2>
            <button type="button" className={styles.preview_sheet_close} aria-label="닫기">
              <HiOutlineX />
            </button>
          </header>
          <div className={styles.preview_sheet_body}>
            <PreviewCard />
            <Checklist />
          </div>
        </div>
      </div>
    </>
  );
}
