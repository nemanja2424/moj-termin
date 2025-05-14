'use client';
import React, { useState } from 'react';
import styles from './pomoc.module.css';
import stylesPanel from '../panel.module.css';

export default function PomocPage() {
  const [prviKoraci, setPrviKoraci] = useState(false);


  return (
    <div className={styles.PomocPage}>
      <div className={styles.header}>
        <div><a>Prvi koraci</a></div>
        <div><a>Pravljenje strane za zakazivanje</a></div>
        <div><a>Promena i otkazivanje paketa</a></div>
        <div><a>Obaveštenja</a></div>
      </div>
      <section onClick={() => setPrviKoraci(!prviKoraci)} className={`${styles.section} ${prviKoraci ? styles.open : ''}`}>
        <div className={styles.naslov}>
          <h1>Prvi koraci</h1>
          <i className='fa fa-angle-down'></i>
        </div>

        <div className={styles.content}>
          <p>Otkrijte kako da započnete sa korišćenjem aplikacije, uključujući registraciju i prijavu.</p>
        </div>
      </section>

    </div>
  );
}