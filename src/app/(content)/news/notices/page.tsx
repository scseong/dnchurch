import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MainContainer from '@/components/layout/container/MainContainer';
import NoticeControlBar from '@/app/(content)/news/notices/_component/NoticeControlBar';
import NoticeListClient from '@/app/(content)/news/notices/_component/NoticeListClient';
import { getNotices } from '@/services/notice';
import { validateSearchParams, validate } from '@/utils/common';
import { NOTICE_CATEGORIES } from '@/constants/notice';
import type { NoticeCategory } from '@/types/notice';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '공지사항',
  description: '대구동남교회 공지사항을 확인하세요.'
};

type Props = {
  searchParams: Promise<{
    page: string;
    category: NoticeCategory;
    search: string;
  }>;
};

export default async function Notice({ searchParams }: Props) {
  const params = await searchParams;
  const isValid = validateSearchParams(params, {
    page: validate.number,
    category: validate.within(NOTICE_CATEGORIES)
  });

  if (!isValid) notFound();

  const page = Math.max(1, params.page ? parseInt(params.page) : 1);
  const category = params.category ?? undefined;
  const search = params.search ?? undefined;

  const { data: posts, count } = await getNotices({ page, category, search });

  return (
    <MainContainer title="공지사항">
      <div className={styles.wrap}>
        <NoticeControlBar total={Number(count)} currentCategory={category} currentSearch={search} />
        <NoticeListClient data={posts ?? []} total={Number(count)} currentPage={page} />
      </div>
    </MainContainer>
  );
}
