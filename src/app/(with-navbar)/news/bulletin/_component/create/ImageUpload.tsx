'use client';

import { useFormContext } from 'react-hook-form';
import styles from './FileUpload.module.scss';
import FilePreview from '@/app/(with-navbar)/news/bulletin/_component/create/FilePreview';

type Image = {
  file: File;
  previewUrl: string;
};

export default function ImageUpload() {
  const { watch, register, setValue } = useFormContext();
  const images: Image[] = watch('file') || [];

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newImageItems: Image[] = newFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setValue('file', [...images, ...newImageItems], { shouldValidate: true });
    }
    e.target.value = '';
  };

  const handleDeleteImage = (index: number) => {
    URL.revokeObjectURL(images[index].previewUrl);
    const updated = images.filter((_, i) => i !== index);
    setValue('file', updated, { shouldValidate: true });
  };

  return (
    <div className={styles.file_upload}>
      <input
        type="hidden"
        {...register('file', {
          validate: (value) => value.length > 0 || '최소 한 장의 이미지가 필요합니다.'
        })}
      />
      <label htmlFor="image_url" className={styles.upload_btn}>
        이미지 가져오기
      </label>
      <input
        type="file"
        id="image_url"
        accept="image/*"
        onChange={handleSelectImages}
        multiple
        style={{ display: 'none' }}
      />
      <FilePreview files={images} onDelete={handleDeleteImage} />
    </div>
  );
}
