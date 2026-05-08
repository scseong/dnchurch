import type { Metadata } from 'next';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
// eslint-disable-next-line no-restricted-imports -- 점진 마이그레이션 대상 (tech-debt-tracker.md)
import { getSiteSettings } from '@/apis/site-settings';
import LocationMapClient from './_component/LocationMapClient';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '오시는 길',
  description: '대구동남교회에 오시는 방법을 안내합니다.',
  openGraph: {
    title: '오시는 길',
    description: '대구동남교회에 오시는 방법을 안내합니다.'
  }
};

// TODO: 운영시간·전화·이메일 site_settings에 추가 후 실제 값으로 교체
const HOURS = [
  { label: '주일', value: '오전 09:00 – 오후 09:00 (TODO)' },
  { label: '평일', value: '오전 09:00 – 오후 06:00 (TODO)' },
  { label: '토요일', value: '오전 09:00 – 오후 03:00 (TODO)' }
];

const PHONE_TODO = 'TODO: 전화번호';
const EMAIL_TODO = 'TODO: 이메일';
const ZIPCODE_TODO = 'TODO: 우편번호';
const PARKING_TODO = ['TODO: 지하 주차장 안내', 'TODO: 주일 예배 시 무료 안내'];

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

  const subwayLines = settings.directions_subway ? [settings.directions_subway] : ['TODO: 지하철 안내'];
  const busLines: string[] = [];
  if (settings.directions_bus_stop_1) {
    busLines.push(`${settings.directions_bus_stop_1} ${settings.directions_bus_routes_1 ?? ''}`.trim());
  }
  if (settings.directions_bus_stop_2) {
    busLines.push(`${settings.directions_bus_stop_2} ${settings.directions_bus_routes_2 ?? ''}`.trim());
  }
  if (busLines.length === 0) {
    busLines.push('TODO: 버스 안내');
  }

  return (
    <LayoutContainer className={styles.container}>
      <div className={styles.map_wrap}>
        <LocationMapClient lat={lat} lng={lng} width="100%" height="100%" />
      </div>

      <div className={styles.cards_top}>
        <section className={styles.card}>
          <p className={styles.card_eyebrow}>ADDRESS</p>
          <p className={styles.address_main}>{settings.church_address ?? 'TODO: 주소'}</p>
          <p className={styles.address_sub}>{ZIPCODE_TODO}</p>
          <div className={styles.address_actions}>
            {/* TODO: 주소 복사 + 외부 지도 길찾기 링크 연동 */}
            <button type="button" className={styles.btn_secondary} disabled>
              주소 복사
            </button>
            <a href="#" className={styles.btn_primary}>
              길찾기
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.card_eyebrow}>CONTACT</p>
          <div className={styles.contact_row}>
            <p className={styles.contact_label}>전화</p>
            <p className={styles.contact_value}>{PHONE_TODO}</p>
          </div>
          <div className={styles.contact_row}>
            <p className={styles.contact_label}>이메일</p>
            <p className={styles.contact_value_sm}>{EMAIL_TODO}</p>
          </div>
        </section>
      </div>

      <div className={styles.cards_bottom}>
        <section className={styles.card}>
          <p className={styles.section_label}>OPENING HOURS</p>
          <ul className={styles.hours_list}>
            {HOURS.map((item) => (
              <li key={item.label} className={styles.hours_row}>
                <span className={styles.hours_label}>{item.label}</span>
                <span className={styles.hours_value}>{item.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.card}>
          <p className={styles.section_label}>TRANSPORTATION</p>
          <div className={styles.transit_grid}>
            <div className={styles.transit_item}>
              <p className={styles.transit_type}>
                <span className={styles.transit_dot} aria-hidden="true" />
                지하철
              </p>
              <ul className={styles.transit_lines}>
                {subwayLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
            <div className={styles.transit_item}>
              <p className={styles.transit_type}>
                <span className={styles.transit_dot} aria-hidden="true" />
                버스
              </p>
              <ul className={styles.transit_lines}>
                {busLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
            <div className={styles.transit_item}>
              <p className={styles.transit_type}>
                <span className={styles.transit_dot} aria-hidden="true" />
                주차
              </p>
              <ul className={styles.transit_lines}>
                {PARKING_TODO.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LayoutContainer>
  );
}
