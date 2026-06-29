import type { Metadata } from 'next';
import clsx from 'clsx';
import { LuNavigation } from 'react-icons/lu';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import { getLocationPageData } from '@/services/about';
import { displaySettingValue, parseFiniteFloat } from '@/utils/site-settings';
import { CHURCH_INFO, OPEN_GRAPH_BASE } from '@/config/seo';
import AboutTabNav from '../_component/AboutTabNav';
import LocationMapClient from './_component/LocationMapClient';
import CopyChip from './_component/CopyChip';
import styles from './page.module.scss';

// 본관 층별 공간 (실데이터).
const MAIN_BUILDING_FLOORS = [
  { level: '3', label: '유아실' },
  { level: '2', label: '대예배실' },
  { level: '1', label: '소예배실·카페·사무실' },
  { level: 'B1', label: '식당' }
] as const;

// 교육관 — 층 구분 없는 공간 목록 (실데이터). 'G'(Ground) 배지로 표시.
const EDUCATION_ROOMS = ['유초등부실', '청년부실', '안나실'] as const;

// 주차 — site_settings 미입력 시 기본 안내.
const DEFAULT_PARKING =
  '교회 주차장에 약 10대까지 주차하실 수 있습니다. 만차 시 인근 공영주차장을 안내해 드립니다.';

export const metadata: Metadata = {
  title: '오시는 길',
  description: '대구동남교회에 오시는 방법을 안내합니다.',
  openGraph: {
    ...OPEN_GRAPH_BASE,
    title: '오시는 길',
    description: '대구동남교회에 오시는 방법을 안내합니다.'
  }
};

export default async function Directions() {
  const { settings } = await getLocationPageData();

  const lat = parseFiniteFloat(settings.church_lat, CHURCH_INFO.geo.latitude);
  const lng = parseFiniteFloat(settings.church_lng, CHURCH_INFO.geo.longitude);

  const address = displaySettingValue(settings.church_address);
  const zipcode = displaySettingValue(settings.church_zipcode);
  const phone = displaySettingValue(settings.church_phone);
  const email = displaySettingValue(settings.church_email);

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
  const parkingDisplay = parkingLines.length > 0 ? parkingLines : [DEFAULT_PARKING];

  // 길찾기 — 도착지(교회)로 카메라 포커싱하는 네이버 지도 검색 URL.
  const directionsUrl = `https://map.naver.com/p/search/${encodeURIComponent(`대구동남교회 ${address}`)}`;

  return (
    <div className={styles.surface}>
      <h1 className={styles.sr_only}>오시는 길</h1>
      <AboutTabNav />
      <LayoutContainer body>
        <div className={styles.page}>
          <section className={styles.intro}>
            <div className={styles.map_wrap}>
              <LocationMapClient
                lat={lat}
                lng={lng}
                width="100%"
                height="100%"
                name="대구동남교회"
              />
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.directions_button}
            >
              <LuNavigation className={styles.directions_icon} aria-hidden />
              <span className={styles.directions_label}>길찾기</span>
            </a>

            <div className={styles.card}>
              <div className={styles.row}>
                <span className={styles.row_label}>전화</span>
                <span className={styles.row_body}>
                  <span className={clsx(styles.row_value, styles.row_value_num)}>{phone}</span>
                </span>
                <a href={`tel:${phone}`} className={styles.chip}>
                  통화
                </a>
              </div>

              <div className={styles.row}>
                <span className={styles.row_label}>이메일</span>
                <span className={styles.row_body}>
                  <span className={clsx(styles.row_value, styles.row_value_break)}>{email}</span>
                </span>
                <CopyChip value={email} toast="이메일 주소가 복사되었습니다">
                  복사
                </CopyChip>
              </div>

              <div className={styles.row}>
                <span className={styles.row_label}>주소</span>
                <span className={styles.row_body}>
                  <span className={styles.row_value}>{address}</span>
                  {zipcode && <span className={styles.row_sub}>{zipcode}</span>}
                </span>
                <CopyChip value={address} toast="주소가 복사되었습니다">
                  복사
                </CopyChip>
              </div>
            </div>
          </section>

          <section>
            <div className={styles.section_head}>
              <h2 className={styles.section_title}>대중교통</h2>
            </div>
            <div className={styles.card}>
              <div className={styles.row}>
                <span className={styles.row_label}>지하철</span>
                <span className={styles.row_body}>
                  {subwayLines.map((line, index) => (
                    <span key={index} className={styles.row_line}>
                      {line}
                    </span>
                  ))}
                </span>
              </div>
              <div className={styles.row}>
                <span className={styles.row_label}>버스</span>
                <span className={styles.row_body}>
                  {busLines.map((line, index) => (
                    <span key={index} className={styles.row_line}>
                      {line}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </section>

          <section>
            <div className={styles.section_head}>
              <h2 className={styles.section_title}>주차</h2>
            </div>
            <div className={styles.parking_card}>
              {parkingDisplay.map((line, index) => (
                <p key={index} className={styles.parking_text}>
                  {line}
                </p>
              ))}
            </div>
          </section>

          <section>
            <div className={styles.section_head}>
              <h2 className={styles.section_title}>층별 안내</h2>
            </div>
            <div className={styles.floor_list}>
              <div className={styles.floor_card}>
                <p className={styles.floor_head}>본관</p>
                {MAIN_BUILDING_FLOORS.map((floor) => (
                  <div key={floor.level} className={styles.floor_row}>
                    <span className={styles.floor_badge}>{floor.level}</span>
                    <span className={styles.floor_label}>{floor.label}</span>
                  </div>
                ))}
              </div>
              <div className={styles.floor_card}>
                <p className={styles.floor_head}>교육관</p>
                {EDUCATION_ROOMS.map((room) => (
                  <div key={room} className={styles.floor_row}>
                    <span className={styles.floor_badge}>G</span>
                    <span className={styles.floor_label}>{room}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </LayoutContainer>
    </div>
  );
}
