'use client';

import { useRouter } from 'next/navigation';
import { IoChevronBack } from 'react-icons/io5';
import styles from '../page.module.scss';

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <button type="button" className={styles.back_button} onClick={handleBack} aria-label="뒤로 가기">
      <IoChevronBack />
    </button>
  );
}
