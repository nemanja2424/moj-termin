'use client';
import { useState } from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
import Image from 'next/image';
import Button1 from './Button1';

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  return (
    <header className={`${styles.header} ${navOpen ? styles.open : ''}`}>
      <div className={styles.topRow}>
      <Link href={"/"}><Image src="/images/logo.png" alt="logo" width={70} height={70} /></Link>
      <nav className={styles.nav}>
          <a href="/#about">Zašto mi</a>
          <a href="/#paketi">Paketi</a>
          <Link href="/panel">Korisnički panel</Link>
        </nav>
        <a href='#footer' className={`${styles.button1} ${styles.forPC}`}>Kontaktirajte nas</a>
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
        <a href="">Zašto mi</a>
        <a href="">Paketi</a>
        <Link href="">Demo</Link>
        <button className={`${styles.button1} ${styles.forPh}`}>Kontaktirajte nas</button>
      </div>
    </header>
  );
}
