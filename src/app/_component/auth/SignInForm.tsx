'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormAlertMessage } from '@/components/form';
import { Button, TextField } from '@/components/ui';
// eslint-disable-next-line no-restricted-imports -- 점진 마이그레이션 대상 (tech-debt-tracker.md)
import { signInWithPassword } from '@/apis/auth';
import { FORM_VALIDATIONS } from '@/constants/validation';
import { generateErrorMessage } from '@/utils/error';
import { REDIRECT_AFTER_LOGIN_KEY } from '@/constants/auth';
import styles from './authForm.module.scss';

type Inputs = {
  email: string;
  password: string;
};

export default function SignInForm() {
  const [logInError, setLogInError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <TextField
        id="email"
        label="이메일"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email', FORM_VALIDATIONS.email)}
      />
      <TextField
        id="password"
        label="비밀번호"
        type={showPassword ? 'text' : 'password'}
        placeholder="비밀번호 입력"
        error={errors.password?.message}
        trailingSlot={
          <button
            type="button"
            className={styles.password_toggle}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
            aria-pressed={showPassword}
          >
            {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
          </button>
        }
        {...register('password', FORM_VALIDATIONS.password)}
      />
      <Button
        type="submit"
        variant="accent"
        fullWidth
        size="md"
        className={styles.cta}
        loading={isSubmitting}
        disabled={!isValid}
      >
        로그인
      </Button>
      {logInError && <FormAlertMessage type="error" message={logInError} />}
    </form>
  );
}
