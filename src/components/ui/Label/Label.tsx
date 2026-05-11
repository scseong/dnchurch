import { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Label.module.scss';

export type LabelVariant =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'accent';
export type LabelShape = 'rectangle' | 'round';
export type LabelSize = 'xs' | 'sm' | 'md' | 'lg';

export interface LabelProps {
  /**
   * 시맨틱 색상.
   * - `neutral` — 기본 분류·메타 (회색)
   * - `info` — 일반 정보 (navy)
   * - `success` — 긍정 상태·모집 (green)
   * - `warning` — 주의·강조 (orange)
   * - `danger` — 위험·비공개 (red)
   * - `accent` — 브랜드 강조·이번 주 표시 (gold)
   * @default 'neutral'
   */
  variant?: LabelVariant;
  /**
   * 모서리 형태. 같은 화면/리스트 내에서는 한 형태로 통일하세요.
   * @default 'rectangle'
   */
  shape?: LabelShape;
  /**
   * `xs` NEW·file ext / `sm` 카테고리·상태(기본) / `md` 카드 강조 / `lg` 히어로·섹션 헤더.
   * @default 'sm'
   */
  size?: LabelSize;
  children: ReactNode;
  className?: string;
}

/**
 * 정보성 라벨. 분류·상태·NEW·count 등 비인터랙티브 메타데이터 표시.
 *
 * 인터랙티브(클릭/해제)가 필요하면 `Pill`을 사용하세요.
 *
 * @example
 * ```tsx
 * <Label variant="info">교육</Label>
 * <Label variant="danger" size="xs">비공개</Label>
 * <Label variant="accent" shape="round">이번 주</Label>
 * ```
 */
export function Label({
  variant = 'neutral',
  shape = 'rectangle',
  size = 'sm',
  children,
  className
}: LabelProps) {
  return (
    <span
      className={clsx(
        styles.label,
        styles[variant],
        styles[shape],
        styles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
