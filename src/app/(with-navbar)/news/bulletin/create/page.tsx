import { Metadata } from 'next';
import CreateBulletinForm from '@/app/(with-navbar)/news/bulletin/_component/create/CreateBulletinForm';
import { MainContainer } from '@/app/_component/layout/common';

export const metadata: Metadata = {
  title: '주보 추가하기'
};

export default function CreateBulletinPage() {
  return (
    <MainContainer title="주보 추가하기">
      <CreateBulletinForm />
    </MainContainer>
  );
}
