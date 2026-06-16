import type { Metadata } from 'next';
import ComingSoon from '@/components/common/ComingSoon/ComingSoon';

export const metadata: Metadata = {
  title: '다음세대'
};

export default function NextGenPage() {
  return <ComingSoon />;
}
