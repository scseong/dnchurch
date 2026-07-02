import BulletinYearFilter from '@/app/(content)/news/bulletins/_component/BulletinYearFilter';
import BulletinTable from '@/app/(content)/news/bulletins/_component/BulletinTable';
import CreateBulletinButton from '@/app/(content)/news/bulletins/_component/CreateBulletinButton';
import type { BulletinWithImages } from '@/types/bulletin';
import styles from './BulletinTableSection.module.scss';

type Props = {
  yearFilter?: number;
  years: number[];
  bulletins: BulletinWithImages[];
  total: number;
  currentPage: number;
};

export default function BulletinTableSection({
  yearFilter,
  years,
  bulletins,
  total,
  currentPage
}: Props) {
  return (
    <section className={styles.table}>
      <BulletinYearFilter selectedYear={yearFilter} years={years} />
      <BulletinTable bulletins={bulletins} total={total} currentPage={currentPage} />
      <CreateBulletinButton />
    </section>
  );
}
