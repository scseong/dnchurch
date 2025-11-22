'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import FormAlertMessage from '@/app/_component/auth/FormAlertMessage';
import Loader from '@/app/_component/common/Loader';
import { signInWithPassword } from '@/apis/auth';
import { EMAIL_REGEX, PASSWORD_REGEX } from '@/shared/util/regex';
import { generateErrorMessage } from '@/shared/constants/error';
import styles from './SignInForm.module.scss';

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

  const onSubmit: SubmitHandler<Inputs> = async ({ email, password }) => {
    try {
      setLogInError('');
      await signInWithPassword({ email, password });
    } catch (error) {
      const message = generateErrorMessage(error);
      setLogInError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.input_group}>
        <label htmlFor="email">이메일</label>
        <input
          {...register('email', {
            required: '이메일을 입력해주세요',
            pattern: {
              value: EMAIL_REGEX,
              message: '유효한 이메일 형식이 아닙니다.'
            }
          })}
          id="email"
          autoComplete="email"
          placeholder="이메일 입력"
        />
        {errors.email && <FormAlertMessage type="error" message={errors.email.message} />}
      </div>
      <div className={styles.input_group}>
        <label htmlFor="password">비밀번호</label>
        <input
          {...register('password', {
            required: '비밀번호를 입력해주세요.',
            pattern: {
              value: PASSWORD_REGEX,
              message: '영문, 숫자 포함 6자 이상 입력해주세요.'
            }
          })}
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호 입력 (영문 숫자 포함 6자 이상)"
        />
        {errors.password && <FormAlertMessage type="error" message={errors.password.message} />}
      </div>
      <button
        type="submit"
        className={!isValid ? styles.disabled_button : styles.active_button}
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? <Loader /> : '이메일로 로그인'}
      </button>
      {logInError && <FormAlertMessage type="error" message={logInError} />}
    </form>
  );
}
