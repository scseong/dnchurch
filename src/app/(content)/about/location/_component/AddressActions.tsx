'use client';

import { useToastStore } from '@/store/toast.store';
import styles from '../page.module.scss';

type Props = {
  address: string;
  lat: number;
  lng: number;
  destinationName: string;
};

export default function AddressActions({ address, lat, lng, destinationName }: Props) {
  const { success, error } = useToastStore();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      success('주소가 복사되었습니다');
    } catch {
      error('주소 복사에 실패했습니다');
    }
  };

  const directionsUrl = `https://map.naver.com/v5/directions/-/${lng},${lat},${encodeURIComponent(destinationName)},PLACE_POI/-/transit`;

  return (
    <div className={styles.address_actions}>
      <button type="button" className={styles.btn_secondary} onClick={handleCopy}>
        주소 복사
      </button>
      <a
        href={directionsUrl}
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
