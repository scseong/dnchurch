import { formattedDate } from '@/shared/util/date';
import { convertBytesToFileSize } from '@/shared/util/file';
import { FaRegTrashAlt } from 'react-icons/fa';
import styles from './FilePreview.module.scss';

type Image = {
  file: File;
  previewUrl: string;
};

type FilePreviewProps = {
  files: Image[];
  onDelete: (id: number) => void;
};

export default function FilePreview({ files, onDelete }: FilePreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className={styles.container}>
      {files.map((img, idx) => {
        const { name, size, lastModified } = img.file;
        const previewUrl = img.previewUrl;

        return (
          <div key={`${name}-${idx}`} className={styles.preview}>
            <div className={styles.image_wrap}>
              <img
                src={previewUrl}
                alt={`${name} 미리보기`}
                onError={(e) => {
                  e.currentTarget.src = '/images/no-image.jpg';
                }}
              />
            </div>
            <div className={styles.file_info}>
              <h5 className={styles.filename} title={name}>
                {name}
              </h5>
              <div className={styles.meta_data}>
                <span>{convertBytesToFileSize(size)}</span>
                <span>{formattedDate(lastModified, 'YYYY.MM.DD A h:mm')}</span>
              </div>
            </div>
            <div className={styles.button_wrap}>
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
