'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import useTimer from '@/hooks/useTimer';
import { FormField, FormAlertMessage, FormSubmitButton } from '@/components/form';
import { requestPasswordResetEmail } from '@/apis/auth';
import { EMAIL_RESEND_DELAY_SECONDS } from '@/constants/auth';
import { FORM_VALIDATIONS } from '@/constants/validation';
import { generateErrorMessage } from '@/utils/error';

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
      <FormField
        id="email"
        label="이메일"
        placeholder="example@service.com"
        register={register('email', FORM_VALIDATIONS.email)}
        error={errors.email?.message}
        blindLabel
      />
      <FormSubmitButton
        isDisabled={!isValid || isRunning}
        isSubmitting={isSubmitting}
        label={getButtonContent()}
      />
      {alertMessage && (
        <FormAlertMessage
          type={alertType === 'success' ? 'success' : 'error'}
          message={alertMessage}
        />
      )}
    </form>
  );
}
