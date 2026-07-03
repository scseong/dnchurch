import type { Metadata } from 'next';
import ComingSoon from '@/components/common/ComingSoon/ComingSoon';

export const metadata: Metadata = {
  title: '갤러리'
};

export default function Gallery() {
  return <ComingSoon title="갤러리" />;
}
