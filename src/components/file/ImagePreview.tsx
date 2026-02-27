'use client';

import { FaRegTrashAlt } from 'react-icons/fa';
import { formattedDate } from '@/utils/date';
import { convertBytesToFileSize } from '@/utils/file';
import { getCloudinaryUrl } from '@/utils/cloudinary';
import type { ImageItem } from '@/types/bulletin';
import styles from './ImagePreview.module.scss';

type Props = {
  images: ImageItem[];
  onDelete: (id: string) => void;
};

export default function ImagePreview({ images, onDelete }: Props) {
  if (images.length === 0) return null;

  return (
    <div className={styles.container}>
      {images.map((image) => {
        const isExisting = image.type === 'existing';
        const imageSrc = isExisting ? getCloudinaryUrl(image.url) : image.previewUrl;

        const fileName = isExisting
          ? image.url.split('/').pop()?.split('?')[0] || '기존 이미지'
          : image.file.name;

        return (
          <div key={image.id} className={styles.preview}>
            <div className={styles.image_wrap}>
              <img
                src={imageSrc}
                alt={`${fileName} 미리보기`}
                onError={(e) => {
                  e.currentTarget.src = '/images/no-image.jpg';
                }}
              />
            </div>

            <div className={styles.file_info}>
              <h5 className={styles.filename} title={fileName}>
                {fileName}
              </h5>
              <div className={styles.meta_data}>
                {isExisting ? (
                  <span className={styles.badge_existing}>기존 이미지</span>
                ) : (
                  <>
                    <span>{convertBytesToFileSize(image.file.size)}</span>
                    <span>{formattedDate(image.file.lastModified, 'YYYY.MM.DD A h:mm')}</span>
                    <span className={styles.badge_new}>새 이미지</span>
                  </>
                )}
              </div>
            </div>

            <div className={styles.button_wrap}>
              <button
                type="button"
                onClick={() => onDelete(image.id)}
                aria-label={`${fileName} 파일 삭제`}
              >
                <FaRegTrashAlt size="1.4rem" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
