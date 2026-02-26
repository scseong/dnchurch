'use client';

import { useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import AuthSubmitBtn from '@/app/_component/auth/AuthSubmitBtn';
import FormAlertMessage from '@/app/_component/auth/FormAlertMessage';
import FormField from '@/app/_component/auth/FormField';
import ImageUpload from '@/app/_component/common/ImageUpload';
import { createBulletinAction, updateBulletinAction } from '@/actions/bulletin.action';
import { formattedDate } from '@/utils/date';
import type { BulletinFormInputs, BulletinFormProps, ImageItem } from '@/types/bulletin';
import styles from './BulletinForm.module.scss';

export default function BulletinForm({ mode, bulletinId, initialData }: BulletinFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const initialImages: ImageItem[] =
    initialData?.imageUrls?.map((url, index) => ({
      type: 'existing' as const,
      url,
      id: `existing-${index}-${Date.now()}`
    })) || [];

  const methods = useForm<BulletinFormInputs>({
    defaultValues: {
      title: initialData?.title || '',
      date: initialData?.date.split('T')[0] || '',
      images: initialImages
    },
    mode: 'onChange'
  });

  const {
    register,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors, isValid, isSubmitting }
  } = methods;

  const images = watch('images');
  const selectedDate = watch('date');

  const onSubmit = async (data: BulletinFormInputs) => {
    clearErrors('root');

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('date', data.date);

      const existingImageUrls = data.images
        .filter((img): img is Extract<ImageItem, { type: 'existing' }> => img.type === 'existing')
        .map((img) => img.url);

      const newFiles = data.images
        .filter((img): img is Extract<ImageItem, { type: 'new' }> => img.type === 'new')
        .map((img) => img.file);

      newFiles.forEach((file) => {
        formData.append('files', file);
      });

      if (mode === 'edit' && bulletinId) {
        formData.append('bulletinId', bulletinId);
        formData.append('existingImages', JSON.stringify(existingImageUrls));
        formData.append('userId', initialData?.userId || '');

        const originalUrls = initialData?.imageUrls || [];
        const deletedImages = originalUrls.filter((url) => !existingImageUrls.includes(url));
        formData.append('deletedImages', JSON.stringify(deletedImages));
      }

      const { success, message } =
        mode === 'create'
          ? await createBulletinAction(formData)
          : await updateBulletinAction(formData);

      if (!success) {
        setError('root', { message });
        return;
      }

      methods.reset();
      formRef.current?.reset();
    } catch (error) {
      if (isRedirectError(error)) return;
      setError('root', { message: '서버 오류가 발생했습니다.' });
    }
  };

  useEffect(() => {
    if (selectedDate) {
      const title = formattedDate(selectedDate, 'YYYY년 M월 D일 주보');
      setValue('title', title);
      clearErrors('title');
    }
  }, [selectedDate, setValue, clearErrors, mode]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} ref={formRef} className={styles.form}>
        <div className={styles.group}>
          <FormField
            id="날짜"
            label="날짜"
            type="date"
            register={register('date', { required: '날짜를 선택해주세요.' })}
            error={errors.date?.message}
          />
          <FormField
            id="title"
            label="제목"
            placeholder="제목을 입력해주세요. (예시) 2025년 1월 5일 주보"
            register={register('title', { required: '제목을 입력해주세요.' })}
            error={errors.title?.message}
          />
          <input name="user_id" value={initialData?.userId} hidden readOnly />
        </div>
        <ImageUpload />
        {errors.root && <FormAlertMessage type="error" message={errors.root.message} />}
        <div className={styles.button_group}>
          <AuthSubmitBtn
            isDisabled={!isValid || images.length === 0}
            isSubmitting={isSubmitting}
            label={mode === 'create' ? '작성하기' : '수정하기'}
          />
        </div>
      </form>
    </FormProvider>
  );
}
