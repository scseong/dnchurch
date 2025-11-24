'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import useTimer from '@/hooks/useTimer';
import FormAlertMessage from '@/app/_component/auth/FormAlertMessage';
import Loader from '@/app/_component/common/Loader';
import { requestPasswordResetEmail } from '@/apis/auth';
import { generateErrorMessage } from '@/shared/constants/error';
import { EMAIL_VERIFICATION_TIME } from '@/shared/constants/timer';
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
  const { start, isFinished, isRunning, formattedRemain } = useTimer(() => {
    setAlertType('error');
    setAlertMessage('인증 유효기간이 만료되었습니다.');
  });

  const getButtonContent = () => {
    if (isSubmitting) return <Loader />;

    if (isSubmitSuccessful) {
      if (isRunning) return formattedRemain;
      if (isFinished) return '인증 메일 요청하기';
    }

    return '인증 메일 요청하기';
  };

  const onSubmit: SubmitHandler<Inputs> = async ({ email }) => {
    setAlertMessage('');
    setAlertType('');

    try {
      await requestPasswordResetEmail(email);
      setAlertMessage('인증 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요.');
      setAlertType('success');
      start(EMAIL_VERIFICATION_TIME);
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
        className={!isValid ? styles.disabled_button : styles.active_button}
        disabled={!isValid || isSubmitting}
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
