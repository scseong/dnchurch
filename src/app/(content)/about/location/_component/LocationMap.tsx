'use client';

import { Map, CustomOverlayMap, ZoomControl } from 'react-kakao-maps-sdk';
import { LuChurch } from 'react-icons/lu';
import styles from '../page.module.scss';

export default function LocationMap({ lat, lng, name }: LocationMapProps) {
  return (
    <Map center={{ lat, lng }} style={{ width: '100%', height: '100%' }}>
      <ZoomControl position={'RIGHT'} />
      <CustomOverlayMap position={{ lat, lng }} xAnchor={0.5} yAnchor={1}>
        <div className={styles.map_marker}>
          <span className={styles.map_marker_label}>{name}</span>
          <span className={styles.map_marker_pin}>
            <LuChurch aria-hidden />
          </span>
        </div>
      </CustomOverlayMap>
    </Map>
  );
}

type LocationMapProps = {
  lat: number;
  lng: number;
  name: string;
};
