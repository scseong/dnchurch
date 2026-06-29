import type { ReactNode } from 'react';
import AboutSectionShell from './_component/AboutSectionShell';

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <AboutSectionShell>{children}</AboutSectionShell>;
}
