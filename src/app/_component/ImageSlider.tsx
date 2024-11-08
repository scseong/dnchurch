'use client';
import Slider, { Settings } from 'react-slick';
import styles from './ImageSlider.module.scss';
import { Tables } from '@/shared/types/database.types';
import {
  PiArrowCircleLeftThin,
  PiArrowCircleRightThin,
  PiArrowCircleRightFill,
  PiArrowCircleLeftFill
} from 'react-icons/pi';
import { useState } from 'react';

type ImageSliderProp = {
  homeBanners: Tables<'home_banner'>[];
};

type Options = {
  [key: string]: string | undefined;
};

type ArrowProps = {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  options: Options;
};

const ImageSlider = ({ homeBanners }: ImageSliderProp) => {
  // TODO: props로 전달
  const options: Options = {
    width: '3rem',
    height: '3rem',
    color: 'white',
    fontSize: '3rem'
  };

  const multiConfig: Settings = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    speed: 600,
    autoplaySpeed: 6000,
    fade: true,
    cssEase: 'ease-in-out',
    nextArrow: <NextArrow options={options} />,
    prevArrow: <PrevArrow options={options} />
  };

  const singleConfig = {
    ...multiConfig,
    draggable: false,
    arrows: false
  };

  const selectedConfig = homeBanners.length > 1 ? multiConfig : singleConfig;

  return (
    <div className={styles.image_slider}>
      <Slider {...selectedConfig}>
        {homeBanners &&
          homeBanners.map((banner) => (
            <div key={banner.id} className={styles.banner}>
              <img src={banner.image_url} alt={banner.title} />
              {banner.title && <h2>{banner.title}</h2>}
              {banner.description && <p>{banner.description}</p>}
            </div>
          ))}
      </Slider>
    </div>
  );
};

const PrevArrow = (props: ArrowProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { className, style, onClick, options } = props;

  return (
    <div
      className={`${className} ${styles.slider_arrow}`}
      style={{ ...style, ...options, left: '3rem' }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && <PiArrowCircleLeftFill />}
      {!isHovered && <PiArrowCircleLeftThin />}
    </div>
  );
};

const NextArrow = (props: ArrowProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { className, style, onClick, options } = props;

  return (
    <div
      className={`${className} ${styles.slider_arrow}`}
      style={{ ...style, ...options, right: '3rem' }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && <PiArrowCircleRightFill />}
      {!isHovered && <PiArrowCircleRightThin />}
    </div>
  );
};

export default ImageSlider;
