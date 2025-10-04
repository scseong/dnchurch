import Link from 'next/link';
import { TbMenu } from 'react-icons/tb';
import { sitemap } from '@/shared/constants/sitemap';
import styles from './Header.module.scss';

export default function Header() {
  // const isMobile = useIsMobile();
  // const { isVisible: isNavVisible, ref, handleToggle, setVisible } = useModal();
  // const {
  //   isVisible: isProfileVisible,
  //   ref: profileRef,
  //   handleToggle: handleProfileToggle,
  //   setVisible: setProfileVisible
  // } = useModal();
  // const pathname = usePathname();
  // const user = useProfile();

  // useEffect(() => {
  //   setVisible(false);
  //   setProfileVisible(false);
  // }, [setVisible, setProfileVisible, pathname]);

  return (
    <header className={styles.header}>
      <div className={styles.header_wrap}>
        <div className={styles.logo}>
          <h1>
            <Link href="/">대구동남교회</Link>
          </h1>
        </div>
        <nav className={styles.nav}>
          <ul>
            {sitemap
              .filter((item) => item.show)
              .map((item, index) => (
                <li key={index}>
                  <Link href={item.path}>{item.label}</Link>
                </li>
              ))}
          </ul>
        </nav>
        <div>
          <button className={styles.menu_btn}>
            <TbMenu size="1.4rem" />
            메뉴
          </button>
        </div>
      </div>
    </header>
  );
}
