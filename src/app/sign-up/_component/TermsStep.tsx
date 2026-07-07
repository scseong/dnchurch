'use client';

import { useState } from 'react';
import { IoCheckmarkSharp, IoChevronDown } from 'react-icons/io5';
import clsx from 'clsx';
import { Button } from '@/components/ui';
import authStyles from '@/app/_component/auth/authForm.module.scss';
import styles from './signUpWizard.module.scss';

type Term = {
  id: string;
  required: boolean;
  label: string;
  detail?: string;
};

const TERMS: Term[] = [
  { id: 'age', required: true, label: '만 14세 이상입니다' },
  {
    id: 'service',
    required: true,
    label: '서비스 이용약관 동의',
    detail:
      '제1조(목적) 본 약관은 대구동남교회 앱 서비스의 이용 조건과 절차, 회원과 교회의 권리·의무를 규정합니다. 회원은 서비스를 신앙 공동체의 목적에 맞게 이용하며, 타인의 권리를 침해하지 않습니다.'
  },
  {
    id: 'privacy',
    required: true,
    label: '개인정보 수집·이용 동의',
    detail:
      '수집 항목: 이름, 이메일, 휴대폰 번호. 이용 목적: 회원 확인·교적 관리·공지 안내. 보유 기간: 회원 탈퇴 시까지. 동의를 거부하실 수 있으나, 이 경우 회원가입이 제한됩니다.'
  },
  {
    id: 'marketing',
    required: false,
    label: '교회 소식·행사 알림 수신',
    detail:
      '교회 소식·행사·수련회 안내를 이메일과 문자로 받아보실 수 있어요. 마이페이지에서 언제든지 수신을 해제할 수 있습니다.'
  }
];

export default function TermsStep({ onNext }: { onNext: () => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const allChecked = TERMS.every((term) => checked[term.id]);
  const requiredMet = TERMS.filter((term) => term.required).every((term) => checked[term.id]);

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleAll = () => {
    const next = !allChecked;
    setChecked(Object.fromEntries(TERMS.map((term) => [term.id, next])));
  };

  return (
    <div className={styles.body}>
      <p className={styles.terms_heading}>약관에 동의해 주세요</p>
      <p className={styles.terms_sub}>대구동남교회 앱 서비스 이용을 위해 필요한 약관이에요.</p>

      <button type="button" className={styles.all_agree} onClick={toggleAll}>
        <span
          className={clsx(styles.checkbox, styles.checkbox_square, allChecked && styles.checked)}
          aria-hidden="true"
        >
          <IoCheckmarkSharp />
        </span>
        <span>
          <span className={styles.all_title}>전체 동의합니다</span>
          <span className={styles.all_sub}>선택 항목 포함 아래 모든 약관에 동의</span>
        </span>
      </button>

      <div className={styles.terms_list}>
        {TERMS.map((term) => (
          <div className={styles.terms_row} key={term.id}>
            <div className={styles.terms_row_main}>
              <button
                type="button"
                role="checkbox"
                aria-checked={!!checked[term.id]}
                className={clsx(
                  styles.checkbox,
                  styles.checkbox_circle,
                  checked[term.id] && styles.checked
                )}
                onClick={() => toggle(term.id)}
              >
                <IoCheckmarkSharp aria-hidden="true" />
              </button>
              <span className={styles.terms_text}>
                <span className={term.required ? styles.badge_req : styles.badge_opt}>
                  [{term.required ? '필수' : '선택'}]
                </span>{' '}
                {term.label}
              </span>
              {term.detail && (
                <button
                  type="button"
                  className={styles.expand_btn}
                  onClick={() => setOpenId(openId === term.id ? null : term.id)}
                  aria-label={`${term.label} 상세 보기`}
                  aria-expanded={openId === term.id}
                >
                  <IoChevronDown
                    className={clsx(styles.expand_icon, openId === term.id && styles.open)}
                  />
                </button>
              )}
            </div>
            {term.detail && openId === term.id && (
              <p className={styles.terms_detail}>{term.detail}</p>
            )}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <Button
          variant="accent"
          fullWidth
          size="md"
          className={authStyles.cta}
          disabled={!requiredMet}
          onClick={onNext}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
