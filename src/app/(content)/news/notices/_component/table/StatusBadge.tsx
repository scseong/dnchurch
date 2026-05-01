export default function StatusBadge({ isPublished }: { isPublished: boolean }) {
  if (isPublished) return null;
  return <span className="badge badge--draft">비공개</span>;
}
