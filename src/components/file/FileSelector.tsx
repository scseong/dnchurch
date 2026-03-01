'use client';

import clsx from 'clsx';
import { PiUploadSimpleBold } from 'react-icons/pi';
import styles from './FileSelector.module.scss';

type Props = {
  isDragging: boolean;
  onFilesSelected: (files: FileList) => void;
  setIsDragging: (state: boolean) => void;
};

export default function FileSelector({ isDragging, onFilesSelected, setIsDragging }: Props) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div
      className={clsx(styles.upload_area, { [styles.dragging]: isDragging })}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input type="file" id="images" accept="image/*" multiple onChange={handleChangeFile} />
      <p>첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 클릭해주세요.</p>
      <label htmlFor="images" className={styles.select_button}>
        <PiUploadSimpleBold /> 파일 선택
      </label>
    </div>
  );
}
