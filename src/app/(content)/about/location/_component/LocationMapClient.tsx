'use client';

import dynamic from 'next/dynamic';

const LocationMap = dynamic(() => import('./LocationMap'), { ssr: false });

type Props = { lat: number; lng: number; width: string; height: string; name: string };

export default function LocationMapClient({ lat, lng, width, height, name }: Props) {
  return (
    <div style={{ width, height }}>
      <LocationMap lat={lat} lng={lng} width={width} height={height} name={name} />
    </div>
  );
}
