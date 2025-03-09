'use client';

import { useParams } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useProfile } from '@/context/SessionContextProvider';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import FileUpload from '../../_component/create/FileUpload';
import FilePreview from '../../_component/create/FilePreview';
import { supabase } from '@/shared/supabase/client';
import { updateBulletinAction } from '@/actions/bulletin/bulletin.action';
import { convertFileToImageData, convertUrlToImageData } from '@/shared/util/file';
import { BulletinWithUserName } from '@/apis/bulletin';
import type { ImageFileData } from '@/shared/types/types';
import styles from '../../create/page.module.scss';

export default function UpdateBulletin() {
  const { id: bulletinId } = useParams<{ id: string }>();
  const user = useProfile();

  const [bulletin, setBulletin] = useState<BulletinWithUserName | null>(null);
  const [title, setTitle] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<ImageFileData[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<ImageFileData[]>([]);
  const [actionState, formAction, isPending] = useActionState(
    updateBulletinAction.bind(null, selectedFiles),
    null
  );
  const isDisabled = bulletin?.title === title && selectedFiles.length === 0;

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
    const fetchBulletin = async (id: string) => {
      const { data } = await supabase
        .from('bulletin')
        .select(`*, profiles ( user_name )`)
        .eq('id', id)
        .single();

      if (!data) {
        setUploadedFiles([]);
        setBulletin(null);
        return;
      }

      const imageFiles = data?.image_url.map(convertUrlToImageData);
      const imageData = await Promise.all(imageFiles);
      setUploadedFiles(imageData);
      setBulletin(data as unknown as BulletinWithUserName | null);
      setTitle(data.title);
    };

    fetchBulletin(bulletinId);
  }, [bulletinId]);

  useEffect(() => {
    if (actionState?.error) {
      window.alert(actionState?.error);
    }
  }, [actionState?.error]);

  if (!user) return null;

  return (
    <MainContainer title="주보 수정하기">
      <form action={formAction} className={styles.form}>
        <div className={styles.group}>
          <label htmlFor="title">제목</label>
          <input
            type="text"
            name="title"
            placeholder="제목을 입력해주세요 (2025년 1월 5일 첫째 주)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className={styles.group}>
          <label htmlFor="image_url">주보 이미지 업로드</label>
          <FileUpload onChange={handleInputChange} />
        </div>
        <div className={styles.image_preview}>
          <label>미리보기 (수정 전)</label>
          <FilePreview files={uploadedFiles} />
        </div>
        {selectedFiles.length > 0 && (
          <div className={styles.image_preview}>
            <label>미리보기 (수정 후)</label>
            <FilePreview files={selectedFiles} onDelete={handleDeleteSelectedFile} />
          </div>
        )}
        <input name="bulletin_id" value={bulletinId} hidden readOnly />
        <input name="is_disabled" type="checkbox" checked={isDisabled} hidden readOnly />
        <div className={styles.submit}>
          <button disabled={isPending} className={styles.submit_btn}>
            수정하기
          </button>
        </div>
      </form>
    </MainContainer>
  );
}
