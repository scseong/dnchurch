import PageHeader from '@/components/admin/layout/PageHeader';
import SermonForm from '@/components/admin/sermons/SermonForm';

export default function SermonEditPage() {
  return (
    <>
      <PageHeader
        eyebrow="설교 관리"
        badge="수정"
        title="설교 제목 자리"
        description="영상, 본문, 자료를 수정하고 저장하세요"
        actions={[
          { label: '임시저장', variant: 'outline' },
          { label: '수정 저장', variant: 'pri' }
        ]}
      />
      <SermonForm />
    </>
  );
}
