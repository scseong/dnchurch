'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useProfile } from '@/context/SessionContextProvider';
import AuthSubmitBtn from '@/app/_component/auth/AuthSubmitBtn';
import FormAlertMessage from '@/app/_component/auth/FormAlertMessage';
import FormField from '@/app/_component/auth/FormField';
import ImageUpload from '@/app/(with-navbar)/news/bulletin/_component/create/ImageUpload';
import Loader from '@/app/_component/common/Loader';
import { createBulletinAction } from '@/actions/bulletin/bulletin.action';
import { formattedDate } from '@/shared/util/date';
import styles from './CreateBulletinForm.module.scss';

type Inputs = {
  title: string;
  date: string;
  files: File[];
};

// TODO: 취소 버튼 및 이탈 방지 기능 추가
export default function CreateBulletinForm() {
  const router = useRouter();
  const user = useProfile();
  const formRef = useRef<HTMLFormElement>(null);
  const methods = useForm<Inputs>({
    defaultValues: {
      title: '',
      date: '',
      files: []
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
  const files = watch('files');
  const selectedDate = watch('date');

  const onSubmit = async (data: Inputs) => {
    clearErrors('root');

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('date', data.date);
      formData.append('user_id', user!.id);

      data.files.forEach((file) => {
        formData.append('files', file);
      });

      const { success, message } = await createBulletinAction(formData);
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
  }, [selectedDate, setValue, clearErrors]);

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
        {errors.root && <FormAlertMessage type="error" message={errors.root.message} />}
        <div className={styles.button_group}>
          <AuthSubmitBtn
            isDisabled={!isValid || files.length === 0}
            isSubmitting={isSubmitting}
            label="작성하기"
          />
        </div>
      </form>
    </FormProvider>
  );
}
