'use client';

import { ChangeEvent, TextareaHTMLAttributes, useId, useState } from 'react';
import clsx from 'clsx';
import styles from './Textarea.module.scss';

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label?: string;
  /** 입력 가이드 텍스트. */
  helper?: string;
  /** 에러 메시지. 지정 시 textarea가 error 스타일. */
  error?: string;
  /** 성공 메시지. 지정 시 textarea가 positive 스타일. error와 동시 지정 시 error 우선. */
  success?: string;
  id?: string;
  /**
   * 글자 수 카운터를 footer 우측에 표시.
   * `maxLength` 있으면 `{현재}/{max}`, 없으면 `{현재}` 표기.
   */
  showCounter?: boolean;
  /** 콘텐츠에 따라 자동 확장 (`field-sizing: content`). 기본 false — `rows`로 고정. */
  autoGrow?: boolean;
  className?: string;
};

/**
 * 멀티라인 텍스트 입력 (Codeit 디자인 시스템 준거).
 *
 * - 폰트 16px 고정 — 모바일 iOS auto-zoom 방지
 * - 메시지 우선순위: `error` > `success` > `helper`
 * - 카운터: controlled / uncontrolled 모두 지원 (length는 내부 또는 `value`에서 파생)
 * - 기본 `resize: vertical`, `autoGrow=true`면 콘텐츠 기반 자동 확장
 *
 * @example
 * ```tsx
 * <Textarea label="간증" rows={5} maxLength={500} showCounter />
 * <Textarea label="메모" autoGrow placeholder="자동으로 늘어납니다" />
 * <Textarea label="제목" error="필수 항목입니다" required />
 * ```
 */
export function Textarea({
  label,
  helper,
  error,
  success,
  id,
  required,
  disabled,
  showCounter,
  autoGrow,
  maxLength,
  defaultValue,
  value,
  onChange,
  rows = 4,
  className,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const messageId = `${textareaId}-message`;

  const isControlled = value !== undefined;
  const [internalLength, setInternalLength] = useState(() =>
    typeof defaultValue === 'string' ? defaultValue.length : 0
  );
  const length = isControlled ? String(value ?? '').length : internalLength;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setInternalLength(e.target.value.length);
    onChange?.(e);
  };

  const message = error ?? success ?? helper;
  const hasMessage = Boolean(message);
  const hasFooter = hasMessage || showCounter;

  return (
    <div className={clsx(styles.field, className)}>
      {label && (
        <label htmlFor={textareaId} className={clsx(styles.label, required && styles.required)}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-invalid={!!error}
        aria-describedby={hasMessage ? messageId : undefined}
        className={clsx(
          styles.textarea,
          error && styles.textarea_error,
          !error && success && styles.textarea_success,
          autoGrow && styles.auto_grow
        )}
        {...rest}
      />
      {hasFooter && (
        <div className={styles.footer}>
          {hasMessage ? (
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
          ) : (
            <span />
          )}
          {showCounter && (
            <span className={styles.counter}>
              {length}
              {maxLength !== undefined && ` / ${maxLength}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
