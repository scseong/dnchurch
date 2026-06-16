import type { Metadata } from 'next';
import ComingSoon from '@/components/common/ComingSoon/ComingSoon';

export const metadata: Metadata = {
  title: '교제'
};

export default function CommunityPage() {
  return <ComingSoon />;
}
