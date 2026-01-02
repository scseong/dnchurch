'use client';

import { useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import useFilePreview from '@/hooks/useFilePreview';
import FormAlertMessage from '@/app/_component/auth/FormAlertMessage';
import FileSelector from '@/app/_component/file/FileSelector';
import FilePreviewList from '@/app/_component/file/FilePreviewList';
import { FILE_UPLOAD_MAX_COUNT, FILE_UPLOAD_MAX_SIZE_MB } from '@/shared/constants/file';
import { validateFiles } from '@/shared/util/fileValidator';
import styles from './ImageUpload.module.scss';

export default function ImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const {
    register,
    setValue,
    setError,
    clearErrors,
    getValues,
    formState: { errors }
  } = useFormContext();
  const files: File[] = getValues('files') || [];
  const images = useFilePreview(files);

  const handleFilesSelected = (selectedFiles: FileList) => {
    const { validFiles, errorMessage } = validateFiles(files, selectedFiles, 'image/*');

    if (errorMessage) {
      setError('files', { message: errorMessage });
      return;
    }

    if (validFiles.length > 0) {
      setValue('files', [...files, ...validFiles], { shouldValidate: true });
      clearErrors('files');
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDelete = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setValue('files', updated, { shouldValidate: true });
  };

  const handleClearAll = () => {
    if (files.length === 0) return;
    if (confirm('선택한 모든 이미지를 삭제하시겠습니까?')) {
      setValue('files', [], { shouldValidate: true });
    }
  };

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
            <strong>{images.length}개</strong> / {FILE_UPLOAD_MAX_SIZE_MB}개
          </div>
          <button type="button" className={styles.clear_button} onClick={handleClearAll}>
            전체 삭제
          </button>
        </div>
      )}
      <input
        type="hidden"
        {...register('files', {
          validate: (value) => (value.length > 0 ? true : '최소 한 장의 이미지를 업로드해주세요.')
        })}
      />
      {images.length > 0 && <FilePreviewList files={images} onDelete={handleDelete} />}
      {errors.files && <FormAlertMessage message={errors.files.message as string} type="error" />}
    </section>
  );
}
