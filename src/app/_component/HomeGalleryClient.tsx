'use client';

import HomeGalleryCarousel from './HomeGalleryCarousel';
import { Autoplay, FreeMode } from 'swiper/modules';
import { SwiperOptions } from 'swiper/types';
import { CatImageType } from './HomeGallery';

export default function HomeGalleryClient({ data }: HomeGalleryClientProps) {
  const options: SwiperOptions = {
    autoplay: {
      delay: 1,
      disableOnInteraction: false
    },
    freeMode: true,
    loop: true,
    loopAdditionalSlides: 1,
    speed: 8e3,
    slidesPerView: 'auto',
    observer: true,
    observeParents: true,
    modules: [Autoplay, FreeMode]
  };

  return <HomeGalleryCarousel options={options} data={data} />;
}

type HomeGalleryClientProps = {
  data: CatImageType[];
};
