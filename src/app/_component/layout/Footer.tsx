import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer id="footer">
      <div className={styles.footer_wrap}>
        <p>✝️대구동남교회</p>
        <address>
          <p>대구광역시 달서구 달구벌대로307길 58 (죽전동)</p>
          <p>TEL. 053-552-3403, 053-561-2787</p>
        </address>
        <p>© DONGNAM CHURCH. ALL RIGHTS RESERVED. DESIGNED BY SCSEONG.</p>
      </div>
    </footer>
  );
}
