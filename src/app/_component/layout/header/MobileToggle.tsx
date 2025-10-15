import { GiHamburgerMenu } from 'react-icons/gi';
import styles from './index.module.scss';

type Props = {
  ref: React.RefObject<HTMLDivElement>;
  handleToggle: () => void;
};

export default function MobileToggle({ ref, handleToggle }: Props) {
  return (
    <div className={styles.toggle} ref={ref}>
      <button onClick={handleToggle} aria-label="Toggle Navigation">
        <GiHamburgerMenu />
      </button>
    </div>
  );
}
