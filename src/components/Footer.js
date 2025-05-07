import styles from './footer.module.css';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer id='footer' className={styles.footer}>
      <div className={styles['footer-container']}>
        <div className={styles['footer-section']}>
          <div className={styles.logo} style={{display:'flex',alignItems:'center',marginBottom:'20px'}}>
           <Image src={'/images/logo.png'} alt='logo' width={45} height={45} />
            <h3>Moj Termin</h3>
          </div>
          <p>Jednostavno digitalno zakazivanje termina – za svaki biznis.</p>
        </div>

        <div className={styles['footer-section']}>
          <h4>Navigacija</h4>
          <ul>
            <li><Link href="/panel">Korisnički panel</Link></li>
            <li><Link href="/usluge">Usluge</Link></li>
            <li><Link href="/login">Probaj besplatno</Link></li>
          </ul>
        </div>

        <div className={styles['footer-section']}>
          <h4>Kontakt</h4>
          <a href="mailto:jakovljevic.nemanja@outlook.com" className={styles.contactLink}>jakovljevic.nemanja@outlook.com</a>
          <a href="tel:+381604339800" className={styles.contactLink}>+381 60 433 9800</a>
        </div>
      </div>

      <div className={styles['footer-bottom']}>
        Powered by ASISDev © {new Date().getFullYear()} Moj Termin. Sva prava zadržana.
      </div>
    </footer>
  );
};

export default Footer;
