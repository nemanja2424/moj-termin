"use client";
import React, { useEffect, useState } from 'react';
import styles from './login.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAt } from '@fortawesome/free-solid-svg-icons';

const LoginPage = () => {
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      window.location.href = "/";
    }
  }, []);

  const [Login, setLogin] = useState(false)
  const toggleLogin = () => setLogin(false);
  const toggleReg = () => setLogin(true);
  const toggle = () => setLogin(prev => !prev);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Login form submitted");
  }
  

  return (
    <div className={styles.fullHeight}>
      <Header />

    <div className={styles.fs}>
      <div className=''>
        <h6 className="mb-0 pb-3 h6" style={{marginLeft:'7%'}}>
          <span id="prijavaOkret" onClick={toggleLogin}>
            Prijava
          </span>
          <span id="registracijaOkret" onClick={toggleReg}>
            Registracija
          </span>
        </h6>
        <input
          type="checkbox"
          checked={Login}
          onChange={toggle}
          id="reg-log"
          name="reg-log"
          className={styles.checkbox}
        />
        <label htmlFor="reg-log"></label>
      </div>
      <div className={styles.wrapper}>
        <div className={`${styles.innerWrapper} ${Login ? styles.rotateWrapper : ""}`}>
          <div className={styles.cardFront}>
            <div className={styles.zatamniLogin}></div>
            <h2>Prijava</h2>
          </div>

          <div className={styles.cardBack}>
            <div className={styles.zatamniLogin}></div>
            <h2>Registracija</h2>
          </div>
        </div>
      </div>

    </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
