'use client';

import { useRouter } from 'next/navigation';
import { IoChevronBack } from 'react-icons/io5';
import styles from './authHeader.module.scss';

type AuthHeaderProps = {
  /** 가운데 정렬 페이지 제목 (h1) */
  title: string;
  /** 뒤로가기 동작 재정의. 없으면 히스토리 back(없으면 홈)으로 폴백. */
  onBack?: () => void;
  /** 뒤로가기 버튼 노출 여부. 마지막 완료 화면 등에서 false. @default true */
  showBack?: boolean;
};

/**
 * auth 화면(로그인·회원가입·비밀번호 찾기) 공용 상단 헤더.
 * 뒤로가기 버튼 + 가운데 제목 + 우측 spacer로 제목을 정확히 중앙에 둔다.
 */
export default function AuthHeader({ title, onBack, showBack = true }: AuthHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className={styles.header}>
      {showBack ? (
        <button
          type="button"
          className={styles.back_button}
          onClick={handleBack}
          aria-label="뒤로 가기"
        >
          <IoChevronBack />
        </button>
      ) : (
        <span className={styles.spacer} />
      )}
      <h1 className={styles.title}>{title}</h1>
      <span className={styles.spacer} />
    </div>
  );
}
