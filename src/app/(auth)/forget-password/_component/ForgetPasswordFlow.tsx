'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { IoInformationCircleOutline } from 'react-icons/io5';
import clsx from 'clsx';
import useTimer from '@/hooks/useTimer';
import AuthHeader from '@/app/_component/auth/AuthHeader';
import { FormAlertMessage } from '@/components/form';
import { Button, TextField } from '@/components/ui';
import { requestPasswordResetEmailAction } from '@/actions/auth.action';
import { FORM_VALIDATIONS } from '@/constants/validation';
import { generateErrorMessage } from '@/utils/error';
import authStyles from '@/app/_component/auth/authForm.module.scss';
import styles from './forgetPassword.module.scss';

type EmailInput = { email: string };

const CODE_SECONDS = 300;

export default function ForgetPasswordFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sentEmail, setSentEmail] = useState('');
  const [code, setCode] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting }
  } = useForm<EmailInput>({ mode: 'onChange' });
  const { start, formattedRemain, isRunning } = useTimer();

  const sendCode: SubmitHandler<EmailInput> = async ({ email }) => {
    setAlertMessage('');
    try {
      const result = await requestPasswordResetEmailAction(email);
      if (!result.success) {
        setAlertMessage(result.message);
        return;
      }
      setSentEmail(email);
      setStep(2);
      start(CODE_SECONDS);
    } catch (error) {
      setAlertMessage(generateErrorMessage(error));
    }
  };

  const resend = async () => {
    setAlertMessage('');
    try {
      const result = await requestPasswordResetEmailAction(sentEmail);
      if (!result.success) {
        setAlertMessage(result.message);
        return;
      }
      start(CODE_SECONDS);
    } catch (error) {
      setAlertMessage(generateErrorMessage(error));
    }
  };

  const goReset = () => {
    if (!code.trim()) {
      setAlertMessage('인증 코드를 입력해 주세요.');
      return;
    }
    router.push('/reset-password');
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setAlertMessage('');
    } else {
      router.push('/login');
    }
  };

  return (
    <>
      <AuthHeader title="비밀번호 찾기" onBack={handleBack} />

      {step === 1 ? (
        <form className={styles.body} onSubmit={handleSubmit(sendCode)} noValidate>
          <p className={styles.heading}>비밀번호를 재설정할게요</p>
          <p className={styles.sub}>
            가입하신 이메일로 인증 코드를 보내드려요. 메일을 확인해 코드를 입력해 주세요.
          </p>
          <div className={styles.fields}>
            <TextField
              id="email"
              label="이메일"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', FORM_VALIDATIONS.email)}
            />
            <div className={styles.callout}>
              <IoInformationCircleOutline className={styles.callout_icon} aria-hidden="true" />
              <span>
                메일이 오지 않으면 스팸함을 확인하거나, 교회 사무실(031-000-0000)로 문의해 주세요.
              </span>
            </div>
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
              인증 코드 받기
            </Button>
            {alertMessage && <FormAlertMessage type="error" message={alertMessage} />}
          </div>
        </form>
      ) : (
        <div className={styles.body}>
          <p className={styles.heading}>코드를 입력해 주세요</p>
          <p className={styles.sub}>
            <b className={styles.email_show}>{sentEmail}</b> 주소로
            <br />
            6자리 인증 코드를 보냈어요.
          </p>
          <div className={styles.fields}>
            <TextField
              id="verify-code"
              label="인증 코드"
              type="tel"
              inputMode="numeric"
              maxLength={6}
              className={styles.code_field}
              placeholder="메일로 받은 6자리"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              trailingSlot={
                <span className={clsx(styles.timer, !isRunning && styles.expired)}>
                  {formattedRemain}
                </span>
              }
            />
          </div>
          <p className={styles.resend_row}>
            코드를 받지 못하셨나요?{' '}
            <button type="button" className={styles.resend_btn} onClick={resend}>
              재전송
            </button>
          </p>
          <div className={styles.footer}>
            <Button
              type="button"
              variant="accent"
              fullWidth
              size="md"
              className={authStyles.cta}
              onClick={goReset}
            >
              다음
            </Button>
            {alertMessage && <FormAlertMessage type="error" message={alertMessage} />}
          </div>
        </div>
      )}
    </>
  );
}
