import { redirect } from 'next/navigation';

// /news는 교회 소식 진입점 — 주보 목록(/news/bulletins)으로 보낸다.
// 재export 대신 redirect로 둬야 헤더 '교회 소식'·형제 탭·활성 상태가 /news/bulletins에 정확히 붙는다.
// 기존 /news?page=·?year=&month= 링크 호환을 위해 원래 쿼리는 목적지에 그대로 넘긴다.
export default async function NewsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') params.set(key, value);
    else if (Array.isArray(value)) value.forEach((entry) => params.append(key, entry));
  }
  const query = params.toString();
  redirect(query ? `/news/bulletins?${query}` : '/news/bulletins');
}
