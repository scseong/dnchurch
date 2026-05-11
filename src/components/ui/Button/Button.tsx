import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** 좌우 최소 패딩: `sm` 12px / `md` 16px / `lg` 24px */
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * - `primary` — navy 채움. 페이지 당 1개, 가장 중요한 CTA에만 사용
   * - `secondary` — 외곽선. 보조 액션
   * - `ghost` — 투명 배경 + primary 색상. 최소 시각 비중이 필요할 때
   * - `danger` — 빨간 채움. 삭제·되돌릴 수 없는 destructive 액션
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * 좌우 최소 패딩 기준: `sm` 12px / `md` 16px / `lg` 24px
   * @default 'md'
   */
  size?: ButtonSize;
  /** 부모 너비를 100% 채움. 모바일 전체 너비 CTA에 사용 */
  fullWidth?: boolean;
  /** 레이블 앞 아이콘 */
  leadingIcon?: ReactNode;
  /** 레이블 뒤 아이콘 */
  trailingIcon?: ReactNode;
}

/**
 * 공용 버튼 컴포넌트.
 *
 * `forwardRef`로 래핑되어 있어 모달/바텀시트 트리거의 포커스 복원,
 * 툴팁 위치 계산 시 DOM 노드에 직접 접근할 수 있습니다.
 *
 * @example
 * ```tsx
 * <Button>저장</Button>
 * <Button variant="secondary" size="sm" leadingIcon={<IoSearch />}>검색</Button>
 * <Button variant="ghost" trailingIcon={<IoChevronForward />}>더보기</Button>
 * <Button fullWidth size="lg">제출</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth = false, type = 'button', className, children, leadingIcon, trailingIcon, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.full_width,
        className
      )}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
});
