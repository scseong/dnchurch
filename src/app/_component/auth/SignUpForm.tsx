'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { signUp } from '@/apis/auth';
import Loader from '@/app/_component/common/Loader';
import FormAlertMessage from '@/app/_component/auth/FormAlertMessage';
import { generateErrorMessage } from '@/shared/constants/error';
import { EMAIL_REGEX, NAME_REGEX, PASSWORD_REGEX } from '@/shared/util/regex';
import styles from './SignUpForm.module.scss';

type Inputs = {
  email: string;
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpForm() {
  const router = useRouter();
  const [signUpError, setSignUpError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting }
  } = useForm<Inputs>({ mode: 'onChange' });
  const password = watch('password');

  const onSubmit: SubmitHandler<Inputs> = async ({ email, password, name, username }) => {
    setSignUpError('');

    try {
      await signUp({ email, password, name, username });
      router.push('/');
    } catch (error) {
      const message = generateErrorMessage(error);
      setSignUpError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.input_group}>
        <label htmlFor="email">이메일</label>
        <input
          {...register('email', {
            required: '이메일 주소를 입력해주세요',
            pattern: {
              value: EMAIL_REGEX,
              message: '올바른 이메일 형식이 아닙니다.'
            }
          })}
          id="email"
          placeholder="example@service.com"
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
              message: '비밀번호는 영문, 숫자 포함 8자 이상이여야 합니다.'
            }
          })}
          id="password"
          type="password"
          name="password"
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
          placeholder="비밀번호 재입력"
        />
        {errors.confirmPassword && (
          <FormAlertMessage type="error" message={errors.confirmPassword.message} />
        )}
      </div>
      <div className={styles.input_group}>
        <label htmlFor="name">이름</label>
        <input
          {...register('name', {
            required: '이름을 입력해주세요.',
            pattern: {
              value: NAME_REGEX,
              message: '한글 또는 영문으로만 입력해주세요.'
            }
          })}
          id="name"
          placeholder="홍길동"
        />
        {errors.name && <FormAlertMessage type="error" message={errors.name.message} />}
      </div>
      <div className={styles.input_group}>
        <label htmlFor="username">프로필 이름 (닉네임)</label>
        <input
          {...register('username', {
            required: '프로필 이름을 입력해주세요.',
            maxLength: {
              value: 10,
              message: '10자 이내로 입력해주세요.'
            }
          })}
          id="username"
          placeholder="사용할 닉네임 10자 이내"
        />
        {errors.username && <FormAlertMessage type="error" message={errors.username.message} />}
      </div>
      <button
        className={!isValid ? styles.disabled_button : styles.active_button}
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? <Loader /> : '회원가입'}
      </button>
      {signUpError && <FormAlertMessage type="error" message={signUpError} />}
    </form>
  );
}
