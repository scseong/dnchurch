'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { signUp } from '@/apis/auth';
import { FormField, FormAlertMessage, FormSubmitButton } from '@/components/form';
import { generateErrorMessage } from '@/utils/error';
import { FORM_VALIDATIONS } from '@/constants/validation';
import { REDIRECT_AFTER_LOGIN_KEY } from '@/constants/auth';

type Inputs = {
  email: string;
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpForm() {
  const [signUpError, setSignUpError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid, isSubmitting }
  } = useForm<Inputs>({ mode: 'onChange' });
  const { password, confirmPassword } = watch();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';

  const onSubmit: SubmitHandler<Inputs> = async ({ email, password, name, username }) => {
    setSignUpError('');
    try {
      await signUp({ email, password, name, username });
      localStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, redirect);
    } catch (error) {
      const message = generateErrorMessage(error);
      setSignUpError(message);
    }
  };

  useEffect(() => {
    if (password !== confirmPassword && confirmPassword) {
      setError('confirmPassword', { message: '두 비밀번호가 일치하지 않습니다.' });
    } else clearErrors('confirmPassword');
  }, [password]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        id="email"
        label="이메일"
        register={register('email', FORM_VALIDATIONS.email)}
        error={errors.email?.message}
        placeholder="example@service.com"
        required
      />
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
      <FormField
        id="name"
        label="이름"
        register={register('name', FORM_VALIDATIONS.name)}
        error={errors.name?.message}
        placeholder="홍길동"
        required
      />
      <FormField
        id="username"
        label="프로필 이름 (닉네임)"
        register={register('username', FORM_VALIDATIONS.username)}
        error={errors.username?.message}
        placeholder="사용할 닉네임 10자 이내"
        required
      />
      <FormSubmitButton isDisabled={!isValid} isSubmitting={isSubmitting} label="회원가입" />
      {signUpError && <FormAlertMessage type="error" message={signUpError} />}
    </form>
  );
}
