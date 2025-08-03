import styles from './footer.module.css';
import Image from 'next/image';
import useRedirekt from '@/hooks/useRedirekt';

const Footer = () => {
  const redirekt = useRedirekt();
  return (
    <footer id='footer' className={styles.footer}>
      <div className={styles['footer-container']}>
        <div className={styles['footer-section']}>
          <a href="/" className={styles.noAnim}>
            <div className={styles.logo} style={{display:'flex',alignItems:'center',marginBottom:'20px'}}>
            <Image src={'/Images/logo.webp'} alt='logo' width={45} height={45} />
              <h3>Moj Termin</h3>
            </div>
          </a>
          <p>Jednostavno digitalno zakazivanje termina – za svaki biznis.</p>
        </div>

        <div className={styles['footer-section']}>
          <h4>Navigacija</h4>
          <ul>
            <li><a onClick={() => {redirekt('/panel')}}>Korisnički panel</a></li>
            <li><a onClick={() => {redirekt('/usluge')}}>Usluge</a></li>
            <li><a onClick={() => {redirekt('/login')}}>Probaj besplatno</a></li>
            <li><a href="/pomoc">Pomoć</a></li>
          </ul>
        </div>

        <div className={styles['footer-section']}>
          <h4>Kontakt</h4>
          <a href="mailto:info@mojtermin.site" className={styles.contacta}>info@mojtermin.site</a>
          <a href="mailto:jakovljevic.nemanja@outlook.com" className={styles.contacta}>jakovljevic.nemanja@outlook.com</a>
          <a href="tel:+381604339800" className={styles.contacta}>+381 60 433 9800</a>
        </div>
      </div>

      <div className={styles['footer-bottom']}>
        Powered by ASISDev © {new Date().getFullYear()} Moj Termin. Sva prava zadržana.
      </div>
    </footer>
  );
};

export default Footer;
