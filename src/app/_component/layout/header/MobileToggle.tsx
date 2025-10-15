import { GiHamburgerMenu } from 'react-icons/gi';
import styles from './index.module.scss';

type Props = {
  isMobile: boolean;
  ref: React.RefObject<HTMLDivElement>;
  handleToggle: () => void;
};

export default function MobileToggle({ isMobile, ref, handleToggle }: Props) {
  return (
    <div className={`${styles.toggle} ${isMobile ? styles.visible : styles.invisible}`} ref={ref}>
      <button onClick={handleToggle} aria-label="Toggle Navigation">
        <GiHamburgerMenu />
      </button>
    </div>
  );
}
