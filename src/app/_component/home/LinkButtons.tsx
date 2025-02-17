import {
  PiNewspaperClipping,
  PiClockUser,
  PiMapTrifold,
  PiMapPinAreaLight,
  PiWechatLogo
} from 'react-icons/pi';
import styles from './LinkButtons.module.scss';
import Link from 'next/link';

export default function LinkButtons() {
  const quickList = [
    { icon: PiMapTrifold, label: '주보', path: '/news/bulletin' },
    { icon: PiClockUser, label: '예배안내', path: '/about' },
    { icon: PiMapPinAreaLight, label: '오시는길', path: '/about' },
    { icon: PiNewspaperClipping, label: '교회소식', path: '/news' },
    { icon: PiWechatLogo, label: '나눔', path: '/fellowship' },
    { icon: PiClockUser, label: '행정', path: '/' }
  ];

  return (
    <section>
      <ul className={styles.quick_menu}>
        {quickList.map((item, index) => (
          <li key={index} className={styles.menu_item}>
            <Link href={item.path} key={index}>
              <div>
                <item.icon />
              </div>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
