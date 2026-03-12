'use client';

import { PropsWithChildren } from 'react';
import HeroSection from '@/components/layout/hero/HeroSection';
import Breadcrumb from '@/components/layout/hero/Breadcrumb';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <HeroSection />
      <Breadcrumb />
      {children}
    </>
  );
}
