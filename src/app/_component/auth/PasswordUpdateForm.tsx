'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormAlertMessage } from '@/components/form';
import { Button, TextField } from '@/components/ui';
import { updatePasswordAndSignOut } from '@/app/reset-password/actions';
import { generateErrorMessage } from '@/utils/error';
import { FORM_VALIDATIONS } from '@/constants/validation';
import styles from './authForm.module.scss';

type Inputs = {
  password: string;
  confirmPassword: string;
};

export default function PasswordUpdateForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    setError: setFormError,
    clearErrors,
    formState: { errors, isValid, isSubmitting }
  } = useForm<Inputs>({ mode: 'onChange' });
  const { password, confirmPassword } = watch();

  useEffect(() => {
    if (password !== confirmPassword && confirmPassword) {
      setFormError('confirmPassword', { message: '두 비밀번호가 일치하지 않습니다.' });
    } else clearErrors('confirmPassword');
  }, [password]);

  const onSubmit: SubmitHandler<Inputs> = async ({ password }) => {
    setError('');

    try {
      const { error, redirectTo } = await updatePasswordAndSignOut(password);
      if (error) setError(error);
      if (redirectTo) router.push(redirectTo);
    } catch (error) {
      const message = generateErrorMessage(error);
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
      <Button type="submit" fullWidth size="lg" loading={isSubmitting} disabled={!isValid}>
        비밀번호 변경하기
      </Button>
      {error && <FormAlertMessage type="error" message={error} />}
    </form>
  );
}
