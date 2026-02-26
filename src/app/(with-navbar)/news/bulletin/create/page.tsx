import { Metadata } from 'next';
import { MainContainer } from '@/components/layout';
import BulletinForm from '@/app/(with-navbar)/news/bulletin/_component/BulletinForm';

export const metadata: Metadata = {
  title: '주보 추가하기'
};

export default function CreateBulletinPage() {
  return (
    <MainContainer title="주보 추가하기">
      <BulletinForm mode="create" />
    </MainContainer>
  );
}
