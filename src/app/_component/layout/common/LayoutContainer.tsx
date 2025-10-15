import styles from './Layout.module.scss';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function LayoutContainer({ children, className }: Props) {
  return <div className={`${styles.container} ${className || ''}`}>{children}</div>;
}
