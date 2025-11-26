'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import useTimer from '@/hooks/useTimer';
import FormAlertMessage from '@/app/_component/auth/FormAlertMessage';
import Loader from '@/app/_component/common/Loader';
import { requestPasswordResetEmail } from '@/apis/auth';
import { generateErrorMessage } from '@/shared/constants/error';
import { EMAIL_RESEND_DELAY_SECONDS } from '@/shared/constants/timer';
import { EMAIL_REGEX } from '@/shared/util/regex';
import styles from './SignInForm.module.scss';

type Inputs = {
  email: string;
};

type AlertType = 'success' | 'error' | '';

export default function EmailVerificationRequestForm() {
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('');
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting, isSubmitSuccessful }
  } = useForm<Inputs>({ mode: 'onChange' });
  const { start, isFinished, isRunning, formattedRemain } = useTimer();

  const getButtonContent = () => {
    if (isSubmitting) return <Loader />;

    if (isSubmitSuccessful) {
      if (isRunning) return `재요청 가능 시간: ${formattedRemain}`;
      if (isFinished) return '인증 메일 재요청하기';
    }

    return '인증 메일 요청하기';
  };

  const onSubmit: SubmitHandler<Inputs> = async ({ email }) => {
    setAlertMessage('');
    setAlertType('');

    try {
      await requestPasswordResetEmail(email);
      setAlertMessage('이메일을 확인해 주세요. 링크는 1시간 후에 만료됩니다.');
      setAlertType('success');
      start(EMAIL_RESEND_DELAY_SECONDS);
    } catch (error) {
      const message = generateErrorMessage(error);
      setAlertMessage(message);
      setAlertType('error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.input_group}>
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
          placeholder="example@service.com"
        />
        {errors.email && <FormAlertMessage type="error" message={errors.email.message} />}
      </div>
      <button
        className={!isValid || isRunning ? styles.disabled_button : styles.active_button}
        disabled={!isValid || isRunning}
      >
        {getButtonContent()}
      </button>
      {alertMessage && (
        <FormAlertMessage
          type={alertType === 'success' ? 'success' : 'error'}
          message={alertMessage}
        />
      )}
    </form>
  );
}
