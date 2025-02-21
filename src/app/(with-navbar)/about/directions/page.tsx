import type { Metadata } from 'next';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import LocationMap from './_component/LocationMap';
import styles from './page.module.scss';
import { MdDirectionsBus, MdLocationOn } from 'react-icons/md';

export const metadata: Metadata = {
  title: '오시는 길 - 대구동남교회',
  description: '대구동남교회에 오시는 방법을 안내합니다.',
  openGraph: {
    title: '오시는 길 - 대구동남교회',
    description: '대구동남교회에 오시는 방법을 안내합니다.'
  }
};

const location = {
  lat: 35.85262832577055,
  lng: 128.53467835707838
};

export default function Directions() {
  return (
    <MainContainer title="오시는 길">
      <LocationMap lat={location.lat} lng={location.lng} width="100%" height="35rem" />
      <div className={styles.directions_info}>
        <div className={styles.container}>
          <div className={styles.icon}>
            <MdLocationOn />
          </div>
          <div className={styles.info}>
            <h4>주소</h4>
            <p>대구광역시 달서구 달구벌대로307길 58 (죽전동)</p>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.icon}>
            <MdDirectionsBus />
          </div>
          <div className={styles.info}>
            <h4>대중교통</h4>
            <ul>
              <li>
                <p>
                  <mark>지하철</mark> 2호선 죽전역 1번 출구 (도보 8분)
                </p>
              </li>
              <li>
                <p>
                  <mark>버스</mark> 죽전네거리 405 425 509 527 달서5 성서2 250
                </p>
              </li>
              <li>
                <p>
                  <mark></mark> 죽전119안전센터앞 503 서구 1-1
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainContainer>
  );
}
