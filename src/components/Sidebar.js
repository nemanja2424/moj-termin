'use client';
import Image from "next/image";
import useRedirekt from "@/hooks/useRedirekt";
import styles from './Sidebar.module.css'
import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faChartPie, faBookmark, faUser, faGear, faCreditCard, faHeadset } from '@fortawesome/free-solid-svg-icons';


export default function Sidebar() {
    const redirekt = useRedirekt();
    const [rasirenSidebar, setRasirenSidebar] = useState(true);

    const toggleSidebar = () => {
      setRasirenSidebar(prev => !prev);
    }


  return (
    <div className={`${styles.sidebar} ${rasirenSidebar ? '' : styles.skupljen}`}>
      <a onClick={() => redirekt('/panel')}><Image className={styles.logo} src={"/Images/logo.png"} alt="logo" width={55} height={55} /></a>
      <nav>
        <Link href={'/panel'}>
          <div className={styles.ikona}>
            <FontAwesomeIcon icon={faCalendarDays} />
          </div>
          <p>Termini</p>
        </Link>
        <Link href={'/panel/statistika'}>
          <div className={styles.ikona}>
            <FontAwesomeIcon icon={faChartPie} />
          </div>
          <p>Statistika</p>
        </Link>
        <Link href={'/panel/zakazivanje'}>
          <div className={styles.ikona}>
            <FontAwesomeIcon icon={faBookmark} />
          </div>
          <p>Zakazivanje</p>
        </Link>
        <Link href={'/panel/nalozi'}>
          <div className={styles.ikona}>
            <FontAwesomeIcon icon={faUser} />
          </div>
          <p>Nalozi</p>
        </Link>
        <Link href={'/panel/podesavanja'}>
          <div className={styles.ikona}>
            <FontAwesomeIcon icon={faGear} />
          </div>
          <p>Podešavanja</p>
        </Link>
        <Link href={'/panel/pretplata'}>
          <div className={styles.ikona}>
            <FontAwesomeIcon icon={faCreditCard} />
          </div>
          <p>Pretplata</p>
        </Link>
        <Link href={'/panel/pomoc'}>
          <div className={styles.ikona}>
            <FontAwesomeIcon icon={faHeadset} />
          </div>
          <p>Pomoć</p>
        </Link>




      </nav>

      <i onClick={toggleSidebar} className={`fa-regular fa-square-caret-left ${styles.toggle} ${rasirenSidebar ? '' : styles.skupljen}`}></i>
    </div>
  );
}
