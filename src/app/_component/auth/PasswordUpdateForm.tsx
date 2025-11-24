'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import FormAlertMessage from '@/app/_component/auth/FormAlertMessage';
import Loader from '@/app/_component/common/Loader';
import { updatePasswordAndSignOut } from '@/app/reset-password/actions';
import { generateErrorMessage } from '@/shared/constants/error';
import { PASSWORD_REGEX } from '@/shared/util/regex';
import styles from './SignUpForm.module.scss';

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
      <div className={styles.input_group}>
        <label htmlFor="password">비밀번호</label>
        <input
          {...register('password', {
            required: '비밀번호를 입력해주세요.',
            pattern: {
              value: PASSWORD_REGEX,
              message: '비밀번호는 영문, 숫자 포함 8자 이상이여야 합니다.'
            }
          })}
          id="password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="영문, 숫자 포함 6자 이상"
        />
        {errors.password && <FormAlertMessage type="error" message={errors.password.message} />}
      </div>
      <div className={styles.input_group}>
        <label htmlFor="confirm-password">비밀번호 확인</label>
        <input
          {...register('confirmPassword', {
            required: '비밀번호 확인을 입력해주세요.',
            validate: (value) => value === password || '두 비밀번호가 일치하지 않습니다.'
          })}
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="비밀번호 재입력"
        />
        {errors.confirmPassword && (
          <FormAlertMessage type="error" message={errors.confirmPassword.message} />
        )}
      </div>
      <button
        type="submit"
        className={!isValid ? styles.disabled_button : styles.active_button}
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? <Loader /> : '비밀번호 변경하기'}
      </button>
      {error && <FormAlertMessage type="error" message={error} />}
    </form>
  );
}
