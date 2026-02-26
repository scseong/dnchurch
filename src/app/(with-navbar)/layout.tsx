'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { PropsWithChildren } from 'react';
import PageHeader from '@/components/layout/header/SubHeader';
import SubNav from '@/components/layout/header/SubNav';
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
      <PageHeader title={label || ''} />
      <SubNav subPaths={subPaths} segment={`/${segment}`} />
      {children}
    </>
  );
}
