'use client';

import { useEffect, useState } from 'react';
import useSermonFilter from '@/hooks/useSermonFilter';
import { SearchField } from '@/components/ui';
import styles from './SermonListPage.module.scss';

export default function SermonSearchForm() {
  const { q, setFilter } = useSermonFilter();
  const [input, setInput] = useState(q);

  // 외부 q 변경(검색 칩 제거·필터 초기화·라우트 전환)을 입력에 반영한다.
  // 디바운스 자동 검색을 없애 검색은 Enter(submit)·clear로만 일어나므로,
  // in-flight navigation이 입력을 되돌리던 버그(PR #95 #4)는 재발하지 않는다.
  // 또한 all/page가 사이드바·툴바 두 곳에 이 폼을 마운트해도(한쪽 display:none)
  // 미러는 setState일 뿐 navigation이 아니라 두 인스턴스 핑퐁 루프도 생기지 않는다.
  useEffect(() => {
    setInput(q);
  }, [q]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFilter({ q: input.trim() || null });
  };

  const handleClear = () => {
    setInput('');
    setFilter({ q: null });
  };

  return (
    <search className={styles.search_form}>
      <SearchField
        value={input}
        onChange={setInput}
        onClear={handleClear}
        onSubmit={handleSubmit}
        placeholder="제목·성경구절"
        aria-label="설교 검색"
      />
    </search>
  );
}
