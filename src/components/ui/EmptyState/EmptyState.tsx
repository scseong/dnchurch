import { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './EmptyState.module.scss';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  /**
   * SR live announce 활성. 검색 결과·필터 결과처럼 **사용자 액션으로 콘텐츠가 비게 된** 경우 `true`.
   * 정적 placeholder(첫 진입 시 빈 페이지)에는 `false` (기본).
   * @default false
   */
  announce?: boolean;
  className?: string;
};

/**
 * 빈 상태 표시 — 검색 결과 없음, 데이터 미입력 페이지 등.
 *
 * @example
 * ```tsx
 * <EmptyState title="검색 결과가 없습니다" description="다른 검색어를 시도해 보세요" announce />
 * <EmptyState icon={<IoFolderOpen />} title="등록된 항목이 없습니다" action={<Button>새로 만들기</Button>} />
 * ```
 */
export function EmptyState({ icon, title, description, action, announce = false, className }: EmptyStateProps) {
  return (
    <div className={clsx(styles.container, className)} role={announce ? 'status' : undefined}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
