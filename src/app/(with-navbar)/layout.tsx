'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { PropsWithChildren } from 'react';
import TopHero from '../_component/layout/common/TopHero';
import SubNavMenu from '../_component/layout/common/SubNavMenu';
import { sitemap } from '@/constants/sitemap';

const findSubPathsAndLabel = (path: string | null) => {
  const item = sitemap.find((item) => item.path === path);
  return item ? { subPaths: item.subPath, label: item.label } : {};
};

export default function Layout({ children }: PropsWithChildren) {
  const segment = useSelectedLayoutSegment();
  const { subPaths, label } = findSubPathsAndLabel(`/${segment}`);

  return (
    <>
      <TopHero title={label || ''} />
      <SubNavMenu subPaths={subPaths} segment={`/${segment}`} />
      {children}
    </>
  );
}
