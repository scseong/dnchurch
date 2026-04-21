import { useRef, useState } from 'react';
import { HiOutlinePaperClip, HiPlus, HiX } from 'react-icons/hi';
import type { ResourcesCardProps, SermonResourceInput } from '@/types/sermon-form';
import {
  MAX_RESOURCE_BYTES,
  formatBytes,
  inferResourceType
} from '@/lib/sermon-resource';
import styles from '../index.module.scss';

interface RejectedFile {
  name: string;
  reason: '지원 안 함' | '50MB 초과';
}

export default function ResourcesCard({ resources, onAdd, onRemove }: ResourcesCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rejected, setRejected] = useState<RejectedFile[]>([]);
  const hasFiles = resources.length > 0;

  const openPicker = () => inputRef.current?.click();

  const handleFiles = (list: FileList) => {
    const accepted: SermonResourceInput[] = [];
    const rejections: RejectedFile[] = [];

    for (const file of Array.from(list)) {
      const fileType = inferResourceType(file.name);
      if (fileType === null) {
        rejections.push({ name: file.name, reason: '지원 안 함' });
        continue;
      }
      if (file.size > MAX_RESOURCE_BYTES) {
        rejections.push({ name: file.name, reason: '50MB 초과' });
        continue;
      }
      accepted.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        fileType,
        file
      });
    }

    if (accepted.length > 0) onAdd(accepted);
    setRejected(rejections);
  };

  return (
    <section className={styles.card}>
      <header className={styles.card_header}>
        <span className={styles.card_number}>4</span>
        <div>
          <h3 className={styles.card_heading_title}>첨부 자료</h3>
          <p className={styles.card_heading_desc}>설교문·악보 등 첨부 파일을 업로드합니다</p>
        </div>
      </header>
      <div className={styles.card_body}>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {!hasFiles && (
          <button type="button" className={styles.upload} onClick={openPicker}>
            <span className={styles.upload_icon}>
              <HiOutlinePaperClip />
            </span>
            <span className={styles.upload_text}>
              <span className={styles.upload_accent}>클릭하여 업로드</span> 또는 드래그
            </span>
            <span className={styles.upload_desc}>PDF, HWP, TXT, 오디오/영상 · 최대 50MB</span>
          </button>
        )}

        {hasFiles && (
          <>
            <ul className={styles.resource_list}>
              {resources.map((resource) => (
                <li key={resource.id} className={styles.resource_item}>
                  <span className={styles.resource_icon}>
                    <HiOutlinePaperClip />
                  </span>
                  <span className={styles.resource_info}>
                    <span className={styles.resource_name}>{resource.name}</span>
                    <span className={styles.resource_meta}>
                      <span className={styles.resource_badge}>{resource.fileType}</span>
                      <span>{formatBytes(resource.size)}</span>
                    </span>
                  </span>
                  <button
                    type="button"
                    className={styles.resource_remove}
                    onClick={() => onRemove(resource.id)}
                    aria-label={`${resource.name} 제거`}
                  >
                    <HiX />
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className={styles.add_button} onClick={openPicker}>
              <HiPlus />
              파일 추가
            </button>
          </>
        )}

        {rejected.length > 0 && (
          <ul className={styles.resource_rejected} role="alert">
            {rejected.map((file) => (
              <li key={`${file.name}-${file.reason}`}>
                <strong>{file.name}</strong> — {file.reason}으로 제외됨
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
