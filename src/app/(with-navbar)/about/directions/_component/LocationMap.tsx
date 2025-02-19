'use client';

import { Map, MapMarker, useMap, ZoomControl } from 'react-kakao-maps-sdk';

export default function LocationMap({ lat, lng, width, height }: LocationMapProps) {
  return (
    <Map center={{ lat, lng }} style={{ width, height }} onDragEnd={() => console.log('move')}>
      <ZoomControl position={'RIGHT'} />
      <EventMarkerContainer lat={lat} lng={lng} />
    </Map>
  );
}

const EventMarkerContainer = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();

  return (
    <MapMarker position={{ lat, lng }} onClick={(marker) => map.panTo(marker.getPosition())} />
  );
};

type LocationMapProps = {
  lat: number;
  lng: number;
  width: string;
  height: string;
};
