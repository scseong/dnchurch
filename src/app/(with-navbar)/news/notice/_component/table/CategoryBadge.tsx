import { CATEGORY_STYLE, NOTICE_CATEGORIES } from '@/constants/notice';
import type { NoticeCategory } from '@/types/notice';

export default function CategoryBadge({ category }: { category: NoticeCategory }) {
  const { color, bg } = CATEGORY_STYLE[category] ?? { color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span className="badge" style={{ color, background: bg }}>
      {NOTICE_CATEGORIES[category]}
    </span>
  );
}
