import SermonFormShell from '@/app/(admin)/admin/sermons/_components/SermonFormShell';
import { getAdminPreachers, getAdminSeries } from '@/services/sermon/admin';

export default async function SermonNewPage() {
  const [preachers, series] = await Promise.all([getAdminPreachers(), getAdminSeries()]);

  return <SermonFormShell mode="new" preachers={preachers} series={series} />;
}
