import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer id="footer">
      <div className={styles.container}>
        <div className={styles.logo}>
          {/* TODO: 로고 이미지로 대체 */}
          <p>대구동남교회</p>
        </div>
        <div className={styles.info}>
          <address>
            <p>주소: 대구광역시 달서구 달구벌대로307길 58 (죽전동)</p>
            <p>TEL: 053-552-3403, 053-561-2787</p>
          </address>
          <div>
            <p>© DONGNAM CHURCH. ALL RIGHTS RESERVED.&nbsp;</p>
            <p>DESIGNED BY SCSEONG.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
