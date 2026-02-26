'use client';

import { FaRegTrashAlt } from 'react-icons/fa';
import { formattedDate } from '@/utils/date';
import { convertBytesToFileSize } from '@/utils/file';
import { ImageFile } from '@/types/common';
import styles from './FilePreviewList.module.scss';

type Props = {
  files: ImageFile[];
  onDelete: (index: number) => void;
};

export default function FilePreviewList({ files, onDelete }: Props) {
  if (files.length === 0) return null;

  return (
    <div className={styles.list}>
      {files.map((img, idx) => {
        const { name, size, lastModified } = img.file;
        const previewUrl = img.previewUrl;

        return (
          <div key={`${img.file.name}-${idx}`} className={styles.item}>
            <div className={styles.image}>
              <img
                src={previewUrl}
                alt={`${name} 미리보기`}
                onError={(e) => {
                  e.currentTarget.src = '/images/no-image.jpg';
                }}
              />
            </div>
            <div className={styles.info}>
              <h5 className={styles.name} title={name}>
                {name}
              </h5>
              <div className={styles.meta}>
                <span>{convertBytesToFileSize(size)}</span>
                <span>{formattedDate(lastModified, 'YYYY.MM.DD A h:mm')}</span>
              </div>
            </div>
            <div className={styles.actions}>
              <button type="button" onClick={() => onDelete(idx)} aria-label={`${name} 파일 삭제`}>
                <FaRegTrashAlt size="1.4rem" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
