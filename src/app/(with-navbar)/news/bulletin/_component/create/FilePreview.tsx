import { ImageFile } from '../../create/page';
import styles from './FilePreview.module.scss';

type FilePreviewProps = {
  files: ImageFile[];
  onDelete: (id: number) => void;
};

export default function FilePreview({ files, onDelete }: FilePreviewProps) {
  return (
    <div>
      {files.map((file, idx) => {
        const { id, filename, fileimage, filesize, datetime } = file;

        if (!fileimage) return null;

        return (
          <div key={`${id}-${idx}`} className={styles.file_preview}>
            <div className={styles.image_wrap}>
              <img src={fileimage as string} alt={filename} />
            </div>
            <div className={styles.file_info}>
              <h5>{filename}</h5>
              <p>
                <span>크기 : {filesize}</span>
                <span>수정한 날짜 : {datetime}</span>
              </p>
              <button type="button" onClick={() => onDelete(id)}>
                삭제
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
