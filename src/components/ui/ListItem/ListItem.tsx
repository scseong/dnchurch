import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import styles from './ListItem.module.scss';

type CommonProps = {
  selected?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
};

type ButtonModeProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type LinkModeProps = CommonProps & {
  href: string;
  scroll?: boolean;
  prefetch?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
};

export type ListItemProps = ButtonModeProps | LinkModeProps;

export function ListItem(props: ListItemProps) {
  const { selected, disabled, trailing, className, children } = props;
  const rootClass = clsx(
    styles.item,
    selected && styles.selected,
    disabled && styles.disabled,
    className
  );
  const ariaCurrent = selected ? ('true' as const) : undefined;

  const body = (
    <>
      <span className={styles.body}>{children}</span>
      {trailing !== undefined && <span className={styles.trailing}>{trailing}</span>}
    </>
  );

  if (props.href !== undefined) {
    const { href, scroll, prefetch, onClick, 'aria-label': ariaLabel } = props;
    return (
      <Link
        href={href}
        scroll={scroll}
        prefetch={prefetch}
        onClick={onClick}
        className={rootClass}
        aria-current={ariaCurrent}
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
      >
        {body}
      </Link>
    );
  }

  const {
    selected: _selected,
    disabled: _disabled,
    trailing: _trailing,
    className: _className,
    children: _children,
    href: _href,
    type = 'button',
    ...buttonRest
  } = props;

  return (
    <button
      type={type}
      className={rootClass}
      aria-current={ariaCurrent}
      disabled={disabled}
      {...buttonRest}
    >
      {body}
    </button>
  );
}
