'use client';

import { useActionState, useState } from 'react';
import { createBulletinAction } from '@/actions/bulletin/bulletin.action';
import { useProfile } from '@/context/SessionContextProvider';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import FilePreview from '../_component/create/FilePreview';
import FileUpload from '../_component/create/FileUpload';
import { convertFileToImageData } from '@/shared/util/file';
import type { ImageFileData } from '@/shared/types/types';
import styles from './page.module.scss';

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<ImageFileData[]>([]);
  const [actionState, formAction, isPending] = useActionState(
    createBulletinAction.bind(null, selectedFile),
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
    setSelectedFile((prev) => [...prev, ...imageData]);
  };

  const handleDeleteSelectedFile = (id: number) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      const result = selectedFile.filter((data) => data.id !== id);
      setSelectedFile(result);
    }
  };

  if (!user) return null;

  if (actionState?.error) {
    window.alert(actionState?.error);
  }

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
        <FilePreview files={selectedFile} onDelete={handleDeleteSelectedFile} />
        <input name="user_id" value={user.id} hidden readOnly />
        <button disabled={isPending}>생성</button>
      </form>
    </MainContainer>
  );
}
