'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthHeader from '@/app/_component/auth/AuthHeader';
import TermsStep from './TermsStep';
import InfoStep from './InfoStep';
import CompleteStep from './CompleteStep';
import styles from './signUpWizard.module.scss';

const STEPS = [
  { label: '약관 동의', percent: 33 },
  { label: '정보 입력', percent: 66 },
  { label: '가입 완료', percent: 100 }
];

export default function SignUpWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') ?? '/';
  // open redirect 방지 — 사이트 내 상대 경로만 허용
  const redirect =
    redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : '/';

  const [step, setStep] = useState(1);
  const [summary, setSummary] = useState<{ name: string; email: string } | null>(null);

  const handleBack = () => {
    if (step === 1) {
      router.push('/login');
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const current = STEPS[step - 1];

  return (
    <>
      <AuthHeader title="회원가입" showBack={step < 3} onBack={handleBack} />

      <div className={styles.progress}>
        <div className={styles.progress_head}>
          <span className={styles.progress_label}>{current.label}</span>
          <span className={styles.progress_step}>{step} / 3</span>
        </div>
        <div className={styles.progress_track}>
          <div className={styles.progress_fill} style={{ width: `${current.percent}%` }} />
        </div>
      </div>

      {step === 1 && <TermsStep onNext={() => setStep(2)} />}
      {step === 2 && (
        <InfoStep
          onComplete={(data) => {
            setSummary(data);
            setStep(3);
          }}
        />
      )}
      {step === 3 && summary && (
        <CompleteStep name={summary.name} email={summary.email} redirect={redirect} />
      )}
    </>
  );
}
