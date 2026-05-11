'use client';

import { useToastStore } from '@/store/toast.store';
import styles from '../page.module.scss';

type Props = {
  address: string;
  destinationName: string;
};

export default function AddressActions({ address, destinationName }: Props) {
  const { success, error } = useToastStore();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      success('주소가 복사되었습니다');
    } catch {
      error('주소 복사에 실패했습니다');
    }
  };

  // 검색 URL — 도착지(교회)에 카메라 포커싱. directions URL은 출발지 미지정 시 사용자 현재 위치로 카메라 이동
  const placeUrl = `https://map.naver.com/p/search/${encodeURIComponent(`${destinationName} ${address}`)}`;

  return (
    <div className={styles.address_actions}>
      <button type="button" className={styles.btn_secondary} onClick={handleCopy}>
        주소 복사
      </button>
      <a
        href={placeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.btn_primary}
      >
        길찾기
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
