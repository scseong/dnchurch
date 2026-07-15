'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { IoCheckmarkSharp, IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import clsx from 'clsx';
import AuthHeader from '@/app/_component/auth/AuthHeader';
import { FormAlertMessage } from '@/components/form';
import { Button, TextField } from '@/components/ui';
import { generateErrorMessage } from '@/utils/error';
import { FORM_VALIDATIONS } from '@/constants/validation';
import authStyles from '@/app/_component/auth/authForm.module.scss';
import { updatePasswordAndSignOut } from '../actions';
import styles from './resetPassword.module.scss';

type Inputs = {
  password: string;
  confirmPassword: string;
};

const STRENGTH = [
  { label: '', hint: '영문·숫자·특수문자를 조합하면 더 안전해요' },
  { label: '약함', hint: '조금 더 복잡하게 만들어 주세요' },
  { label: '보통', hint: '괜찮아요, 조금 더 강하게도 좋아요' },
  { label: '강함', hint: '안전한 비밀번호예요' }
];

function scorePassword(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Za-z]/.test(value) && /[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 3);
}

export default function ResetPasswordFlow() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [redirect, setRedirect] = useState('/login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting }
  } = useForm<Inputs>({ mode: 'onChange' });
  const { password, confirmPassword } = watch();

  const strength = password ? scorePassword(password) : 0;
  const passwordsMatch = Boolean(confirmPassword) && password === confirmPassword;
  const strengthText = password
    ? [STRENGTH[strength].label, STRENGTH[strength].hint].filter(Boolean).join(' · ')
    : STRENGTH[0].hint;

  const onSubmit: SubmitHandler<Inputs> = async ({ password: newPassword }) => {
    setSubmitError('');
    try {
      const { error, redirectTo } = await updatePasswordAndSignOut(newPassword);
      if (error) {
        setSubmitError(error);
        return;
      }
      if (redirectTo) setRedirect(redirectTo);
      setDone(true);
    } catch (error) {
      setSubmitError(generateErrorMessage(error));
    }
  };

  if (done) {
    return (
      <>
        <AuthHeader title="비밀번호 재설정" showBack={false} />
        <div className={styles.done}>
          <span className={styles.check_circle} aria-hidden="true">
            <IoCheckmarkSharp />
          </span>
          <p className={styles.done_title}>비밀번호가 변경되었어요</p>
          <p className={styles.done_sub}>새 비밀번호로 다시 로그인해 주세요.</p>
        </div>
        <div className={styles.footer}>
          <Button
            variant="accent"
            fullWidth
            size="md"
            className={authStyles.cta}
            onClick={() => router.push(redirect)}
          >
            로그인하기
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthHeader title="비밀번호 재설정" onBack={() => router.push('/forget-password')} />
      <form onSubmit={handleSubmit(onSubmit)} className={styles.body} noValidate>
        <p className={styles.heading}>새 비밀번호를 설정해 주세요</p>
        <p className={styles.sub}>다른 곳에서 쓰지 않는 안전한 비밀번호로 설정해 주세요.</p>

        <div className={styles.fields}>
          <div>
            <TextField
              id="password"
              label="새 비밀번호"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="영문·숫자 포함 8자 이상"
              error={errors.password?.message}
              trailingSlot={
                <button
                  type="button"
                  className={authStyles.password_toggle}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                </button>
              }
              {...register('password', FORM_VALIDATIONS.password)}
            />
            <div className={styles.strength_bars}>
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className={clsx(styles.strength_bar, index < strength && styles[`s${strength}`])}
                />
              ))}
            </div>
            <p className={clsx(styles.strength_text, password && styles[`t${strength}`])}>
              {strengthText}
            </p>
          </div>

          <TextField
            id="confirm-password"
            label="새 비밀번호 확인"
            type={showConfirm ? 'text' : 'password'}
            required
            placeholder="한 번 더 입력"
            error={errors.confirmPassword?.message}
            success={passwordsMatch ? '비밀번호가 일치해요' : undefined}
            trailingSlot={
              <button
                type="button"
                className={authStyles.password_toggle}
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? '비밀번호 숨기기' : '비밀번호 표시'}
                aria-pressed={showConfirm}
              >
                {showConfirm ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            }
            {...register('confirmPassword', {
              required: '비밀번호 확인을 입력해주세요.',
              validate: (value) => value === password || '두 비밀번호가 일치하지 않습니다.'
            })}
          />
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
            비밀번호 변경
          </Button>
          {submitError && <FormAlertMessage type="error" message={submitError} />}
        </div>
      </form>
    </>
  );
}
