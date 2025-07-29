'use client';
import { useEffect, useState } from 'react';
import styles from '../../login/login.module.css';
import localStyles from './nalozi.module.css';
import panelStyles from '../panel.module.css';
import { toast, ToastContainer } from 'react-toastify';
import useLogout from '@/hooks/useLogout';

export default function NaloziPage() {
    const logout = useLogout();
    const [korisnici, setKorisnici] = useState([]);
    const [preduzeca, setPreduzeca] = useState([]);
    const [vlasnik, setVlasnik] = useState([]);
    const [showDodajKorisnika, setShowDodajKorisnika] = useState(false);
    const [korisnikZaPotvrduBrisanja, setKorisnikZaPotvrduBrisanja] = useState(null);
    const [promeniLozinkuEl, setPromeniLozinkuEl] = useState(false);
    const [korisnikZaNovuSifru, setKorisnikZaNovuSifru] = useState();
    const [newPass, setNewPass] = useState('');
    const [newPassConf, setNewPassConf] = useState('');
    const [izmenjeniKorisnici, setIzmenjeniKorisnici] = useState([]); // niz ID-jeva

    const [loadingIzmeniId, setLoadingIzmeniId] = useState(null);
    const [loadingObrisiId, setLoadingObrisiId] = useState(null);
    const [loadingSpinPass, setLoadingSpinPass] = useState(false);
    const [loadingSpinDodaj, setLoadingSpinDodaj] = useState(false);
 
    const [ime, setIme] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPass, setRegPass] = useState('');
    const [showRegPass, setShowRegPass] = useState(false);
    const [regPassConf, setRegPassConf] = useState('');
    const [showRegPassConf, setShowRegPassConf] = useState(false);
    const [brTel, setBrTel] = useState('+381');
    const [zaposlenU, setZaposlenU] = useState(0);

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
        if(zaposlenU === 0) {
            toast.error('Odabeite lokaciju radnog mesta.');
            return;
        }

        setLoadingSpinDodaj(true);
        try {
            const userId = localStorage.getItem("userId");
            const authToken = localStorage.getItem('authToken');
            const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zaposleni/novi/${userId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ regEmail, regPass, ime, brTel, zaposlenU })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || 'Greška prilikom registracije.');
                return;
            }

            toast.success("Uspešno ste dodali novog korisnika.");
            setShowDodajKorisnika(false);
            fetchData();
            setIme('');setRegEmail('');setRegPass('');setRegPassConf('');setBrTel('+381');setZaposlenU(0)
        } catch (error) {
            console.error(error);
            toast.error('Došlo je do greške. Pokušajte ponovo.');
        } finally {
            setLoadingSpinDodaj(false);
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const fetchData = async () => {
        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        try {
            const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zaposleni/${userId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            const data = await res.json();
            if (!res.ok) {
                if (data && data.code === "ERROR_CODE_UNAUTHORIZED") {
                    logout();
                    return;
                }
                throw new Error("Greška pri dohvatanju podataka.");
            }

            setKorisnici(data.korisnici);
            setPreduzeca(data.preduzeca);
            setVlasnik(data.vlasnik);
        } catch (error) {
            console.error(error);
            toast.error('Došlo je do greške pri učitavanju korisnika.');
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    const izmeniKorisnika = async (korisnik) => {
        setLoadingIzmeniId(korisnik.id);
        try {
            const authToken = localStorage.getItem("authToken");
            const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zaposleni/izmena/${korisnik.id}`, {
                method:'PATCH',
                headers:{
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: korisnik.username,
                    email: korisnik.email,
                    brTel: korisnik.brTel,
                    zaposlen_u: korisnik.zaposlen_u
                })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || 'Greška prilikom izmene.');
                return;
            }
            toast.success("Uspešno ste izmenili korisnika.");
            setIzmenjeniKorisnici(prev => prev.filter(id => id !== korisnik.id));
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingIzmeniId(null);
            setPromena(false);
        }

    }

    const obrisiKorisnika = async (id) => {
        setLoadingObrisiId(id);
        try {
            const authToken = localStorage.getItem('authToken');
            const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zaposleni/${id}`, {
                method:'DELETE',
                headers:{
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            });
            const data = await res.json();
    
            if (!res.ok) {
                toast.error(data.message || 'Greška prilikom brisanja.');
                return;
            }
            toast.success("Uspešno ste obrisali korisnika.");
            fetchData();
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingObrisiId(null);
        }
    }
    useEffect(() => {
        if (korisnikZaPotvrduBrisanja !== null) {
            const timer = setTimeout(() => {
                setKorisnikZaPotvrduBrisanja(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [korisnikZaPotvrduBrisanja]);

    
    const prikaziElZaNovuSifru = (korisnik) => {
        setPromeniLozinkuEl(true);
        setKorisnikZaNovuSifru(korisnik);
    }
    const handlePromenaLozinke = async (e) => {
        e.preventDefault();

        if (newPass.length < 8) {
            toast.error('Lozinka mora da bude duga najmanje 8 karaktera.');
            return;
        }
        if (newPass !== newPassConf) {
            toast.error('Lozinke se ne podudaraju.');
            return;
        }

        setLoadingSpinPass(true);
        try {
            const authToken = localStorage.getItem('authToken');
            const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zaposleni/nova-lozinka/${korisnikZaNovuSifru.id}`, {
                method:'PATCH',
                headers:{
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({newPass})
            });
            const data = await res.json();
    
            if (!res.ok) {
                toast.error(data.message || 'Greška prilikom izmene.');
                return;
            }
            toast.success("Uspešno ste promenili lozinku.");
            setPromeniLozinkuEl(false);
            setNewPass('');
            setNewPassConf('');
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingSpinPass(false);
        }
    }

    return (
        <div style={{ width: '100%' }} className={panelStyles.child}>
            <div className={localStyles.header}>
                <h2>Lista zaposlenih</h2>
                <button className={localStyles.btn} style={{margin:'0'}}
                onClick={() => setShowDodajKorisnika(prev => !prev)}><i className="fa-solid fa-plus"></i>&nbsp;&nbsp;Dodaj zaposlenika</button>
            </div>
            {korisnici.length > 0 ? (
                <div className={localStyles.tableContainer}>
                    <table className={localStyles.table}>
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
                                                    if (!izmenjeniKorisnici.includes(korisnik.id)) {
                                                        setIzmenjeniKorisnici(prev => [...prev, korisnik.id]);
                                                    }
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
                                                    if (!izmenjeniKorisnici.includes(korisnik.id)) {
                                                        setIzmenjeniKorisnici(prev => [...prev, korisnik.id]);
                                                    }
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
                                                    if (!izmenjeniKorisnici.includes(korisnik.id)) {
                                                        setIzmenjeniKorisnici(prev => [...prev, korisnik.id]);
                                                    }
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
                                                    if (!izmenjeniKorisnici.includes(korisnik.id)) {
                                                        setIzmenjeniKorisnici(prev => [...prev, korisnik.id]);
                                                    }
                                                    const updatedKorisnici = [...korisnici];
                                                    updatedKorisnici[index][subIndex].zaposlen_u = parseInt(e.target.value);
                                                    setKorisnici(updatedKorisnici);
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
                                            <button
                                              onClick={() => izmeniKorisnika(korisnik)}
                                              className={localStyles.btn}
                                              style={{
                                                margin: '0',
                                                height: 'auto',
                                                padding: '5px 20px',
                                                color: izmenjeniKorisnici.includes(korisnik.id) ? '#1d4ed8' : '#374151', // plavo ili sivo
                                                backgroundColor: '#f3f4f6'
                                              }}
                                            >
                                              {loadingIzmeniId === korisnik.id ? (
                                                <div style={{maxHeight:'100%',display:'flex',justifyContent:'center',alignItems:'center'}}>
                                                  <div className="spinnerMali" ></div>
                                                </div>
                                              ) : (
                                                <p>Izmeni</p>
                                              )}
                                            </button>
                                            <button onClick={() => prikaziElZaNovuSifru(korisnik)} className={localStyles.btn} style={{margin:'0',height:'auto',padding:'5px 20px'}}>Nova lozinka</button>
                                            <button
                                            onClick={() => {
                                                if (korisnikZaPotvrduBrisanja === korisnik.id) {
                                                  obrisiKorisnika(korisnik.id);
                                                  setKorisnikZaPotvrduBrisanja(null);
                                                } else {
                                                  setKorisnikZaPotvrduBrisanja(korisnik.id);
                                                }
                                            }}
                                            className={localStyles.btn}
                                            style={{ margin: '0', height: 'auto', padding: '5px 20px',  backgroundColor: korisnikZaPotvrduBrisanja === korisnik.id ? 'red' : '',color: korisnikZaPotvrduBrisanja === korisnik.id ? 'white' : 'red', }}
                                            >
                                              {loadingObrisiId === korisnik.id ? (
                                                <div style={{maxHeight:'100%',display:'flex',justifyContent:'center',alignItems:'center'}}>
                                                  <div className="spinnerMali" ></div>
                                                </div>
                                              ) : (
                                                <>
                                                  {korisnikZaPotvrduBrisanja === korisnik.id ? 'Potvrdi' : 'Obriši'}
                                                </>
                                              )}
                                            </button>
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

            
            {promeniLozinkuEl && (
                <div style={{minHeight:'100%',minWidth:'100%'}}>
                    <div className={localStyles.blur}></div>
                    <div className={localStyles.dodajKorisnika} style={{height:'300px'}}>
                        <div className={styles.zatamniLogin}></div>
                        <form onSubmit={handlePromenaLozinke} className={styles.forma}>
                            <h2>Promeni lozinku</h2>
                            <h4 style={{marginBottom:'10px'}}>Korisnik: {korisnikZaNovuSifru.username}</h4>
                            <div className={styles.formGroup}>
                                <input type={showRegPass ? 'text' : 'password'} value={newPass} onChange={(e) => { setNewPass(e.target.value) }}
                                    className={styles.formStyle} placeholder='Lozinka' />
                                <i className={`${styles.inputIcon} uil uil-lock`}></i>
                                <i className={`fa-solid ${showRegPass ? 'fa-eye-slash' : 'fa-eye'} ${styles.oko}`} onClick={() => setShowRegPass(prev => !prev)}></i>
                            </div>
                            <div className={styles.formGroup}>
                                <input type={showRegPassConf ? 'text' : 'password'} value={newPassConf} onChange={(e) => { setNewPassConf(e.target.value) }}
                                    className={styles.formStyle} placeholder='Potvrdite lozinku' />
                                <i className={`${styles.inputIcon} uil uil-lock`}></i>
                                <i className={`fa-solid ${showRegPassConf ? 'fa-eye-slash' : 'fa-eye'} ${styles.oko}`} onClick={() => setShowRegPassConf(prev => !prev)}></i>
                            </div>
                            <button type='submit' className={localStyles.btn}>
                                {loadingSpinPass ? (
                                    <div style={{maxHeight:'100%',display:'flex',justifyContent:'center',alignItems:'center'}}>
                                        <div className="spinnerMali" ></div>
                                    </div>
                                ) : (
                                    <p>
                                        Promeni lozinku
                                    </p>
                                )}
                            </button>
                            <div className={localStyles.x} onClick={() => setPromeniLozinkuEl(false)}>
                                <i className="fa-regular fa-circle-xmark"></i>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDodajKorisnika && (
                <div style={{minHeight:'100%',minWidth:'100%'}}>
                    <div className={localStyles.blur}></div>
                    <div className={localStyles.dodajKorisnika} style={{height:'600px'}}>
                        <div className={styles.zatamniLogin}></div>
                        <form onSubmit={handleDodajKorisnika} className={styles.forma}>
                            <h2>Dodaj korisnika</h2>
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
                            <div className={styles.formGroup}>
                                <select
                                    className={styles.formStyle}
                                    value={zaposlenU}
                                    onChange={(e) => setZaposlenU(parseInt(e.target.value))}
                                >
                                    <option value={0}>Odaberite preduzeće</option>
                                    {preduzeca.map((preduzece) => (
                                        <option key={preduzece.id} value={preduzece.id}>
                                            {preduzece.ime} - {preduzece.adresa}
                                        </option>
                                    ))}
                                </select>
                                <i className={`${styles.inputIcon2} fa-solid fa-building`}></i>
                            </div>
                            <button type='submit' className={localStyles.btn}>
                                    {loadingSpinDodaj ? (
                                        <div style={{maxHeight:'100%',display:'flex',justifyContent:'center',alignItems:'center'}}>
                                        <div className="spinnerMali" ></div>
                                    </div>
                                    ) : (
                                        <p>
                                            Dodaj korisnika
                                        </p>
                                    )}
                            </button>
                            <div className={localStyles.x} onClick={() => setShowDodajKorisnika(false)}>
                                <i className="fa-regular fa-circle-xmark"></i>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}
