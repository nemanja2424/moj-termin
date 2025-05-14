'use client';

import { useEffect, useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import styles from './podesavanja.module.css';
import stylesLogin from '@/app/login/login.module.css';
import { QRCodeSVG } from 'qrcode.react';
import { faL } from '@fortawesome/free-solid-svg-icons';

export default function PodesavanjaPage() {
    const [korisnik, setKorisnik] = useState({});
    const [preduzeca, setPreduzeca] = useState([]);
    const [link, setLink] = useState('');
    const qrRef = useRef(null);
    const [brRadnika, setBrRadnika] = useState(0);

    /*promene vrednosti */
    const [editingUsername, setEditingUsername] = useState(false);
    const [editingEmail, setEditingEmail] = useState(false);
    const [editingBrTel, setEditingBrtel] = useState(false);
    const [showChangePass, setShowChangePass] = useState(false);
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [newPassConf, setNewPassConf] = useState('');
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showRegPass, setShowRegPass] = useState(false);
    const [showRegPassConf, setShowRegPassConf] = useState(false);
    const [editingPrIme, setEditingPrIme] = useState(false);
    const [showDodajLokaciju, setShowDodajLokaciju] = useState(false);
    const [imeLokacije, setImeLokacije] = useState('');
    const [adresa, setAdresa] = useState('');
    const [editFirmaId, setEditFirmaId] = useState(null);
    const [editedFirmData, setEditedFirmData] = useState({});



    const handleEditUsernameClick = () => {
        setEditingUsername(true);
    };
    const handleEditEmailClick = () => {
        setEditingEmail(true);
    };
    const handlePrIme = () => {
        setEditingPrIme(true);
    }
    const handleEditBrTelClick = () => {
        setEditingBrtel(true);
    };
    const handleImeEmailTel = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/podesavanja/user/${userId}`, {
            method: 'PATCH',
            headers:{
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(korisnik)
        });
        const data = await res.json();

        if (!res.ok) {
            toast.error(data.message || 'Greška prilikom registracije.');
            return;
        }
        toast.success("Uspešno ste promenili podatke.");
        setEditingEmail(false);
        setEditingUsername(false);
        setEditingBrtel(false);
        setEditingPrIme(false);
    }
    const handlePromenaLozinke = async (e) => {
        e.preventDefault();
        if(currentPass < 8) {
            toast.error('Niste unelli tačnu trenutnu lozinku.');
            return;
        }
        if(newPass.length < 8) {
            toast.error('Lozinka mora da bude duža od 8 karaktera.');
            return;
        }
        if (newPass !== newPassConf){
            toast.error('Lozinke se ne poklapaju.');
            return;
        }
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/podesavanja/nova-lozinka/${userId}`, {
            method: 'POST',
            headers:{
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({currentPass, newPass})
        });
        const data = await res.json();
        if (!res.ok) {
            if (data.message === 'Invalid Credentials.'){
                toast.error('Niste unelli tačnu trenutnu lozinku.');
                return;
            }
            else {
                toast.error(data.message || 'Greška prilikom registracije.');
                return;
            }
        }
        toast.success("Uspešno ste promenili podatke.");
        setShowChangePass(false);
    }
    const handleDodajLokaciju = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/podesavanja/dodaj-lokaciju/${userId}`, {
            method:'POST',
            headers:{
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({imeLokacije, adresa})
        });
        const data = await res.json();

        if (!res.ok){
            toast.error(data.message || 'Greška prilikom registracije.');
            return;
        }
        fetchData();
        toast.success('Uspešno ste dodali lokaciju.');
        setShowDodajLokaciju(false);
        setImeLokacije('');
        setAdresa('');
    }
    const handleConfirmEdit = async (firmaId) => {
        const authToken = localStorage.getItem('authToken');
        const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/podesavanja/izmeni-lokaciju/${firmaId}`, {
        method:'PATCH',
        headers:{
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedFirmData)
    });

    const data = await res.json();

    if (!res.ok) {
        toast.error(data.message);
        return;
    }
    setPreduzeca(data);
    toast.success("Uspešno izmenili podatke lokacije.")
    setEditFirmaId(null);
    setEditedFirmData({});
};


    
    

    const formatirajDatum = (datum) => {
        if (!datum) {
            return "Nepoznat datum";
        }
        const parts = datum.split("-");
        if (parts.length !== 3) {
            return "Nepoznat datum";
        }
    
        const [godina, mesec, dan] = parts;
        return `${dan}.${mesec}.${godina}`;
    };
    const danaDoDatuma = (datum) => {
        const danas = new Date();
        const ciljniDatum = new Date(datum);
    
        if (ciljniDatum < danas) {
            return "Paket vam je istekao.";
        }
    
        let godine = ciljniDatum.getFullYear() - danas.getFullYear();
        let meseci = ciljniDatum.getMonth() - danas.getMonth();
        let dani = ciljniDatum.getDate() - danas.getDate();
    
        if (dani < 0) {
            meseci -= 1;
            const prethodniMesec = new Date(ciljniDatum.getFullYear(), ciljniDatum.getMonth(), 0);
            dani += prethodniMesec.getDate();
        }
    
        if (meseci < 0) {
            godine -= 1;
            meseci += 12;
        }
    
        const delovi = [];
        if (godine > 0) delovi.push(`${godine} ${godine === 1 ? "godina" : "godine"}`);
        if (meseci > 0) delovi.push(`${meseci} ${meseci === 1 ? "mesec" : "meseca"}`);
        if (dani > 0) delovi.push(`${dani} ${dani === 1 ? "dan" : "dana"}`);
    
        return delovi.join(", ");
    };
    
    const preuzmiQRCode = () => {
        const svg = qrRef.current;
        if (!svg) return;

        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svg);

        const blob = new Blob([svgStr], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "qrcode.svg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    
    

    const fetchData = async () => {
        const authToken = localStorage.getItem('authToken');
        const res = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/auth/me', {
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json();
        if (!res.ok) {
            toast.error(data.message || 'Greška prilikom preuzimanja podataka.');
            return;
        }

        setKorisnik(data.korisnik);
        setPreduzeca(data.preduzeca);
        const ukupno = data.preduzeca.reduce((suma, firma) => {
            return suma + (firma.zaposleni?.length || 0);
        }, 0);
        setBrRadnika(ukupno);
    }
    

    useEffect(() => {
        fetchData();
        setLink(`https://arbitrawin.com/dashboard.html`);
    }, []);

  return (
    <div className={styles.content}>
        <div className={styles.section}>
            <h2>Moj profil</h2>
            <div className={styles.stavka}>
                <div>
                    <span>Ime:</span>
                    {editingUsername ? (
                        <input 
                            value={korisnik.username} 
                            onChange={(e) => setKorisnik({ ...korisnik, username: e.target.value })} 
                        />
                    ) : (
                        <h4>{korisnik.username}</h4>
                    )}
                </div>
                <button 
                    onClick={editingUsername ? handleImeEmailTel : handleEditUsernameClick} 
                    className={styles.btn}
                >
                    {editingUsername ? 'Potvrdi' : 'Izmeni'}
                </button>
            </div>
            <div className={styles.stavka}>
                <div>
                    <span>Email:</span>
                    {editingEmail ? (
                        <input 
                            value={korisnik.email} 
                            onChange={(e) => setKorisnik({ ...korisnik, email: e.target.value })} 
                        />
                    ) : (
                        <h4>{korisnik.email}</h4>
                    )}
                </div>
                <button 
                    onClick={editingEmail ? handleImeEmailTel : handleEditEmailClick} 
                    className={styles.btn}
                >
                    {editingEmail ? 'Potvrdi' : 'Izmeni'}
                </button>
            </div>
            <div className={styles.stavka}>
                <div>
                    <span>Broj telefona:</span>
                    {editingBrTel ? (
                        <input 
                            value={korisnik.brTel} 
                            onChange={(e) => setKorisnik({ ...korisnik, brTel: e.target.value })} 
                        />
                    ) : (
                        <h4>{korisnik.brTel}</h4>
                    )}
                </div>
                <button 
                    onClick={editingBrTel ? handleImeEmailTel : handleEditBrTelClick} 
                    className={styles.btn}
                >
                    {editingBrTel ? 'Potvrdi' : 'Izmeni'}
                </button>
            </div>
            <div className={styles.stavka}>
                <div>
                    <h4>Promena lozinke</h4>
                    <span style={{fontSize:'14px'}}>Lozinka je zaštićena i ne može se prikazati.</span>
                </div>
                <button onClick={() => setShowChangePass(true)} className={styles.btn}>Izmeni</button>
            </div>
            <div className={styles.stavka}>
                <div>
                    <span>Odabran paket:</span>
                    <h4>{korisnik.paket}</h4>
                </div>
                <a href="/panel/pretplata"><button className={styles.btn}>Izmeni</button></a>
            </div>
            <div className={styles.stavka}>
                <div>
                    <span>Datum isteka:</span>
                    <h4>{formatirajDatum(korisnik.istek_pretplate)}</h4>
                    <span>Paket traje još:</span>
                    <h4>{danaDoDatuma(korisnik.istek_pretplate)}</h4>
                </div>
            </div>
            <div className={styles.stavka} style={{flexDirection:'column', alignItems:'center'}}>
                <h3>QR kod za zakazivanje</h3>
                <QRCodeSVG value={link} className={styles.qr} ref={qrRef} />
                <button onClick={preuzmiQRCode} className={styles.btn}>
                    Preuzmi QR kod
                </button>
            </div>
        </div>

        
        <div className={styles.section}>
            <h2>Moje preduzeće</h2>
            <div className={styles.stavka}>
                <div>
                    <span>Ime:</span>
                    {editingPrIme ? (
                        <input 
                            value={korisnik.ime_preduzeca} 
                            onChange={(e) => setKorisnik({ ...korisnik, ime_preduzeca: e.target.value })} 
                        />
                    ) : (
                        <h4>{korisnik.ime_preduzeca  === '' ? ('Unesite ime') : (korisnik.ime_preduzeca)}</h4>
                    )}
                    <span>Ukupan broj zaposlenih:</span>
                    <h4>{brRadnika}</h4>
                </div>
                <button 
                    onClick={editingPrIme ? handleImeEmailTel : handlePrIme} 
                    className={styles.btn}
                    style={{maxHeight:'35px'}}
                >
                    {editingPrIme ? 'Potvrdi' : 'Izmeni'}
                </button>            
            </div>
            <div className={styles.stavka} style={{maxHeight:'150px'}}>
                <div>
                    <h4>Logo:</h4>
                    <span style={{fontSize:'14px'}}>Maksimalno do 2MB <br /></span>
                    <button className={styles.btn} style={{width:'120px', textAlign:'center'}}>Izmeni logo</button>
                </div>
                <img loading='lazy' src={korisnik.putanja_za_logo} />
            </div>
            <div className={`${styles.stavka} ${styles.firme}`} style={{flexDirection:'column', alignItems:'center'}}>
                <h2>Moje lokacije</h2>
                <button className={styles.btn} onClick={() => setShowDodajLokaciju(true)}>Nova lokacija</button>

                {preduzeca.map((firma) => {
                    const isEditing = editFirmaId === firma.id;

                    return (
                        <div key={firma.id} className={styles.firma}>
                            <div>
                                {isEditing ? (
                                    <>
                                        <input 
                                            value={editedFirmData.ime || ''} 
                                            onChange={(e) => setEditedFirmData({...editedFirmData, ime: e.target.value})}
                                        />
                                        <input 
                                            value={editedFirmData.adresa || ''} 
                                            onChange={(e) => setEditedFirmData({...editedFirmData, adresa: e.target.value})}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h4>{firma.ime}</h4>
                                        <span>{firma.adresa}</span>
                                    </>
                                )}

                                <p>Broj zaposlenih: <strong>{firma.zaposleni.length}</strong></p>
                            </div>

                            <button 
                                className={styles.btn} 
                                onClick={() => {
                                    if (isEditing) {
                                        handleConfirmEdit(firma.id);
                                    } else {
                                        setEditFirmaId(firma.id);
                                        setEditedFirmData({ ime: firma.ime, adresa: firma.adresa });
                                    }
                                }}
                            >
                                {isEditing ? 'Potvrdi' : 'Izmeni'}
                            </button>
                        </div>
                    );
                })}
            </div>

        </div>

        {showChangePass && (
            <div>
                <div className={styles.blur}></div>
                <div className={styles.dodajKorisnika} style={{height:'370px'}}>
                    <div className={stylesLogin.zatamniLogin} style={{zIndex:'-1'}}></div>
                    <form onSubmit={handlePromenaLozinke} className={styles.forma}>
                        <h2 style={{marginBottom:'15px'}} >Promeni lozinku</h2>
                        <div className={stylesLogin.formGroup}>
                            <input type={showCurrentPass ? 'text' : 'password'} value={currentPass} onChange={(e) => { setCurrentPass(e.target.value) }}
                                className={stylesLogin.formStyle} placeholder='Trenutna lozinka' />
                            <i className={`${stylesLogin.inputIcon} uil uil-lock`}></i>
                            <i className={`fa-solid ${showRegPass ? 'fa-eye-slash' : 'fa-eye'} ${stylesLogin.oko}`} onClick={() => setShowRegPass(prev => !prev)}></i>
                        </div>
                        <div className={stylesLogin.formGroup}>
                            <input type={showRegPass ? 'text' : 'password'} value={newPass} onChange={(e) => { setNewPass(e.target.value) }}
                                className={stylesLogin.formStyle} placeholder='Nova lozinka' />
                            <i className={`${stylesLogin.inputIcon} uil uil-lock`}></i>
                            <i className={`fa-solid ${showRegPass ? 'fa-eye-slash' : 'fa-eye'} ${stylesLogin.oko}`} onClick={() => setShowRegPass(prev => !prev)}></i>
                        </div>
                        <div className={stylesLogin.formGroup}>
                            <input type={showRegPassConf ? 'text' : 'password'} value={newPassConf} onChange={(e) => { setNewPassConf(e.target.value) }}
                                className={stylesLogin.formStyle} placeholder='Potvrdite novu lozinku' />
                            <i className={`${stylesLogin.inputIcon} uil uil-lock`}></i>
                            <i className={`fa-solid ${showRegPassConf ? 'fa-eye-slash' : 'fa-eye'} ${stylesLogin.oko}`} onClick={() => setShowRegPassConf(prev => !prev)}></i>
                        </div>
                        <button type='submit' className={styles.btn}>Promeni lozinku</button>
                        <div className={styles.x} onClick={() => setShowChangePass(false)}>
                            <i className="fa-regular fa-circle-xmark"></i>
                        </div>
                    </form>
                </div>
            </div>
        )}
        {showDodajLokaciju && (
            <div>
                <div className={styles.blur}></div>
                <div className={styles.dodajKorisnika} style={{height:'280px'}}>
                    <div className={stylesLogin.zatamniLogin} style={{zIndex:'-1'}}></div>
                    <form onSubmit={handleDodajLokaciju} className={styles.forma}>
                        <h2 style={{marginBottom:'15px'}} >Dodaj lokaciju</h2>
                        <div className={stylesLogin.formGroup}>
                            <input type='text' value={imeLokacije} onChange={(e) => { setImeLokacije(e.target.value) }}
                                className={stylesLogin.formStyle} placeholder='Ime lokacije' />
                            <i className={`${stylesLogin.inputIcon} uil uil-building`}></i>
                        </div>
                        <div className={stylesLogin.formGroup}>
                            <input type='text' value={adresa} onChange={(e) => { setAdresa(e.target.value) }}
                                className={stylesLogin.formStyle} placeholder='Adresa' />
                            <i className={`${stylesLogin.inputIcon} fa-solid fa-location-dot`} style={{ transform: 'translateY(-25%)' }}></i>
                        </div>
                        <button type='submit' className={styles.btn}>Dodaj lokaciju</button>
                        <div className={styles.x} onClick={() => setShowDodajLokaciju(false)}>
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
