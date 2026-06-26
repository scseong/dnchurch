import Link from 'next/link';
import { PiArrowRight } from 'react-icons/pi';
import styles from './SectionHeader.module.scss';

type SectionHeaderProps = {
  title: string;
  link?: { label: string; href: string };
};

// 홈 섹션 공용 헤더 — title + (선택)link. 링크엔 화살표 아이콘으로 페이지 이동 표시 + hover 애니메이션.
export default function SectionHeader({ title, link }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {link && (
        <Link href={link.href} className={styles.link}>
          {link.label}
          <PiArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
