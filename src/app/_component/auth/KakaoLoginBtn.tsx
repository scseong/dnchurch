'use client';

import { useSearchParams } from 'next/navigation';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { Button } from '@/components/ui';
// eslint-disable-next-line no-restricted-imports -- 점진 마이그레이션 대상 (tech-debt-tracker.md)
import { signInWithKakao } from '@/apis/auth';
import styles from './authForm.module.scss';

export default function KakaoLoginBtn() {
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const handleKakaoLogin = async () => {
    try {
      await signInWithKakao(redirect);
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
    }
  };

  return (
    <Button
      type="button"
      variant="kakao"
      size="md"
      fullWidth
      className={styles.cta}
      leadingIcon={<RiKakaoTalkFill className={styles.kakao_icon} aria-hidden="true" />}
      onClick={handleKakaoLogin}
    >
      카카오로 로그인
    </Button>
  );
}
