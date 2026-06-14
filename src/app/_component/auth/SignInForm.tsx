'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormAlertMessage } from '@/components/form';
import { Button, TextField } from '@/components/ui';
// eslint-disable-next-line no-restricted-imports -- 점진 마이그레이션 대상 (tech-debt-tracker.md)
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
      <TextField
        id="email"
        label="이메일"
        hideLabel
        placeholder="이메일 입력"
        error={errors.email?.message}
        {...register('email', FORM_VALIDATIONS.email)}
      />
      <TextField
        id="password"
        label="비밀번호"
        hideLabel
        type="password"
        placeholder="비밀번호 입력 (영문 숫자 포함 8자 이상)"
        error={errors.password?.message}
        {...register('password', FORM_VALIDATIONS.password)}
      />
      <Button type="submit" fullWidth size="lg" loading={isSubmitting} disabled={!isValid}>
        이메일로 로그인
      </Button>
      {logInError && <FormAlertMessage type="error" message={logInError} />}
    </form>
  );
}
