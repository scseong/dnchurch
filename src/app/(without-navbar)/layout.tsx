'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { PropsWithChildren } from 'react';
import TopHero from '../_component/layout/common/TopHero';
import { sitemap } from '@/shared/constants/sitemap';

const findPathLabel = (path: string | null) => {
  const item = sitemap.find((item) => item.path === path);
  return item ? item.label : '';
};

export default function Layout({ children }: PropsWithChildren) {
  const segment = useSelectedLayoutSegment();
  const label = findPathLabel(`/${segment}`);

  return (
    <>
      <TopHero title={label || ''} />
      {children}
    </>
  );
}
