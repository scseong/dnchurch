'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { LuUserPlus } from 'react-icons/lu';
import { BottomSheet } from '@/components/ui';
import { useToastStore } from '@/store/toast.store';
import { submitNewFamilyRegistration } from '@/actions/new-family.action';
import styles from '../page.module.scss';

const REFERRAL_OPTIONS = ['지인 소개', '인터넷 검색', '우연히 방문', '기타'] as const;
const INTEREST_OPTIONS = ['자녀 교육', '교제', '봉사', '양육', '예배'] as const;

export default function NewFamilyRegister() {
  const { success, error } = useToastStore();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [referral, setReferral] = useState('');
  const [isNewBeliever, setIsNewBeliever] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);

  const reset = () => {
    setName('');
    setPhone('');
    setBirthDate('');
    setReferral('');
    setIsNewBeliever(false);
    setInterests([]);
    setAgreed(false);
  };

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    if (!name.trim() || !phone.trim()) {
      error('이름과 연락처를 입력해 주세요.');
      return;
    }
    if (!agreed) {
      error('개인정보 수집·이용에 동의해 주세요.');
      return;
    }

    setSubmitting(true);
    const result = await submitNewFamilyRegistration({
      name,
      phone,
      birthDate,
      referralSource: referral,
      isNewBeliever,
      interests,
      privacyAgreed: agreed
    });
    setSubmitting(false);

    if (result.ok) {
      success('새가족 등록 신청이 접수되었습니다. 따뜻하게 연락드릴게요.');
      setOpen(false);
      reset();
    } else {
      error(result.error ?? '등록에 실패했습니다.');
    }
  };

  return (
    <>
      <button type="button" className={styles.register_cta} onClick={() => setOpen(true)}>
        <LuUserPlus className={styles.register_cta_icon} aria-hidden />
        새가족 등록하기
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="새가족 등록">
        <p className={styles.form_subtitle}>남겨 주시면 따뜻하게 연락드릴게요.</p>
        <form className={styles.reg_form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.field_label}>이름</span>
            <input
              className={styles.field_input}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="성함을 입력해 주세요"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.field_label}>연락처</span>
            <input
              className={styles.field_input}
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="010-0000-0000"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.field_label}>생년월일</span>
            <input
              className={styles.field_input}
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </label>

          <div className={styles.field}>
            <span className={styles.field_label}>어떻게 오셨나요?</span>
            <div className={styles.choice_group}>
              {REFERRAL_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={clsx(styles.choice, referral === option && styles.choice_on)}
                  aria-pressed={referral === option}
                  onClick={() => setReferral((prev) => (prev === option ? '' : option))}
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
            <input
              className={styles.check_input}
              type="checkbox"
              checked={isNewBeliever}
              onChange={(event) => setIsNewBeliever(event.target.checked)}
            />
            <span className={styles.check_label}>신앙생활이 처음이에요 (초신자)</span>
          </label>

          <label className={styles.check_row}>
            <input
              className={styles.check_input}
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <span className={styles.check_label}>개인정보 수집·이용에 동의합니다.</span>
          </label>

          <button type="submit" className={styles.submit_btn} disabled={submitting}>
            {submitting ? '신청 중…' : '등록 신청하기'}
          </button>
        </form>
      </BottomSheet>
    </>
  );
}
