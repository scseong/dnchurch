'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import AuthSubmitBtn from '@/app/_component/auth/AuthSubmitBtn';
import FormAlertMessage from '@/app/_component/auth/FormAlertMessage';
import FormField from '@/app/_component/auth/FormField';
import { updatePasswordAndSignOut } from '@/app/reset-password/actions';
import { generateErrorMessage } from '@/shared/constants/error';
import { FORM_VALIDATIONS } from '@/shared/constants/validation';

type Inputs = {
  password: string;
  confirmPassword: string;
};

export default function PasswordUpdateForm() {
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting }
  } = useForm<Inputs>({ mode: 'onChange' });
  const password = watch('password');

  const onSubmit: SubmitHandler<Inputs> = async ({ password }) => {
    setError('');

    try {
      const { error } = await updatePasswordAndSignOut(password);
      if (error) setError(error);
    } catch (error) {
      const message = generateErrorMessage(error);
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        id="password"
        label="비밀번호"
        type="password"
        register={register('password', FORM_VALIDATIONS.password)}
        error={errors.password?.message}
        placeholder="영문, 숫자 포함 8자 이상"
        required
      />
      <FormField
        id="confirm-password"
        label="비밀번호 확인"
        type="password"
        register={register('confirmPassword', {
          required: '비밀번호 확인을 입력해주세요.',
          validate: (value) => value === password || '두 비밀번호가 일치하지 않습니다.'
        })}
        error={errors.confirmPassword?.message}
        placeholder="비밀번호 재입력"
        required
      />
      <AuthSubmitBtn isDisabled={!isValid} isSubmitting={isSubmitting} label="비밀번호 변경하기" />
      {error && <FormAlertMessage type="error" message={error} />}
    </form>
  );
}
