'use client';

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

export default function HomeGalleryCarousel({ data, options }: HomeGalleryCarouselProps) {
  return (
    <Swiper {...options}>
      {data.map((cat) => (
        <SwiperSlide key={cat._id}>
          <Link href={`/gallery/${cat._id}`}>
            <img src={`https://cataas.com/cat/${cat._id}`} alt={`cat ${cat._id}`} />
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

type CatImage = {
  _id: string;
  mimetype: string;
  size: string;
  tags: string;
};

type HomeGalleryCarouselProps = {
  data: CatImage[];
  options: SwiperOptions;
};
