'use client';
import { useEffect, useState } from 'react';
import styles from '../../login/login.module.css';
import localStyles from './nalozi.module.css';
import panelStyles from '../panel.module.css';
import { toast } from 'react-toastify';

export default function NaloziPage() {
    const [korisnici, setKorisnici] = useState([]);
    const [preduzeca, setPreduzeca] = useState([]);
    const [showDodajKorisnika, setShowDodajKorisnika] = useState(false);
    const [showPassword, setShowPassword] = useState(false)
    const [novaLozinka, setNovaLozinka] = useState('');

    const [ime, setIme] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPass, setRegPass] = useState('');
    const [showRegPass, setShowRegPass] = useState(false);
    const [regPassConf, setRegPassConf] = useState('');
    const [showRegPassConf, setShowRegPassConf] = useState(false);
    const [brTel, setBrTel] = useState('+381');

    const handleDodajKorisnika = async (e) => {
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

        try {
            const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ regEmail, regPass, ime, brTel })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || 'Greška prilikom registracije.');
                return;
            }

            localStorage.setItem('authToken', data.authToken);
            localStorage.setItem('userId', data.id);
            localStorage.setItem('rola', 1);
            window.location.href = '/panel/pomoc';  
        } catch (error) {
            console.error(error);
            toast.error('Došlo je do greške. Pokušajte ponovo.');
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem("userId");
            const authToken = localStorage.getItem("authToken");

            try {
                const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zaposleni/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                if (!res.ok) {
                    throw new Error("Greška pri dohvatanju podataka.");
                }

                const data = await res.json();
                setKorisnici(data.korisnici);
                setPreduzeca(data.preduzeca);
                console.log(JSON.stringify(data.preduzeca));
            } catch (error) {
                console.error(error);
                toast.error('Došlo je do greške pri učitavanju korisnika.');
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ width: '100%' }}>
            <h2>Lista zaposlenih</h2>
            {korisnici.length > 0 ? (
                <div className={panelStyles.tableContainer}>
                    <table className={panelStyles.table}>
                        <thead>
                            <tr>
                                <th>Ime</th>
                                <th>Email</th>
                                <th>Telefon</th>
                                <th>Preduzece</th>
                                <th>Opcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {korisnici.map((korisnikArray, index) => (
                                korisnikArray.map((korisnik, subIndex) => (
                                    <tr key={`${index}-${subIndex}`}>
                                        <td>
                                            <input 
                                                onChange={(e) => {
                                                    const updatedKorisnici = [...korisnici];
                                                    updatedKorisnici[index][subIndex].username = e.target.value;
                                                    setKorisnici(updatedKorisnici);
                                                }} 
                                                type="text" 
                                                value={korisnik.username} 
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                onChange={(e) => {
                                                    const updatedKorisnici = [...korisnici];
                                                    updatedKorisnici[index][subIndex].email = e.target.value;
                                                    setKorisnici(updatedKorisnici);
                                                }} 
                                                type="email" 
                                                value={korisnik.email} 
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                onChange={(e) => {
                                                    const updatedKorisnici = [...korisnici];
                                                    updatedKorisnici[index][subIndex].brTel = e.target.value;
                                                    setKorisnici(updatedKorisnici);
                                                }} 
                                                type="text" 
                                                value={korisnik.brTel} 
                                            />
                                        </td>
                                        <td style={{maxWidth:'350px'}}>
                                           <select 
                                                value={korisnik.zaposlen_u} 
                                                onChange={(e) => {
                                                    const updatedKorisnici = [...korisnici];
                                                    updatedKorisnici[index][subIndex].zaposlen_u = parseInt(e.target.value);
                                                    setKorisnici(updatedKorisnici);
                                                    console.log(korisnici)
                                                }}
                                            >
                                                {preduzeca.map((preduzece, index) => (
                                                    <option key={index} value={preduzece.id}>
                                                        {preduzece.ime} - {preduzece.adresa}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{maxWidth:'500px',gap:'10px',display:'flex'}}>
                                            <button className={styles.btn} style={{margin:'0',height:'auto',padding:'5px 20px'}}>Izmeni</button>
                                            <button className={styles.btn} style={{margin:'0',height:'auto',padding:'5px 20px'}}>Nova lozinka</button>
                                            <button className={styles.btn} style={{margin:'0',height:'auto',padding:'5px 20px',color:'red'}}>Obiši</button>
                                        </td>
                                    </tr>
                                ))
                            ))}

                        </tbody>
                    </table>
                </div>
            ) : (
                <p>Nema korisnika</p>
            )}

            {showDodajKorisnika && (
                <div className={localStyles.dodajKorisnika}>
                    <h2>Dodaj korisnika</h2>
                    <form onSubmit={handleDodajKorisnika} className={styles.forma}>
                        <div className={styles.formGroup}>
                            <input type='text' value={ime} onChange={(e) => { setIme(e.target.value) }}
                                className={styles.formStyle} placeholder='Ime i prezime' />
                            <i className={`${styles.inputIcon} uil uil-user`}></i>
                        </div>
                        <div className={styles.formGroup}>
                            <input type='email' value={regEmail} onChange={(e) => { setRegEmail(e.target.value) }}
                                className={styles.formStyle} placeholder='Email' />
                            <i className={`${styles.inputIcon} uil uil-at`}></i>
                        </div>
                        <div className={styles.formGroup}>
                            <input type={showRegPass ? 'text' : 'password'} value={regPass} onChange={(e) => { setRegPass(e.target.value) }}
                                className={styles.formStyle} placeholder='Lozinka' />
                            <i className={`${styles.inputIcon} uil uil-lock`}></i>
                            <i className={`fa-solid ${showRegPass ? 'fa-eye-slash' : 'fa-eye'} ${styles.oko}`} onClick={() => setShowRegPass(prev => !prev)}></i>
                        </div>
                        <div className={styles.formGroup}>
                            <input type={showRegPassConf ? 'text' : 'password'} value={regPassConf} onChange={(e) => { setRegPassConf(e.target.value) }}
                                className={styles.formStyle} placeholder='Potvrdite lozinku' />
                            <i className={`${styles.inputIcon} uil uil-lock`}></i>
                            <i className={`fa-solid ${showRegPassConf ? 'fa-eye-slash' : 'fa-eye'} ${styles.oko}`} onClick={() => setShowRegPassConf(prev => !prev)}></i>
                        </div>
                        <div className={styles.formGroup}>
                            <input value={brTel} onChange={(e) => setBrTel(e.target.value)}
                                type='text' className={styles.formStyle} placeholder='Broj telefona' />
                            <i className={`${styles.inputIcon} uil uil-phone`}></i>
                        </div>
                        <button type='submit' className={styles.btn}>Dodaj korisnika</button>
                    </form>
                </div>
            )}
        </div>
    );
}
