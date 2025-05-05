'use client';
import { useState } from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  return (
    <header className={`${styles.header} ${navOpen ? styles.open : ''}`}>
      <div className={styles.topRow}>
      <Image src="/Images/logo.png" alt="logo" width={45} height={45} />
      <nav className={styles.nav}>
          <a href="">Zašto mi</a>
          <a href="">Paketi</a>
          <Link href="">Demo</Link>
        </nav>
        <button className={`${styles.button1} ${styles.forPC}`}>Kontaktirajte nas</button>
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
