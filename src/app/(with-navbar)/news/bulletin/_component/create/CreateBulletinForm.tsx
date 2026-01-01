'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useProfile } from '@/context/SessionContextProvider';
import AuthSubmitBtn from '@/app/_component/auth/AuthSubmitBtn';
import FormField from '@/app/_component/auth/FormField';
import Loader from '@/app/_component/common/Loader';
import ImageUpload from '@/app/(with-navbar)/news/bulletin/_component/create/ImageUpload';
import { createBulletinAction } from '@/actions/bulletin/bulletin.action';
import { formattedDate } from '@/shared/util/date';
import { ImageFile } from '@/shared/types/types';
import styles from './CreateBulletinForm.module.scss';

type Inputs = {
  title: string;
  date: string;
  files: File[];
};

export default function CreateBulletinForm() {
  const user = useProfile();
  const formRef = useRef<HTMLFormElement>(null);
  const methods = useForm<Inputs>({
    defaultValues: {
      // TODO: reset
      title: '',
      date: '2025-12-18',
      files: []
    },
    mode: 'onChange'
  });
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    clearErrors,
    formState: { errors, isValid, isSubmitting }
  } = methods;

  const selectedDate = watch('date');
  const title = watch('title');

  const onSubmit = async (data: Inputs) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('date', data.date);
      formData.append('user_id', user!.id);

      data.files.forEach((file) => {
        formData.append('files', file);
      });

      await createBulletinAction(formData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      console.log('selectedDate', selectedDate);
      const title = formattedDate(selectedDate, 'YYYY년 M월 D일 주보');
      setValue('title', title);
      clearErrors('title');
    }
  }, [selectedDate, setValue]);

  if (!user) return <Loader />;

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
        </div>
        <ImageUpload />
        <input name="user_id" value={user!.id} hidden readOnly />
        <div className={styles.button_group}>
          <AuthSubmitBtn isDisabled={!isValid} isSubmitting={isSubmitting} label="작성하기" />
        </div>
      </form>
    </FormProvider>
  );
}
