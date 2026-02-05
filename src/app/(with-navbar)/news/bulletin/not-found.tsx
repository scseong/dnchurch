'use client';

import styles from './not-found.module.scss';

export default function NotFound() {
  const handleGoBack = () => {
    window.location.href = '/news/bulletin';
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>주보를 찾을 수 없습니다</h2>
      <p className={styles.description}>
        입력하신 주소의 형식이 올바르지 않거나, <br />
        해당 주보가 이미 삭제되었을 수 있습니다.
      </p>
      <div className={styles.buttonGroup}>
        <button onClick={handleGoBack} className={styles.primaryButton}>
          주보 목록으로 가기
        </button>
      </div>
    </div>
  );
}
