import type { Metadata } from 'next';
import MainContainer from '@/components/layout/container/MainContainer';
// eslint-disable-next-line no-restricted-imports -- 점진 마이그레이션 대상 (tech-debt-tracker.md)
import { getSiteSettings } from '@/apis/site-settings';
import styles from './page.module.scss';
import { MdDirectionsBus, MdLocationOn } from 'react-icons/md';
import LocationMapClient from './_component/LocationMapClient';

export const metadata: Metadata = {
  title: '오시는 길',
  description: '대구동남교회에 오시는 방법을 안내합니다.',
  openGraph: {
    title: '오시는 길',
    description: '대구동남교회에 오시는 방법을 안내합니다.'
  }
};

export default async function Directions() {
  const settings = await getSiteSettings([
    'church_address',
    'church_lat',
    'church_lng',
    'directions_subway',
    'directions_bus_stop_1',
    'directions_bus_routes_1',
    'directions_bus_stop_2',
    'directions_bus_routes_2'
  ]);

  const lat = parseFloat(settings.church_lat ?? '35.85262832577055');
  const lng = parseFloat(settings.church_lng ?? '128.53467835707838');

  return (
    <MainContainer title="오시는 길">
      <LocationMapClient lat={lat} lng={lng} width="100%" height="35rem" />
      <div className={styles.directions_info}>
        <div className={styles.container}>
          <div className={styles.icon}>
            <MdLocationOn />
          </div>
          <div className={styles.info}>
            <h4>주소</h4>
            <p>{settings.church_address}</p>
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
                  <mark>지하철</mark> {settings.directions_subway}
                </p>
              </li>
              <li>
                <p>
                  <mark>버스</mark> {settings.directions_bus_stop_1}{' '}
                  {settings.directions_bus_routes_1}
                </p>
              </li>
              <li>
                <p>
                  <mark></mark> {settings.directions_bus_stop_2} {settings.directions_bus_routes_2}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainContainer>
  );
}
