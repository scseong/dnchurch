import { RxHamburgerMenu } from 'react-icons/rx';
import styles from './MobileToggle.module.scss';

type Props = {
  ref: React.RefObject<HTMLDivElement>;
  handleToggle: () => void;
};

export default function MobileToggle({ ref, handleToggle }: Props) {
  return (
    <div className={styles.toggle} ref={ref}>
      <button onClick={handleToggle} aria-label="Toggle Navigation">
        <RxHamburgerMenu />
      </button>
    </div>
  );
}
