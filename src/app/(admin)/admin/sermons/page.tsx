import SermonListPage from '@/components/admin/sermons/SermonListPage';
import { parseListFilterParams } from '@/components/admin/sermons/SermonListPage/hooks/list-filter-params';
import { getAdminSermons } from '@/services/sermon/admin';
import { getAllPreachers, getAllSeries } from '@/services/sermon';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toUrlSearchParams(
  raw: Record<string, string | string[] | undefined>
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    params.set(key, Array.isArray(value) ? value[0] : value);
  }
  return params;
}

export default async function SermonAdminListPage({ searchParams }: Props) {
  const raw = await searchParams;
  const params = parseListFilterParams(toUrlSearchParams(raw));

  const [{ sermons, total, statusCounts }, preachers, series] = await Promise.all([
    getAdminSermons(params),
    getAllPreachers(),
    getAllSeries()
  ]);

  return (
    <SermonListPage
      sermons={sermons}
      total={total}
      statusCounts={statusCounts}
      initialParams={params}
      preachers={preachers}
      series={series}
    />
  );
}
