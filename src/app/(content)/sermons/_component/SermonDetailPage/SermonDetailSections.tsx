'use client';

import { useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { IoDownloadOutline } from 'react-icons/io5';
import ScriptureBlock from '../ScriptureBlock/ScriptureBlock';
import { convertBytesToFileSize } from '@/utils/file';
import type { SermonWithRelations, SermonResource } from '@/types/sermon';
import styles from './SermonDetailPage.module.scss';

// 목업 상세 3탭 — 말씀 구절 먼저.
const SECTIONS = [
  { id: 'scripture', label: '말씀 구절' },
  { id: 'summary', label: '설교 요약' },
  { id: 'resources', label: '설교 자료' }
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

type Props = {
  sermon: SermonWithRelations;
};

function SectionHeader({ children }: { children: ReactNode }) {
  return <h3 className={styles.section_header}>{children}</h3>;
}

function ResourceCardList({ resources }: { resources: SermonResource[] }) {
  return (
    <ul className={styles.resource_list}>
      {resources.map((res) => (
        <li key={res.id}>
          <a
            href={res.file_url}
            className={styles.resource_card}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.resource_badge}>
              {res.file_type ? res.file_type.toUpperCase() : '파일'}
            </span>
            <span className={styles.resource_info}>
              <span className={styles.resource_title}>{res.title}</span>
              {res.file_size_bytes != null && (
                <span className={styles.resource_size}>
                  {convertBytesToFileSize(res.file_size_bytes)}
                </span>
              )}
            </span>
            <IoDownloadOutline className={styles.resource_download} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function SermonDetailSections({ sermon }: Props) {
  const [activeSection, setActiveSection] = useState<SectionId>('scripture');
  const activeResources = sermon.sermon_resources.filter((r) => !r.deleted_at);

  const panelClassName = (id: SectionId) =>
    clsx(styles.panel, activeSection === id && styles.panel_active);

  return (
    <div className={styles.sections}>
      <div className={styles.tab_bar} role="group" aria-label="설교 상세 내용">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={clsx(
              styles.tab,
              activeSection === section.id && styles.tab_active
            )}
            onClick={() => setActiveSection(section.id)}
            aria-controls={`sermon-section-${section.id}`}
            aria-expanded={activeSection === section.id}
          >
            {section.label}
          </button>
        ))}
      </div>

      <section
        id="sermon-section-scripture"
        className={panelClassName('scripture')}
      >
        <SectionHeader>말씀 구절</SectionHeader>
        {sermon.scripture ? (
          <ScriptureBlock
            scriptureRef={sermon.scripture}
            scriptureText={sermon.scripture_text}
          />
        ) : (
          <div className={styles.content_card}>
            <p className={styles.empty}>말씀 구절이 등록되지 않았습니다</p>
          </div>
        )}
      </section>

      <section
        id="sermon-section-summary"
        className={panelClassName('summary')}
      >
        <SectionHeader>설교 요약</SectionHeader>
        <div className={styles.content_card}>
          {sermon.summary ? (
            <p className={styles.summary_text}>{sermon.summary}</p>
          ) : (
            <p className={styles.empty}>설교 요약이 등록되지 않았습니다</p>
          )}
        </div>
      </section>

      <section
        id="sermon-section-resources"
        className={panelClassName('resources')}
      >
        <SectionHeader>설교 자료</SectionHeader>
        {activeResources.length > 0 ? (
          <ResourceCardList resources={activeResources} />
        ) : (
          <div className={styles.content_card}>
            <p className={styles.empty}>등록된 자료가 없습니다</p>
          </div>
        )}
      </section>
    </div>
  );
}
