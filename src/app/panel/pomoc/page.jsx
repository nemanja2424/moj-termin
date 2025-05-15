'use client';
import React, { useRef, useState } from 'react';
import styles from './pomoc.module.css';

export default function PomocPage() {
  const containerRef = useRef();

  const scrollToSection = (index) => {
    const section = containerRef.current.children[index];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  const [openNav, setOpenNav] = useState(false)

  return (
    <div className={styles.PomocPage}>
      {/* Navigacija po sekcijama */}
      <div className={`${styles.navbar} ${openNav ? (styles.open) : ''}`}>
        <div className={styles.zatamni}></div>
        <a onClick={() => scrollToSection(0)}>Prvi koraci</a>
        <a onClick={() => scrollToSection(1)}>Zakazivanje</a>
        <a onClick={() => scrollToSection(2)}>Upravljanje podacima</a>
        <a onClick={() => scrollToSection(3)}>Pretplata</a>
        <a onClick={() => scrollToSection(4)}>Obaveštenja</a>
        <i className='fa fa-angle-down' style={{fontSize:'27px',zIndex:'5',color:'white',cursor:'pointer'}}></i>
      </div>

      {/* Horizontalni scroll kontejner */}
      <div className={styles.sectionsContainer} ref={containerRef}>
        <section className={styles.section}><h1>Prvi koraci</h1><p>Uputstvo za početak.</p></section>
        <section className={styles.section}><h1>Zakazivanje</h1><p>Kako zakazati termine.</p></section>
        <section className={styles.section}><h1>Upravljanje podacima</h1><p>Vaši lični podaci.</p></section>
        <section className={styles.section}><h1>Pretplata</h1><p>Detalji o planovima.</p></section>
        <section className={styles.section}><h1>Obaveštenja</h1><p>Notifikacije i podešavanja.</p></section>
      </div>
    </div>
  );
}
