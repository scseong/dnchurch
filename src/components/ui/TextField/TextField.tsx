import { InputHTMLAttributes, ReactNode, useId } from 'react';
import clsx from 'clsx';
import styles from './TextField.module.scss';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label?: string;
  /** 입력 가이드 텍스트. 입력 규칙·범위·예시. */
  helper?: string;
  /** 에러 메시지. 지정 시 input이 error 스타일. */
  error?: string;
  /** 성공 메시지. 지정 시 input이 positive 스타일. error와 동시 지정 시 error 우선. */
  success?: string;
  id?: string;
  /** input 좌측 슬롯 (아이콘 등). */
  leadingIcon?: ReactNode;
  /** input 우측 슬롯. 아이콘·텍스트 버튼·글자 수 카운터 등. */
  trailingSlot?: ReactNode;
  className?: string;
};

/**
 * 텍스트 입력 필드 (Codeit 디자인 시스템 준거).
 *
 * - 폰트 16px 고정 — 모바일 iOS auto-zoom 방지
 * - 메시지 우선순위: `error` > `success` > `helper` (한 번에 하나만 표시)
 * - 다중 input 화면에서는 `label` 권장 (Codeit 가이드)
 * - 에러는 색상만으로 전달 금지 — `error` 텍스트로 명시 (color-vision 접근성)
 *
 * @example
 * ```tsx
 * <TextField label="이메일" type="email" error={emailError} />
 * <TextField label="비밀번호" type="password" trailingSlot={<button>표시</button>} />
 * <TextField label="이름" leadingIcon={<IoPerson />} success="사용 가능한 이름입니다" />
 * ```
 */
export function TextField({
  label,
  helper,
  error,
  success,
  id,
  required,
  disabled,
  leadingIcon,
  trailingSlot,
  className,
  ...inputProps
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;

  const message = error ?? success ?? helper;
  const hasMessage = Boolean(message);

  return (
    <div className={clsx(styles.field, className)}>
      {label && (
        <label htmlFor={inputId} className={clsx(styles.label, required && styles.required)}>
          {label}
        </label>
      )}
      <div
        className={clsx(
          styles.input_wrap,
          error && styles.error_state,
          !error && success && styles.success_state,
          disabled && styles.disabled_state
        )}
      >
        {leadingIcon && <span className={styles.leading}>{leadingIcon}</span>}
        <input
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={hasMessage ? messageId : undefined}
          className={clsx(
            styles.input,
            leadingIcon && styles.input_with_leading,
            trailingSlot && styles.input_with_trailing
          )}
          {...inputProps}
        />
        {trailingSlot && <span className={styles.trailing}>{trailingSlot}</span>}
      </div>
      {hasMessage && (
        <p
          id={messageId}
          className={clsx(
            styles.message,
            error && styles.message_error,
            !error && success && styles.message_success
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
