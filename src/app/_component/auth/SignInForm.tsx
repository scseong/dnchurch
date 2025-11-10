'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { signInWithPassword } from '@/apis/auth';
import { EMAIL_REGEX, PASSWORD_REGEX } from '@/shared/util/regex';
import { generateErrorMessage } from '@/shared/constants/error';

type Inputs = {
  email: string;
  password: string;
};

export default function SignInForm() {
  const [logInError, setLogInError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Inputs>({ defaultValues: { email: '', password: '' }, mode: 'onChange' });

  const onSubmit: SubmitHandler<Inputs> = async ({ email, password }) => {
    try {
      await signInWithPassword({ email, password });
    } catch (error) {
      const message = generateErrorMessage(error);
      setLogInError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
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
          placeholder="이메일 입력"
        />
        <div>
          <p>{errors.email && errors.email.message}</p>
        </div>
      </div>
      <div>
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
          placeholder="비밀번호 입력 (영문 숫자 포함 6자 이상)"
        />
        <div>
          <p>{errors.password && errors.password.message}</p>
        </div>
      </div>
      <div>
        <button type="submit">이메일로 로그인</button>
      </div>
      {logInError && (
        <div>
          <p>{logInError}</p>
        </div>
      )}
    </form>
  );
}
