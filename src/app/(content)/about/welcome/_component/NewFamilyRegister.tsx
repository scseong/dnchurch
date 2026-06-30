'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import clsx from 'clsx';
import { LuUserPlus } from 'react-icons/lu';
import { BottomSheet } from '@/components/ui';
import { FormAlertMessage, FormField, FormSubmitButton } from '@/components/form';
import { useToastStore } from '@/store/toast.store';
import { submitNewFamilyRegistration } from '@/actions/new-family.action';
import { INTEREST_OPTIONS, NEW_FAMILY_LIMITS, REFERRAL_OPTIONS } from '@/constants/new-family';
import pageStyles from '../page.module.scss';
import styles from './NewFamilyRegister.module.scss';

type FormValues = {
  name: string;
  phone: string;
  birthDate: string;
  referralSource: string;
  isNewBeliever: boolean;
  interests: string[];
  consentAll: boolean;
};

const DEFAULT_VALUES: FormValues = {
  name: '',
  phone: '',
  birthDate: '',
  referralSource: '',
  isNewBeliever: false,
  interests: [],
  consentAll: false
};

export default function NewFamilyRegister() {
  const { success } = useToastStore();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors, isValid, isSubmitting }
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES, mode: 'onChange' });

  const referralSource = watch('referralSource');
  const interests = watch('interests');

  const closeSheet = () => {
    setIsOpen(false);
    reset(DEFAULT_VALUES);
  };

  const toggleReferral = (option: string) => {
    setValue('referralSource', referralSource === option ? '' : option);
  };

  const toggleInterest = (option: string) => {
    const next = interests.includes(option)
      ? interests.filter((item) => item !== option)
      : [...interests, option];
    setValue('interests', next);
  };

  const onSubmit = async (data: FormValues) => {
    clearErrors('root');
    try {
      const result = await submitNewFamilyRegistration({
        name: data.name,
        phone: data.phone,
        birthDate: data.birthDate,
        referralSource: data.referralSource,
        isNewBeliever: data.isNewBeliever,
        interests: data.interests,
        privacyAgreed: data.consentAll,
        sensitiveAgreed: data.consentAll
      });
      if (!result.success) {
        setError('root', { message: result.message });
        return;
      }
      success('새가족 등록 신청이 접수되었습니다. 따뜻하게 연락드릴게요.');
      closeSheet();
    } catch {
      setError('root', { message: '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.' });
    }
  };

  return (
    <>
      <button type="button" className={pageStyles.register_cta} onClick={() => setIsOpen(true)}>
        <LuUserPlus className={pageStyles.register_cta_icon} aria-hidden />
        새가족 등록하기
      </button>

      <BottomSheet open={isOpen} onClose={closeSheet} title="새가족 등록">
        <p className={styles.subtitle}>
          교회에 처음 오신 여러분을 진심으로 환영합니다. 아래 정보를 남겨 주시면 새가족 담당자가
          따뜻하게 연락드리고, 첫걸음을 함께하겠습니다.
        </p>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <FormField
            id="name"
            label="이름"
            placeholder="성함을 입력해 주세요"
            register={register('name', {
              required: '이름을 입력해 주세요.',
              maxLength: {
                value: NEW_FAMILY_LIMITS.nameMax,
                message: `${NEW_FAMILY_LIMITS.nameMax}자 이내로 입력해 주세요.`
              }
            })}
            error={errors.name?.message}
          />
          <FormField
            id="phone"
            label="연락처"
            type="tel"
            placeholder="010-0000-0000"
            register={register('phone', {
              required: '연락처를 입력해 주세요.',
              minLength: { value: NEW_FAMILY_LIMITS.phoneMin, message: '연락처를 정확히 입력해 주세요.' },
              maxLength: { value: NEW_FAMILY_LIMITS.phoneMax, message: '연락처를 정확히 입력해 주세요.' }
            })}
            error={errors.phone?.message}
          />
          <FormField id="birthDate" label="생년월일" type="date" register={register('birthDate')} />

          <div className={styles.field}>
            <span className={styles.field_label}>어떻게 오셨나요?</span>
            <div className={styles.choice_group}>
              {REFERRAL_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={clsx(styles.choice, referralSource === option && styles.choice_on)}
                  aria-pressed={referralSource === option}
                  onClick={() => toggleReferral(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.field_label}>관심 영역</span>
            <div className={styles.choice_group}>
              {INTEREST_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={clsx(styles.choice, interests.includes(option) && styles.choice_on)}
                  aria-pressed={interests.includes(option)}
                  onClick={() => toggleInterest(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.check_row}>
            <input type="checkbox" className={styles.check_input} {...register('isNewBeliever')} />
            <span className={styles.check_label}>신앙생활이 처음이에요 (초신자)</span>
          </label>

          <label className={clsx(styles.check_row, styles.check_row_consent)}>
            <input
              type="checkbox"
              className={styles.check_input}
              {...register('consentAll', { required: '개인정보 수집·이용에 동의해 주세요.' })}
            />
            <span className={styles.check_label}>
              이름·연락처와 관심 영역·신앙 상태(민감정보)를 새가족 안내 목적으로 수집·이용하는 데
              동의합니다. (필수){' '}
              <Link href="/privacy-policy" target="_blank" className={styles.policy_link}>
                처리방침
              </Link>
            </span>
          </label>

          {errors.root && <FormAlertMessage type="error" message={errors.root.message} />}

          <FormSubmitButton isDisabled={!isValid} isSubmitting={isSubmitting} label="등록 신청하기" />
        </form>
      </BottomSheet>
    </>
  );
}
