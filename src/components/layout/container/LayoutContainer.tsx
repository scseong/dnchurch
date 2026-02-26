import clsx from 'clsx';
import styles from './LayoutContainer.module.scss';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function LayoutContainer({ children, className }: Props) {
  return <div className={clsx(styles.container, className)}>{children}</div>;
}
