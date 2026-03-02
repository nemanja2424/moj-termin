'use client';
import React, { useEffect, useState } from 'react';
import styles from './Minimal.module.css';
import { toast, ToastContainer } from 'react-toastify';

export default function MinimalDesign({
  forma, setForma,
  preduzece, setPreduzece,
  formData, setFormData,
  id, token, handleSubmit
}) {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
   <div>
      <header className={styles.header}>
        <div className={styles.brandFirme}>
          {forma.logoFirme === true && 
            <img className={styles.logo} src={preduzece.putanja_za_logo} />
          }
          {forma.nazivFirme === true && (
            <h1>{preduzece.ime_preduzeca}</h1>
          )}
        </div>
        {/*<div className={styles.menuIcon} onClick={toggleMenu}>☰</div>*/}
        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
          {Array.isArray(forma?.link) && forma.link.map((link, index) => (
            <a key={index} href={link.url}>{link.text}</a>
          ))}
        </nav>
      </header>
   </div>
  );
}
