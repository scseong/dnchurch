'use client';

import HomeSwiper from './HomeSwiper';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { SwiperOptions } from 'swiper/types';
import { Tables } from '@/shared/types/database.types';

export default function BannerClient({ data }: BannerClientProps) {
  const options: SwiperOptions = {
    autoplay: {
      delay: 6000
    },
    effect: 'fade',
    loop: true,
    modules: [Autoplay, EffectFade, Pagination],
    pagination: { clickable: true }
  };

  return <HomeSwiper bannerData={data} options={options} />;
}

type BannerClientProps = {
  data: Tables<'home_banner'>[];
};
