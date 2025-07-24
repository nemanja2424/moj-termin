'use client';
import Image from "next/image";
import useRedirekt from "@/hooks/useRedirekt";
import styles from './Sidebar.module.css';
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faChartPie, faBookmark, faUser, faGear, faCreditCard, faHeadset, faRightFromBracket, faChalkboard } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from "react";

export default function Sidebar({ rasirenSidebar, setRasirenSidebar }) {
  const redirekt = useRedirekt();
  const [vlasnik, setVlasnik] = useState(false);
  const toggleRef = useRef(null);

  const toggleSidebar = () => {
    setRasirenSidebar(prev => !prev);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('rola') === '1') {
        setVlasnik(true);
      }
    }
  }, []);

  useEffect(() => {
    const adjustBottom = () => {
      if (!toggleRef.current) return;
      // total viewport height including browser UI
      const totalH = window.innerHeight;
      // visible height when UI is hidden/shown
      const visH = window.visualViewport?.height ?? window.innerHeight;
      // ako je razlika > 0, to je visina browser UI
      const uiHeight = totalH - visH;
      // ako UI jeste vidljiv (uiHeight > 0), smanji bottom za 20px
      // ako nije, vrati na 0px
      toggleRef.current.style.bottom = uiHeight > 0
        ? `calc(20px + ${uiHeight}px)`
        : `0px`;
    };

    adjustBottom();
    window.visualViewport?.addEventListener('resize', adjustBottom);
    window.addEventListener('resize', adjustBottom);
    return () => {
      window.visualViewport?.removeEventListener('resize', adjustBottom);
      window.removeEventListener('resize', adjustBottom);
    };
  }, []);


  return (
    <div className={`${styles.sidebar} ${rasirenSidebar ? '' : styles.skupljen}`}>
      <a onClick={() => redirekt('/panel')}>
        <Image className={styles.logo} src={"/Images/logo.webp"} alt="logo" width={55} height={55} />
      </a>
      <nav>
        <Link href={'/panel'}>
          <div className={styles.ikona}><FontAwesomeIcon icon={faChalkboard} /></div>
          <p>Panel</p>
        </Link>
        <Link href={'/panel/termini'}>
          <div className={styles.ikona}><FontAwesomeIcon icon={faCalendarDays} /></div>
          <p>Termini</p>
        </Link>
        <Link href={'/panel/statistika'}>
          <div className={styles.ikona}><FontAwesomeIcon icon={faChartPie} /></div>
          <p>Statistika</p>
        </Link>
        {vlasnik && (
          <>
            <span className={styles.brend}>
              <Link href={'/panel/brend'} >
                <div className={styles.ikona}><FontAwesomeIcon icon={faBookmark} /></div>
                <p>Brend</p>
              </Link>
            
            </span>
            <Link href={'/panel/nalozi'}>
              <div className={styles.ikona}><FontAwesomeIcon icon={faUser} /></div>
              <p>Zaposleni</p>
            </Link>
            <Link href={'/panel/podesavanja'}>
              <div className={styles.ikona}><FontAwesomeIcon icon={faGear} /></div>
              <p>Podešavanja</p>
            </Link>
            {/*<Link href={'/panel/pretplata'}>
              <div className={styles.ikona}><FontAwesomeIcon icon={faCreditCard} /></div>
              <p>Pretplata</p>
            </Link>*/}
        

          </>
        )}
        <Link href={'/pomoc'} target="_blank">
          <div className={styles.ikona}><FontAwesomeIcon icon={faHeadset} /></div>
          <p>Pomoć</p>
        </Link>
        <Link href={'/'} onClick={()=>{localStorage.removeItem('authToken');localStorage.removeItem('userId');}}>
          <div className={styles.ikona}><FontAwesomeIcon icon={faRightFromBracket} /></div>
          <p>Odjava</p>
        </Link>
      </nav>
      <i 
        onClick={toggleSidebar} 
        ref={toggleRef} 
        className={`fa-regular fa-square-caret-left ${styles.toggle} ${rasirenSidebar ? '' : styles.skupljen}`}
      ></i>
    </div>
  );
}
