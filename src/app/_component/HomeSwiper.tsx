'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';
import { Tables } from '@/shared/types/database.types';
import styles from './HomeSwiper.module.scss';

type SwiperProps = {
  bannerData: Tables<'home_banner'>[];
  options: SwiperOptions;
};

export default function HomeSwiper({ bannerData, options }: SwiperProps) {
  return (
    <Swiper {...options} className={styles.swiper}>
      {bannerData.map((banner) => (
        <SwiperSlide key={banner.id}>
          <img src={banner.image_url} alt={banner.title} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

// {banner.title && <h2>{banner.title}</h2>}
// {banner.description && <p>{banner.description}</p>}
