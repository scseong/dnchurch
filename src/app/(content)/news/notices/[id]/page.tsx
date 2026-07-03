import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MainContainer from '@/components/layout/container/MainContainer';
import NoticeDetail from '@/app/(content)/news/notices/_component/NoticeDetail';
import { getNoticeById, getAllNoticeIds, getAdjacentNotices } from '@/services/notice';
import { isNumeric } from '@/utils/validator';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isNumeric(id)) return {};

  const { data: notice } = await getNoticeById(id);
  if (!notice) return {};

  const description = notice.content.replace(/\s+/g, ' ').trim().slice(0, 100);
  return { title: notice.title, description };
}

export async function generateStaticParams() {
  // getAllNoticeIds는 오류 시 handleResponse가 throw한다 — 빌드가 통째로 실패하지 않게 감싼다.
  try {
    const { data } = await getAllNoticeIds();
    if (!data) return [];

    return data.slice(0, 10).map((notice) => ({ id: notice.id.toString() }));
  } catch {
    return [];
  }
}

export const revalidate = 86400; // 24h — 목록과 같은 정적 캐시 주기

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  if (!isNumeric(id)) notFound();

  const { data: notice } = await getNoticeById(id);
  if (!notice) notFound();

  const { prev, next } = await getAdjacentNotices(notice.id, notice.created_at);

  return (
    <MainContainer title={notice.title}>
      <NoticeDetail notice={notice} prev={prev} next={next} />
    </MainContainer>
  );
}
