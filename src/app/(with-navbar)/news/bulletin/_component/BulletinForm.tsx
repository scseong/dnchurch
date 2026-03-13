'use client';

import { useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { FormField, FormAlertMessage, FormSubmitButton } from '@/components/form';
import ImageUpload from '@/components/file/ImageUpload';
import { createBulletinAction } from '@/actions/create-bulletin.action';
import { updateBulletinAction } from '@/actions/update-bulletin.action';
import { formattedDate } from '@/utils/date';
import type {
  BulletinFormInputs,
  BulletinFormProps,
  ExistingImageItem,
  ImageItem,
  NewFileItem
} from '@/types/bulletin';
import styles from './BulletinForm.module.scss';

export default function BulletinForm({ mode, bulletinId, initialData }: BulletinFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const initialImages: ImageItem[] = initialData?.images || [];

  const methods = useForm<BulletinFormInputs>({
    defaultValues: {
      title: initialData?.title || '',
      sundayDate: initialData?.sundayDate || '',
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
  const selectedDate = watch('sundayDate');

  const onSubmit = async (data: BulletinFormInputs) => {
    clearErrors('root');

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('date', data.sundayDate);

      const existingImages = data.images.filter(
        (img): img is ExistingImageItem => img.type === 'existing'
      );

      const newFiles = data.images
        .filter((img): img is NewFileItem => img.type === 'new')
        .map((img) => img.file);

      newFiles.forEach((file) => {
        formData.append('files', file);
      });

      if (mode === 'edit' && bulletinId) {
        formData.append('bulletinId', bulletinId);
        formData.append('authorId', initialData?.authorId || '');
        formData.append('existingImages', JSON.stringify(existingImages));

        const retainedIds = new Set(existingImages.map((img) => img.imageId));
        const deletedImages = (initialData?.images || []).filter(
          (img) => !retainedIds.has(img.imageId)
        );
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
            register={register('sundayDate', { required: '날짜를 선택해주세요.' })}
            error={errors.sundayDate?.message}
          />
          <FormField
            id="title"
            label="제목"
            placeholder="제목을 입력해주세요. (예시) 2025년 1월 5일 주보"
            register={register('title', { required: '제목을 입력해주세요.' })}
            error={errors.title?.message}
          />
        </div>
        <ImageUpload />
        {errors.root && <FormAlertMessage type="error" message={errors.root.message} />}
        <div className={styles.button_group}>
          <FormSubmitButton
            isDisabled={!isValid || images.length === 0}
            isSubmitting={isSubmitting}
            label={mode === 'create' ? '작성하기' : '수정하기'}
          />
        </div>
      </form>
    </FormProvider>
  );
}
