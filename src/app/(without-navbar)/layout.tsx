'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { PropsWithChildren } from 'react';
import SubHeader from '@/components/layout/header/SubHeader';
import { sitemap } from '@/constants/sitemap';

const findPathLabel = (path: string | null) => {
  const item = sitemap.find((item) => item.path === path);
  return item ? item.label : '';
};

export default function Layout({ children }: PropsWithChildren) {
  const segment = useSelectedLayoutSegment();
  const label = findPathLabel(`/${segment}`);

  return (
    <>
      <SubHeader title={label || ''} />
      {children}
    </>
  );
}
