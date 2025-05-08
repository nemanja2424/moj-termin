'use client';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';
import useRedirekt from '@/hooks/useRedirekt';
import Image from 'next/image';
import Button1 from './Button1';

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
      <a href={"/"}><Image src="/Images/logo.png" alt="logo" width={70} height={70} /></a>
      <nav className={styles.nav}>
          <a onClick={() => {redirekt('/#about')}}>Zašto mi</a>
          <a onClick={() => {redirekt('/#paketi')}}>Paketi</a>
          <a onClick={() => {redirekt('/panel')}}>Korisnički panel</a>
          {ulogovan && (<a onClick={() => {localStorage.removeItem('authToken');setUlogovan(false);localStorage.removeItem('userId');}}>Odjavi se</a>)}
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
          <a onClick={() => {redirekt('/#about')}}>Zašto mi</a>
          <a onClick={() => {redirekt('/#paketi')}}>Paketi</a>
          <a onClick={() => {redirekt('/panel')}}>Korisnički panel</a>
          {ulogovan && (<a onClick={() => {localStorage.removeItem('authToken');setUlogovan(false);localStorage.removeItem('userId');}}>Odjavi se</a>)}
        <button className={`${styles.button1} ${styles.forPh}`}>Kontaktirajte nas</button>
      </div>
    </header>
  );
}
