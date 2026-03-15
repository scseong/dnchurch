import { PropsWithChildren } from 'react';
import HeroSection from '@/components/layout/hero/HeroSection';
import Breadcrumb from '@/components/layout/hero/Breadcrumb';
import { getSiteSettings } from '@/apis/site-settings';
import { getAllHeroImageKeys } from '@/utils/sitemap';

export default async function Layout({ children }: PropsWithChildren) {
  const heroImages = await getSiteSettings(getAllHeroImageKeys());

  return (
    <>
      <HeroSection heroImages={heroImages} />
      <Breadcrumb />
      {children}
    </>
  );
}
