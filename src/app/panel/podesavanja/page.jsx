'use client';

import { useEffect, useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import styles from './podesavanja.module.css';
import { QRCodeSVG } from 'qrcode.react';

export default function PodesavanjaPage() {
    const [korisnik, setKorisnik] = useState({});
    const [preduzeca, setPreduzeca] = useState([]);
    const [link, setLink] = useState('');
    const qrRef = useRef(null);
    const [brRadnika, setBrRadnika] = useState(0);

    /*promene vrednosti */
    const [editingUsername, setEditingUsername] = useState(false);
    const [editingEmail, setEditingEmail] = useState(false);

    const handleEditUsernameClick = () => {
        setEditingUsername(true);
    };
    const handleConfirmUsernameClick = () => {
        console.log('Korisničko ime poslato:', korisnik.username);
        setEditingUsername(false);
    };

    const handleEditEmailClick = () => {
        setEditingEmail(true);
    };
    const handleConfirmEmailClick = () => {
        console.log('Email poslato:', korisnik.email);
        setEditingEmail(false);
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
        const userId = localStorage.getItem('localStorage');
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
                    onClick={editingUsername ? handleConfirmUsernameClick : handleEditUsernameClick} 
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
                    onClick={editingEmail ? handleConfirmEmailClick : handleEditEmailClick} 
                    className={styles.btn}
                >
                    {editingEmail ? 'Potvrdi' : 'Izmeni'}
                </button>
            </div>
            <div className={styles.stavka}>
                <div>
                    <span>Br. telefona:</span>
                    <h4>{korisnik.brTel}</h4>
                </div>
                <button className={styles.btn}>Izmeni</button>
            </div>
            <div className={styles.stavka}>
                <div>
                    <h4>Promena lozinke</h4>
                    <span style={{fontSize:'14px'}}>Lozinka je zaštićena i ne može se prikazati.</span>
                </div>
                <button className={styles.btn}>Izmeni</button>
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
                    <h4>{korisnik.ime_preduzeca}</h4>
                </div>
                <button className={styles.btn}>Izmeni</button>
            </div>
            <div className={styles.stavka} style={{maxHeight:'150px'}}>
                <div>
                    <h4>Logo:</h4>
                    <span style={{fontSize:'14px'}}>Maksimalno do 2MB <br /></span>
                    <button className={styles.btn}>Izmeni logo</button>
                </div>
                <img loading='lazy' src={korisnik.putanja_za_logo} />
            </div>
            <div className={styles.stavka}>
                <div>
                    <span>Ukupan broj zaposlenih:</span>
                    <h4>{brRadnika}</h4>
                </div>
                <a href="/panel/nalozi"><button className={styles.btn}>Izmeni</button></a>
            </div>
            <div className={styles.stavka} style={{flexDirection:'column',alignItems:'center'}}>
                <h2>Moje lokacije</h2>
            <button className={styles.btn}>Nova lokacija</button>
            {preduzeca.map((firma) => (
                <div key={firma.id} className={styles.firma}>
                    <div>
                        <h4>{firma.ime}</h4>
                        <span>{firma.adresa}</span>
                        <p>Broj zaposlenih: <strong>{firma.zaposleni.length}</strong></p>
                    </div>
                    <button className={styles.btn}>Izmeni</button>
                </div>
            ))}

            </div>
        </div>

        <ToastContainer />
    </div>
  );
}
