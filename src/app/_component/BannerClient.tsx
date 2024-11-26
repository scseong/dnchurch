'use client';

import HomeSwiper from './HomeSwiper';
import { Autoplay, EffectFade, Pagination, Parallax } from 'swiper/modules';
import { SwiperOptions } from 'swiper/types';
import { Tables } from '@/shared/types/database.types';

export default function BannerClient({ data }: BannerClientProps) {
  const options: SwiperOptions = {
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    autoHeight: true,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    loop: true,
    modules: [Autoplay, Pagination, Parallax, EffectFade],
    pagination: {
      clickable: true
    },
    parallax: true,
    slidesPerView: 1,
    speed: 1500
  };

  return <HomeSwiper bannerData={data} options={options} />;
}

type BannerClientProps = {
  data: Tables<'home_banner'>[];
};
