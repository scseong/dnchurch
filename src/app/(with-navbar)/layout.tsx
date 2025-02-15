import { LayoutProps } from '@/shared/types/props';

export default function NavbarLayout({ children }: LayoutProps) {
  return (
    <>
      <nav>NavbarLayout</nav>
      {children}
    </>
  );
}
