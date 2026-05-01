import SermonFormShell from '@/app/(admin)/admin/sermons/_components/SermonFormShell';
import { getAllPreachers, getAllSeries } from '@/services/sermon';

export default async function SermonNewPage() {
  const [preachers, series] = await Promise.all([getAllPreachers(), getAllSeries()]);

  return <SermonFormShell mode="new" preachers={preachers} series={series} />;
}
