'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import clsx from 'clsx';
import { PiUploadSimpleBold } from 'react-icons/pi';
import FilePreview from '@/app/(with-navbar)/news/bulletin/_component/create/FilePreview';
import styles from './FileUpload.module.scss';

type Image = {
  file: File;
  previewUrl: string;
};

const MAX_FILE_COUNT = 5;
const MAX_FILE_SIZE_MB = 5;

export default function ImageUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const {
    watch,
    register,
    setValue,
    formState: { errors }
  } = useFormContext();
  const images: Image[] = watch('files') || [];

  // TODO: 파일 확장자 검증
  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newImageItems: Image[] = newFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setValue('files', [...images, ...newImageItems], { shouldValidate: true });
    }
    e.target.value = '';
  };

  const handleDeleteImage = (index: number) => {
    URL.revokeObjectURL(images[index].previewUrl);
    const updated = images.filter((_, i) => i !== index);
    setValue('files', updated, { shouldValidate: true });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      const newImageItems: Image[] = newFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setValue('files', [...images, ...newImageItems], { shouldValidate: true });
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <label className={styles.label}>주보 이미지 업로드</label>
        <p className={styles.help_text}>
          이미지를 최대 {MAX_FILE_COUNT}개까지 업로드할 수 있습니다. (개당 최대 {MAX_FILE_SIZE_MB}
          MB)
        </p>
      </div>
      <div
        className={clsx(styles.upload_area, { [styles.dragging]: isDragging })}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input type="file" id="images" accept="image/*" onChange={handleSelectImages} multiple />
        <p>첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 직접 선택해주세요.</p>
        <label htmlFor="images" className={styles.select_button}>
          <PiUploadSimpleBold /> 파일 선택
        </label>
      </div>
      <input
        type="hidden"
        {...register('files', {
          validate: (value) => value.length > 0 || '최소 한 장의 이미지를 업로드해주세요.'
        })}
      />
      {images.length > 0 && <FilePreview files={images} onDelete={handleDeleteImage} />}
      {errors.files && <p>{errors.files.message as string}</p>}
    </section>
  );
}
