'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormField, FormAlertMessage, FormSubmitButton } from '@/components/form';
import { signInWithPassword } from '@/apis/auth';
import { FORM_VALIDATIONS } from '@/constants/validation';
import { generateErrorMessage } from '@/utils/error';
import { REDIRECT_AFTER_LOGIN_KEY } from '@/constants/auth';

type Inputs = {
  email: string;
  password: string;
};

export default function SignInForm() {
  const [logInError, setLogInError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting }
  } = useForm<Inputs>({ mode: 'onChange' });
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';

  const onSubmit: SubmitHandler<Inputs> = async ({ email, password }) => {
    try {
      setLogInError('');
      localStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, redirect);
      await signInWithPassword({ email, password });
    } catch (error) {
      const message = generateErrorMessage(error);
      setLogInError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        id="email"
        label="이메일"
        placeholder="이메일 입력"
        register={register('email', FORM_VALIDATIONS.email)}
        error={errors.email?.message}
        blindLabel
      />
      <FormField
        id="password"
        label="비밀번호"
        type="password"
        placeholder="비밀번호 입력 (영문 숫자 포함 8자 이상)"
        register={register('password', FORM_VALIDATIONS.password)}
        error={errors.password?.message}
        blindLabel={true}
      />
      <FormSubmitButton isDisabled={!isValid} isSubmitting={isSubmitting} label="이메일로 로그인" />
      {logInError && <FormAlertMessage type="error" message={logInError} />}
    </form>
  );
}
