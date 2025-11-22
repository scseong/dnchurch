'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import FormAlertMessage from '@/app/_component/auth/FormAlertMessage';
import Loader from '@/app/_component/common/Loader';
import { LayoutContainer } from '@/app/_component/layout/common';
import { requestPasswordResetEmail } from '@/apis/auth';
import { EMAIL_REGEX } from '@/shared/util/regex';
import { generateErrorMessage } from '@/shared/constants/error';
import pageStyles from '../login/page.module.scss';
import formStyles from '@/app/_component/auth/SignInForm.module.scss';

type Inputs = {
  email: string;
};

type AlertType = 'success' | 'error' | '';

export default function ForgetPasswordPage() {
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('');
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting }
  } = useForm<Inputs>({ mode: 'onChange' });

  const onSubmit: SubmitHandler<Inputs> = async ({ email }) => {
    setAlertMessage('');
    setAlertType('');

    try {
      await requestPasswordResetEmail(email);
      setAlertMessage('인증 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요.');
      setAlertType('success');
    } catch (error) {
      const message = generateErrorMessage(error);
      setAlertMessage(message);
      setAlertType('error');
    }
  };

  return (
    <section>
      <LayoutContainer>
        <div className={pageStyles.wrap}>
          <div className={pageStyles.header}>
            <h1>비밀번호를 잊으셨나요?</h1>
            <p>이메일로 비밀번호를 재설정 할 수 있는 인증 링크를 보내드립니다.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={formStyles.input_group}>
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
              className={!isValid ? formStyles.disabled_button : formStyles.active_button}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? <Loader /> : '인증 메일 요청하기'}
            </button>
            {alertMessage && (
              <FormAlertMessage
                type={alertType === 'success' ? 'success' : 'error'}
                message={alertMessage}
              />
            )}
          </form>
        </div>
      </LayoutContainer>
    </section>
  );
}
