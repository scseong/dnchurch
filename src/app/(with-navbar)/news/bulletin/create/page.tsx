'use client';

import { useActionState, useEffect, useState } from 'react';
import { createBulletinAction } from '@/actions/bulletin/bulletin.action';
import { useProfile } from '@/context/SessionContextProvider';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import FilePreview from '../_component/create/FilePreview';
import FileUpload from '../_component/create/FileUpload';
import { convertFileToImageData } from '@/shared/util/file';
import type { ImageFileData } from '@/shared/types/types';
import styles from './page.module.scss';

export default function Page() {
  const [selectedFiles, setSelectedFiles] = useState<ImageFileData[]>([]);
  const [actionState, formAction, isPending] = useActionState(
    createBulletinAction.bind(null, selectedFiles),
    null
  );
  const user = useProfile();

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) return;

    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length < files.length) {
      window.alert('이미지 파일만 첨부해주세요.');
    }

    const imagePromises = Array.from(imageFiles).map(convertFileToImageData);
    const imageData = await Promise.all(imagePromises);

    setSelectedFiles((prev) => [...prev, ...imageData]);
  };

  const handleDeleteSelectedFile = (id: number) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      const result = selectedFiles.filter((data) => data.id !== id);
      setSelectedFiles(result);
    }
  };

  useEffect(() => {
    if (actionState?.error) {
      window.alert(actionState?.error);
    }
  }, [actionState?.error]);

  if (!user) return null;

  return (
    <MainContainer title="주보 추가하기">
      <form action={formAction} className={styles.form}>
        <div className={styles.group}>
          <label htmlFor="title">제목</label>
          <input
            type="text"
            name="title"
            placeholder="제목을 입력해주세요 (2025년 1월 5일 첫째 주)"
            defaultValue={(actionState?.payload?.get('title') || '') as string}
            required
          />
        </div>
        <div className={styles.group}>
          <label htmlFor="image_url">주보 이미지 업로드</label>
          <FileUpload onChange={handleInputChange} />
        </div>
        <FilePreview files={selectedFiles} onDelete={handleDeleteSelectedFile} />
        <input name="user_id" value={user.id} hidden readOnly />
        <div className={styles.submit}>
          <button disabled={isPending}>추가하기</button>
        </div>
      </form>
    </MainContainer>
  );
}
