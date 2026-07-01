'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchField } from '@/components/ui';

type Props = {
  className?: string;
};

// 설교 홈 상단 검색 — 제출 시 전체 설교(/sermons/all)로 검색어를 넘긴다. all 페이지가 q를 읽어 필터한다.
export default function SermonHomeSearch({ className }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/sermons/all?q=${encodeURIComponent(trimmed)}` : '/sermons/all');
  };

  return (
    <search className={className}>
      <SearchField
        value={query}
        onChange={setQuery}
        onSubmit={handleSubmit}
        aria-label="설교 검색"
        placeholder="제목·본문 검색"
      />
    </search>
  );
}
