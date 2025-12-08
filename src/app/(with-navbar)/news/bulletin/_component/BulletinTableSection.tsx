import BulletinYearFilter from '@/app/(with-navbar)/news/bulletin/_component/BulletinYearFilter';
import BulletinTable from '@/app/(with-navbar)/news/bulletin/_component/BulletinTable';
import CreateBulletinButton from '@/app/(with-navbar)/news/bulletin/_component/create/CreateBulletinButton';
import { BulletinType } from '@/shared/types/types';
import styles from './BulletinTableSection.module.scss';

type Props = {
  yearFilter: number;
  years: { year: number }[];
  bulletins: BulletinType[];
  count: number;
  currentPage: number;
};

export default function BulletinTableSection({
  yearFilter,
  years,
  bulletins,
  count,
  currentPage
}: Props) {
  return (
    <section className={styles.table}>
      <BulletinYearFilter selectedYear={yearFilter} years={years} />
      <BulletinTable bulletins={bulletins} count={count} currentPage={currentPage} />
      <CreateBulletinButton />
    </section>
  );
}
