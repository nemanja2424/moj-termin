"use client";
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './login.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const LoginPage = () => {
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      window.location.href = "/";
    }
  }, []);

  const [Login, setLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const toggleLogin = () => setLogin(false);
  const toggleReg = () => setLogin(true);
  const toggle = () => setLogin(prev => !prev);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);



  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error('Unesite ispravan email.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        if (data.message === 'Invalid Email.') {
          setEmailError(true);
          toast.error("Neispravna email adresa.");
        } 
        else if (data.message === 'Invalid Password.') {
          setPassError(true);
          toast.error("Neispravna lozinka.");
        } 
        else {
          setEmailError(false);
        }
        throw new Error(data.message);
      }
  
      localStorage.setItem('authToken', data.authToken);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('rola', data.rola);
      window.location.href = '/panel';
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false)
    }
  };
  
  
  const [ime, setIme] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regPassConf, setRegPassConf] = useState('');
  const [showRegPassConf, setShowRegPassConf] =useState(false);
  const [brTel, setBrTel] = useState('+381');

  const handleRegSubmit = async (e) => {
    e.preventDefault();
  
    if (ime.length < 1) {
      toast.error('Unesite ime.');
      return;
    }
    if (!isValidEmail(regEmail)) {
      toast.error('Unesite ispravan email.');
      return;
    }
  
    if (regPass.length < 8) {
      toast.error('Lozinka mora da bude duga najmanje 8 karaktera.');
      return;
    }
  
    if (regPass !== regPassConf) {
      toast.error('Lozinke se ne podudaraju.');
      return;
    }
    if (brTel.length < 5 || !/^\+?\d+$/.test(brTel) || (brTel.startsWith('+') && (brTel.match(/\+/g) || []).length > 1)) {
      toast.error('Unesite validan broj telefona (dozvoljen samo jedan + na početku, ostatak brojevi).');
      return;
    }
    
    const forma = {
      "izgled": "default",
      "ime": true,
      "prezime": false,
      "email": true,
      "telefon": true,
      "datum": true,
      "vreme": true,
      "trajanje": false,
      "lokacija": true,
      "opis": false,
      "nazivFirme": true,
      "logoFirme": true,
      "customPolja": [],
      "link": []
    }

    setLoading(true)
  
    try {
      const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ regEmail, regPass, ime, brTel, forma })
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.error(data.message || 'Greška prilikom registracije.');
        return;
      }
  
      localStorage.setItem('authToken', data.authToken);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('rola', 1);
      window.location.href = '/panel';  
    } catch (error) {
      console.error(error);
      toast.error('Došlo je do greške. Pokušajte ponovo.');
    } finally { setLoading(false) }
  };
  const isValidEmail = (email) => {
    // Prosta regex provera formata email adrese
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  

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
              {/*<Image src={'/Images/login2.jpg'} alt={'cover'} width={1200} height={800} className={styles.loginBg}/>*/}
              <div className={styles.zatamniLogin}></div>
              <h2>Prijava</h2>
              <form onSubmit={handleLoginSubmit} className={styles.forma}>
                <div className={styles.formGroup}>
                  <input value={email} onChange={(e) => {setEmail(e.target.value);setEmailError(false);}}
                  type='email' className={`${styles.formStyle} ${emailError ? styles.errorInput : ''}`} placeholder='Email'/>
                  <i className={`${styles.inputIcon} uil uil-at`}></i>
                </div>
                <div className={styles.formGroup}>
                  <input value={password} onChange={(e) => {setPassword(e.target.value);setPassError(false);}}
                  type={showPassword ? 'text' : 'password'} className={`${styles.formStyle} ${passError ? styles.errorInput : ''}`} placeholder='Lozinka'/>
                  <i className={`${styles.inputIcon} uil uil-lock`}></i>
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} ${styles.oko}`} onClick={() => setShowPassword(prev => !prev)}></i>
                </div>
                <button type='submit' className={styles.btn} disabled={loading}>
                  {loading ? <span className="spinner"></span> : 'Prijavi se'}
                </button>
              </form>
            </div>

            <div className={styles.cardBack}>
              {/*<Image src={'/Images/login2.jpg'} alt={'cover'} width={1200} height={800} className={styles.loginBg}/>*/}
              <div className={styles.zatamniLogin}></div>
              <h2>Registracija</h2>
              <form onSubmit={handleRegSubmit} className={styles.forma}>
                <div className={styles.formGroup}>
                  <input type='text' value={ime} onChange={(e) => {setIme(e.target.value)}}
                    className={styles.formStyle} placeholder='Ime i prezime'/>
                  <i className={`${styles.inputIcon} uil uil-user`}></i>
                </div>
                <div className={styles.formGroup}>
                  <input type='email' value={regEmail} onChange={(e) => {setRegEmail(e.target.value)}}
                   className={styles.formStyle} placeholder='Email'/>
                  <i className={`${styles.inputIcon} uil uil-at`}></i>
                </div>
                <div className={styles.formGroup}>
                  <input type={showRegPass ? 'text' : 'password'} value={regPass} onChange={(e) => {setRegPass(e.target.value)}}
                   className={styles.formStyle} placeholder='Lozinka'/>
                  <i className={`${styles.inputIcon} uil uil-lock`}></i>
                  <i className={`fa-solid ${showRegPass ? 'fa-eye-slash' : 'fa-eye'} ${styles.oko}`} onClick={() => setShowRegPass(prev => !prev)}></i>
                </div>
                <div className={styles.formGroup}>
                  <input type={showRegPassConf ? 'text' : 'password'} value={regPassConf} onChange={(e) => {setRegPassConf(e.target.value)}}
                   className={styles.formStyle} placeholder='Potvrdite lozinku'/>
                  <i className={`${styles.inputIcon} uil uil-lock`}></i>
                  <i className={`fa-solid ${showRegPassConf ? 'fa-eye-slash' : 'fa-eye'} ${styles.oko}`} onClick={() => setShowRegPassConf(prev => !prev)}></i>
                </div>
                <div className={styles.formGroup}>
                  <input value={brTel} onChange={(e) => setBrTel(e.target.value)}
                  type='text' className={styles.formStyle} placeholder='Broj telefona'/>
                  <i className={`${styles.inputIcon} uil uil-phone`}></i>
                </div>
                <button type='submit' className={styles.btn}>
                  {loading ? <span className="spinner"></span> : 'Registruj se'}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>

      <ToastContainer/>

      <Footer />
    </div>
  );
};

export default LoginPage;