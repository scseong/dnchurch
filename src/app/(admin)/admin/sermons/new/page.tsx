import PageHeader from '@/components/admin/layout/PageHeader';
import SermonForm from '@/components/admin/sermons/SermonForm';

export default function SermonNewPage() {
  return (
    <>
      <PageHeader
        eyebrow="설교 관리"
        badge="새 설교 등록"
        title="새 설교 등록"
        description="영상, 본문, 자료를 입력하고 발행하세요"
        actions={[
          { label: '임시저장', variant: 'outline' },
          { label: '발행', variant: 'pri' }
        ]}
      />
      <SermonForm />
    </>
  );
}
