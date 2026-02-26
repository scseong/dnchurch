'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import FormAlertMessage from '@/app/_component/auth/FormAlertMessage';
import FileSelector from '@/app/_component/file/FileSelector';
import ImagePreview from '@/app/_component/common/ImagePreview';
import { FILE_UPLOAD_MAX_COUNT, FILE_UPLOAD_MAX_SIZE_MB } from '@/constants/file';
import type { BulletinFormInputs, ImageItem, NewFileItem } from '@/types/bulletin';
import styles from './ImageUpload.module.scss';

export default function ImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors }
  } = useFormContext<BulletinFormInputs>();

  const images: ImageItem[] = watch('images') || [];

  const handleFilesSelected = (selectedFiles: FileList) => {
    if (images.length + selectedFiles.length > FILE_UPLOAD_MAX_COUNT) {
      setError('images', {
        message: `최대 ${FILE_UPLOAD_MAX_COUNT}개의 이미지만 업로드 가능합니다.`
      });
      return;
    }

    const validFiles: File[] = [];
    for (const file of Array.from(selectedFiles)) {
      if (!file.type.startsWith('image/')) {
        setError('images', {
          message: `${file.name} 파일은 지원되지 않는 형식입니다.`
        });
        return;
      }

      if (file.size > FILE_UPLOAD_MAX_SIZE_MB * 1024 * 1024) {
        setError('images', {
          message: `${file.name} 파일이 ${FILE_UPLOAD_MAX_SIZE_MB}MB를 초과합니다.`
        });
        return;
      }

      validFiles.push(file);
    }

    const newItems: NewFileItem[] = validFiles.map((file) => ({
      type: 'new' as const,
      file,
      previewUrl: URL.createObjectURL(file),
      id: `new-${Date.now()}-${Math.random()}`
    }));

    setValue('images', [...images, ...newItems], { shouldValidate: true });
    clearErrors('images');

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDelete = (id: string) => {
    const imageToDelete = images.find((img) => img.id === id);

    if (imageToDelete?.type === 'new') {
      URL.revokeObjectURL(imageToDelete.previewUrl);
    }

    const updated = images.filter((img) => img.id !== id);
    setValue('images', updated, { shouldValidate: true });
  };

  const handleClearAll = () => {
    if (images.length === 0) return;
    if (confirm('모든 이미지를 삭제하시겠습니까?')) {
      images.forEach((img) => {
        if (img.type === 'new') {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
      setValue('images', [], { shouldValidate: true });
    }
  };

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.type === 'new') {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, []);

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.label}>이미지 업로드</h3>
        <ul className={styles.help_text}>
          <li>이미지 파일만 등록할 수 있습니다.</li>
          <li>
            파일 1개당 크기는 {FILE_UPLOAD_MAX_SIZE_MB}MB를 초과할 수 없으며, 최대{' '}
            {FILE_UPLOAD_MAX_COUNT}개까지 등록할 수 있습니다.
          </li>
        </ul>
      </div>

      <FileSelector
        onFilesSelected={handleFilesSelected}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
      />

      {images.length > 0 && (
        <div className={styles.status_bar}>
          <div className={styles.count_info}>
            <strong>{images.length}개</strong> / {FILE_UPLOAD_MAX_COUNT}개
          </div>
          <button type="button" className={styles.clear_button} onClick={handleClearAll}>
            전체 삭제
          </button>
        </div>
      )}

      {images.length > 0 && <ImagePreview images={images} onDelete={handleDelete} />}
      {errors.images && <FormAlertMessage message={errors.images.message as string} type="error" />}
    </section>
  );
}
