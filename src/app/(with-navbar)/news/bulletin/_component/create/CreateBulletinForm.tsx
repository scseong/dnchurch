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
import styles from './CreateBulletinForm.module.scss';

type Inputs = {
  title: string;
  date: string;
  files: Image[];
};

type Image = {
  files: File;
  previewUrl: string;
};

export default function CreateBulletinForm() {
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
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting }
  } = methods;

  const [state, formAction, isPending] = useActionState(createBulletinAction, null);
  const selectedDate = watch('date');

  const onSubmit = () => {
    formRef.current?.requestSubmit();
  };

  useEffect(() => {
    if (selectedDate) {
      const title = formattedDate(selectedDate, 'YYYY년 M월 D일 주보');
      setValue('title', title);
    }
  }, [selectedDate, setValue]);

  if (!user) return <Loader />;

  return (
    <FormProvider {...methods}>
      <form
        action={formAction}
        onSubmit={handleSubmit(onSubmit)}
        ref={formRef}
        className={styles.form}
      >
        <div className={styles.group}>
          <FormField
            id="날짜"
            label="날짜"
            type="date"
            register={register('date', { required: '날짜를 선택해주세요.' })}
            error={errors.title?.message}
          />
          <FormField
            id="title"
            label="제목"
            placeholder="제목을 입력해주세요. (예시) 2025년 1월 5일 주보"
            register={register('title', { required: '제목을 입력해주세요.' })}
            error={errors.title?.message}
          />
        </div>
        {/* <div className={styles.group}> */}
        {/* <label htmlFor="image_url">주보 이미지 업로드</label> */}
        <ImageUpload />
        {/* </div> */}
        <input name="user_id" value={user!.id} hidden readOnly />
        <div className={styles.button_group}>
          {/* TODO: 공통 컴포넌트화 */}
          <AuthSubmitBtn isDisabled={!isValid} isSubmitting={isSubmitting} label="작성하기" />
        </div>
      </form>
    </FormProvider>
  );
}
