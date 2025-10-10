import { GiHamburgerMenu } from 'react-icons/gi';
import Drawer from '../../home/Drawer';
import { ProfileType } from '@/shared/types/types';
import styles from './Header.module.scss';

type Props = {
  isMobile: boolean;
  isVisible: boolean;
  user: ProfileType | null;
  pathname: string;
  ref: React.RefObject<HTMLDivElement>;
  handleToggle: () => void;
};

export default function MobileToggle({
  isMobile,
  isVisible,
  user,
  pathname,
  ref,
  handleToggle
}: Props) {
  return (
    <div className={`${styles.toggle} ${isMobile ? styles.visible : styles.invisible}`} ref={ref}>
      <button onClick={handleToggle} aria-label="Toggle Navigation">
        <GiHamburgerMenu />
      </button>
      {isMobile && (
        <Drawer isOpen={isVisible} onClose={handleToggle} user={user} pathname={pathname} />
      )}
    </div>
  );
}
