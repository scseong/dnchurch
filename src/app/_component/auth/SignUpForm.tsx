'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { signUpAction } from '@/actions/auth.action';
import { FormAlertMessage } from '@/components/form';
import { Button, TextField } from '@/components/ui';
import { generateErrorMessage } from '@/utils/error';
import { FORM_VALIDATIONS } from '@/constants/validation';
import { REDIRECT_AFTER_LOGIN_KEY } from '@/constants/auth';
import styles from './authForm.module.scss';

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
  const redirectParam = searchParams.get('redirect') ?? '/';
  // open redirect 방지 — 사이트 내 상대 경로만 허용 ('//'는 프로토콜 상대 URL이라 차단)
  const redirect =
    redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : '/';

  const onSubmit: SubmitHandler<Inputs> = async ({ email, password, name, username }) => {
    setSignUpError('');
    try {
      const result = await signUpAction({ email, password, name, username });

      if (!result.success) {
        setSignUpError(result.message);
        return;
      }

      if (result.data?.hasSession) {
        // 세션 쿠키는 서버에서 만들어져 브라우저 클라이언트에 SIGNED_IN 이벤트가 없다.
        // 전체 페이지 이동으로 SessionContextProvider를 재마운트해 INITIAL_SESSION이 새 세션을 읽게 한다.
        window.location.assign(redirect);
        return;
      }

      // 이메일 확인이 필요한 가입 — 확인 후 로그인 시점에 SIGNED_IN이 redirect를 처리한다
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
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <TextField
        id="email"
        label="이메일"
        required
        placeholder="example@service.com"
        error={errors.email?.message}
        {...register('email', FORM_VALIDATIONS.email)}
      />
      <TextField
        id="password"
        label="비밀번호"
        type="password"
        required
        placeholder="영문, 숫자 포함 8자 이상"
        error={errors.password?.message}
        {...register('password', FORM_VALIDATIONS.password)}
      />
      <TextField
        id="confirm-password"
        label="비밀번호 확인"
        type="password"
        required
        placeholder="비밀번호 재입력"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword', {
          required: '비밀번호 확인을 입력해주세요.',
          validate: (value) => value === password || '두 비밀번호가 일치하지 않습니다.'
        })}
      />
      <TextField
        id="name"
        label="이름"
        required
        placeholder="홍길동"
        error={errors.name?.message}
        {...register('name', FORM_VALIDATIONS.name)}
      />
      <TextField
        id="username"
        label="프로필 이름 (닉네임)"
        required
        placeholder="사용할 닉네임 10자 이내"
        error={errors.username?.message}
        {...register('username', FORM_VALIDATIONS.username)}
      />
      <Button type="submit" fullWidth size="lg" loading={isSubmitting} disabled={!isValid}>
        회원가입
      </Button>
      {signUpError && <FormAlertMessage type="error" message={signUpError} />}
    </form>
  );
}
