import type { Metadata } from 'next';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import { getLocationPageData } from '@/services/about';
import { displaySettingValue, parseFiniteFloat } from '@/utils/site-settings';
import LocationMapClient from './_component/LocationMapClient';
import AddressActions from './_component/AddressActions';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '오시는 길',
  description: '대구동남교회에 오시는 방법을 안내합니다.',
  openGraph: {
    title: '오시는 길',
    description: '대구동남교회에 오시는 방법을 안내합니다.'
  }
};

export default async function Directions() {
  const { settings, worship } = await getLocationPageData();

  const lat = parseFiniteFloat(settings.church_lat, 35.85262832577055);
  const lng = parseFiniteFloat(settings.church_lng, 128.53467835707838);

  const address = displaySettingValue(settings.church_address);
  const zipcode = displaySettingValue(settings.church_zipcode);
  const phone = displaySettingValue(settings.church_phone);
  const email = displaySettingValue(settings.church_email);

  // OPENING HOURS 대신 주요 예배 시간 표시 — 주일 + 평일(school 제외)
  const worshipList = [...worship.sunday, ...worship.weekday];

  const subwayValue = displaySettingValue(settings.directions_subway, '');
  const subwayLines = subwayValue ? [subwayValue] : ['준비 중'];

  const busStop1 = displaySettingValue(settings.directions_bus_stop_1, '');
  const busStop2 = displaySettingValue(settings.directions_bus_stop_2, '');
  const busRoutes1 = displaySettingValue(settings.directions_bus_routes_1, '');
  const busRoutes2 = displaySettingValue(settings.directions_bus_routes_2, '');

  const busLines: string[] = [];
  if (busStop1) busLines.push(`${busStop1} ${busRoutes1}`.trim());
  if (busStop2) busLines.push(`${busStop2} ${busRoutes2}`.trim());
  if (busLines.length === 0) busLines.push('준비 중');

  const parkingLines = [
    displaySettingValue(settings.parking_info_1, ''),
    displaySettingValue(settings.parking_info_2, '')
  ].filter(Boolean);
  const parkingDisplay = parkingLines.length > 0 ? parkingLines : ['준비 중'];

  return (
    <LayoutContainer className={styles.container}>
      <div className={styles.map_wrap}>
        <LocationMapClient lat={lat} lng={lng} width="100%" height="100%" />
      </div>

      <div className={styles.cards_top}>
        <section className={styles.card}>
          <p className={styles.card_eyebrow}>ADDRESS</p>
          <p className={styles.address_main}>{address}</p>
          <p className={styles.address_sub}>{zipcode}</p>
          <AddressActions
            address={address}
            lat={lat}
            lng={lng}
            destinationName="대구동남교회"
          />
        </section>

        <section className={styles.card}>
          <p className={styles.card_eyebrow}>CONTACT</p>
          <div className={styles.contact_row}>
            <p className={styles.contact_label}>전화</p>
            <p className={styles.contact_value}>{phone}</p>
          </div>
          <div className={styles.contact_row}>
            <p className={styles.contact_label}>이메일</p>
            <p className={styles.contact_value_sm}>{email}</p>
          </div>
        </section>
      </div>

      <div className={styles.cards_bottom}>
        <section className={styles.card}>
          <p className={styles.section_label}>WORSHIP SCHEDULE</p>
          {worshipList.length > 0 ? (
            <ul className={styles.hours_list}>
              {worshipList.map((item) => (
                <li key={item.id} className={styles.hours_row}>
                  <span className={styles.hours_label}>{item.name}</span>
                  <span className={styles.hours_value}>{item.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty_hint}>준비 중</p>
          )}
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
                {parkingDisplay.map((line, i) => (
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
