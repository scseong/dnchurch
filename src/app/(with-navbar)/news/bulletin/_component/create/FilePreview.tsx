import { ImageFileData } from '@/shared/types/types';
import styles from './FilePreview.module.scss';
import { formattedDate } from '@/shared/util/date';
import { convertBytesToFileSize } from '@/shared/util/file';

type Image = {
  file: File;
  previewUrl: string;
};

type FilePreviewProps = {
  files: Image[];
  onDelete: (id: number) => void;
};

export default function FilePreview({ files, onDelete }: FilePreviewProps) {
  return (
    <div className={styles.preview_container}>
      {files.map((img, idx) => {
        const { name, size, lastModified } = img.file;
        const previewUrl = img.previewUrl;

        if (!previewUrl) return null;

        return (
          <div key={`${name}-${idx}`} className={styles.file_preview}>
            <div className={styles.image_wrap}>
              <img src={previewUrl} alt={name} />
            </div>
            <div className={styles.file_info}>
              <h5 title={name}>{name}</h5>
              <p>
                <span>크기 : {convertBytesToFileSize(size)}</span>
                <span>수정한 날짜 : {formattedDate(lastModified, 'YYYY-MM-DD A h:mm')}</span>
              </p>
              <button type="button" className={styles.delete_btn} onClick={() => onDelete(idx)}>
                삭제
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
