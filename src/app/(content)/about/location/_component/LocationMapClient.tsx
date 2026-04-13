'use client';

import dynamic from 'next/dynamic';

const LocationMap = dynamic(() => import('./LocationMap'), { ssr: false });

type Props = { lat: number; lng: number; width: string; height: string };

export default function LocationMapClient({ lat, lng, width, height }: Props) {
  return (
    <div style={{ width, height }}>
      <LocationMap lat={lat} lng={lng} width={width} height={height} />
    </div>
  );
}
