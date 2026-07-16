'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { signUpAction } from '@/actions/auth.action';
import { FormAlertMessage } from '@/components/form';
import { Button, TextField } from '@/components/ui';
import { generateErrorMessage } from '@/utils/error';
import { FORM_VALIDATIONS } from '@/constants/validation';
import authStyles from '@/app/_component/auth/authForm.module.scss';
import styles from './signUpWizard.module.scss';

type Inputs = {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function InfoStep({
  onComplete,
  redirect
}: {
  onComplete: (data: { name: string; email: string }) => void;
  redirect: string;
}) {
  const [signUpError, setSignUpError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting }
  } = useForm<Inputs>({ mode: 'onChange' });
  const { password, confirmPassword } = watch();

  // 휴대폰은 인증 없이 선택 연락처로만 저장한다
  const [phone, setPhone] = useState('');

  const passwordsMatch = Boolean(confirmPassword) && password === confirmPassword;

  const onSubmit: SubmitHandler<Inputs> = async ({ name, username, email, password: pw }) => {
    setSignUpError('');
    try {
      const result = await signUpAction({
        email,
        password: pw,
        name,
        username,
        phone,
        redirectTo: redirect
      });
      if (!result.success) {
        setSignUpError(result.message);
        return;
      }
      onComplete({ name, email });
    } catch (error) {
      setSignUpError(generateErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.body} noValidate>
      <div className={authStyles.form}>
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
        <TextField
          id="email"
          label="이메일"
          type="email"
          required
          placeholder="you@example.com"
          helper="로그인 아이디로 사용돼요"
          error={errors.email?.message}
          {...register('email', FORM_VALIDATIONS.email)}
        />
        <TextField
          id="password"
          label="비밀번호"
          type={showPassword ? 'text' : 'password'}
          required
          placeholder="영문·숫자 포함 8자 이상"
          error={errors.password?.message}
          trailingSlot={
            <button
              type="button"
              className={authStyles.password_toggle}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
              aria-pressed={showPassword}
            >
              {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          }
          {...register('password', FORM_VALIDATIONS.password)}
        />
        <TextField
          id="confirm-password"
          label="비밀번호 확인"
          type={showConfirm ? 'text' : 'password'}
          required
          placeholder="한 번 더 입력"
          error={errors.confirmPassword?.message}
          success={passwordsMatch ? '비밀번호가 일치해요' : undefined}
          trailingSlot={
            <button
              type="button"
              className={authStyles.password_toggle}
              onClick={() => setShowConfirm((prev) => !prev)}
              aria-label={showConfirm ? '비밀번호 숨기기' : '비밀번호 표시'}
              aria-pressed={showConfirm}
            >
              {showConfirm ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          }
          {...register('confirmPassword', {
            required: '비밀번호 확인을 입력해주세요.',
            validate: (value) => value === password || '두 비밀번호가 일치하지 않습니다.'
          })}
        />

        <TextField
          id="phone"
          label="휴대폰 번호 (선택)"
          type="tel"
          placeholder="010-0000-0000"
          helper="교회 연락용으로만 쓰여요"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>

      <div className={styles.footer}>
        <Button
          type="submit"
          variant="accent"
          fullWidth
          size="md"
          className={authStyles.cta}
          loading={isSubmitting}
          disabled={!isValid}
        >
          다음
        </Button>
        {signUpError && <FormAlertMessage type="error" message={signUpError} />}
      </div>
    </form>
  );
}
