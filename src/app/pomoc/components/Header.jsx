'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import useRedirekt from '@/hooks/useRedirekt';
import Image from 'next/image';
import Button1 from '@/components/Button1';

export default function Header() {
  const redirekt = useRedirekt();
  const [navOpen, setNavOpen] = useState(false);
  const [ulogovan, setUlogovan] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {setUlogovan(true)}
  })
  const toggleNav = () => {
    setNavOpen(!navOpen);
  };



  return (
    <header className={`${styles.header} ${navOpen ? styles.open : ''}`}>
      <div className={styles.topRow}>
      <a href={"/"}><Image src="/Images/logo.webp" alt="logo" width={70} height={70} /></a>
        <nav className={styles.nav}>
          <Link href='/pomoc/prvi-koraci'>Prvi koraci</Link>
          <Link href='/pomoc/upravljanje-podacima'>Upravljanje podacima</Link>
          <Link href='/pomoc/zakazivanje'>Zakazivanje</Link>
          <Link href='/pomoc/obavestenja'>Obaveštenja</Link>
          <Link href='/pomoc/pretplata'>Pretplata</Link>
        </nav>
        <a className={`${styles.button1} ${styles.forPC}`} onClick={() => redirekt('/panel')}>Korisnicki panel</a>
        <div
          className={`${styles.navIcon3} ${styles.forPh} ${navOpen ? styles.open : ''}`}
          onClick={toggleNav}
        >
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className={`${styles.phoneNav} ${navOpen ? styles.open : ''}`}>
        <Link href='/pomoc/prvi-koraci'>Prvi koraci</Link>
        <Link href='/pomoc/upravljanje-podacima'>Upravljanje podacima</Link>
        <Link href='/pomoc/zakazivanje'>Zakazivanje</Link>
        <Link href='/pomoc/obavestenja'>Obaveštenja</Link>
        <Link href='/pomoc/pretplata'>Pretplata</Link>
        <a className={` ${styles.forPh}`} onClick={() => redirekt('/panel')}>Korisnicki panel</a>
      </div>
    </header>
  );
}
