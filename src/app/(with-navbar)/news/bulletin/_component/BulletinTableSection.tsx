import BulletinYearFilter from '@/app/(with-navbar)/news/bulletin/_component/BulletinYearFilter';
import BulletinTable from '@/app/(with-navbar)/news/bulletin/_component/BulletinTable';
import CreateBulletinButton from '@/app/(with-navbar)/news/bulletin/_component/create/CreateBulletinButton';
import { BulletinType } from '@/types/common';
import styles from './BulletinTableSection.module.scss';

type Props = {
  yearFilter?: number;
  years: number[];
  bulletins: BulletinType[];
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
