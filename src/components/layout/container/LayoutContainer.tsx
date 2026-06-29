import clsx from 'clsx';
import styles from './LayoutContainer.module.scss';

type Props = {
  children: React.ReactNode;
  className?: string;
  /** 페이지 본문 — 상하 패딩(worship 기준)을 일률 적용한다. 섹션 컨테이너에는 쓰지 않는다. */
  body?: boolean;
};

export default function LayoutContainer({ children, className, body }: Props) {
  return (
    <div className={clsx(styles.container, body && styles.body, className)}>{children}</div>
  );
}
