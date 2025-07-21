'use client';

import { useEffect, useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import styles from './podesavanja.module.css';
import stylesLogin from '@/app/login/login.module.css';

export default function PodesavanjaPage() {
    const [korisnik, setKorisnik] = useState({});
    const [preduzeca, setPreduzeca] = useState([]);
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
    const fileInputRef = useRef();
    const [loadingPotvrdi, setLoadingPotvrdi] = useState(false);
    const [loadingLokacija, setLoadingLokacija] = useState(false);
    const [showRadnoVreme, setShowRadnoVreme] = useState("");

    const sati = [
        "00:00", "00:30",
        "01:00", "01:30",
        "02:00", "02:30",
        "03:00", "03:30",
        "04:00", "04:30",
        "05:00", "05:30",
        "06:00", "06:30",
        "07:00", "07:30",
        "08:00", "08:30",
        "09:00", "09:30",
        "10:00", "10:30",
        "11:00", "11:30",
        "12:00", "12:30",
        "13:00", "13:30",
        "14:00", "14:30",
        "15:00", "15:30",
        "16:00", "16:30",
        "17:00", "17:30",
        "18:00", "18:30",
        "19:00", "19:30",
        "20:00", "20:30",
        "21:00", "21:30",
        "22:00", "22:30",
        "23:00", "23:30",
        "24:00"
    ];
    const [daniRV, setDaniVR] = useState(["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota", "Nedelja"]);
    const [izabranaVremena, setIzabranaVremena] = useState(
        daniRV.map(() => ({ od: "", do: "" }))
    );
    const danMap = {
        "Ponedeljak": "mon",
        "Utorak": "tue",
        "Sreda": "wen",
        "Četvrtak": "thu",
        "Petak": "fri",
        "Subota": "sat",
        "Nedelja": "sun",
    };
    const [odabranaFirma, setOdabranaFirma] = useState({});
    const [showTT, setShowTT] = useState("");
    const trajanja = ["30 min", "1 h", "1 h 30 min", "2 h", "3 h"];
    const [izabranaTrajanja, setIzabranaTrajanja] = useState([]);



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
        setLoadingPotvrdi(true);
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

        setLoadingPotvrdi(false);
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
        setLoadingLokacija(true);
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

        setLoadingLokacija(false);
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
        setLoadingPotvrdi(true);
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

    setLoadingPotvrdi(false);
    if (!res.ok) {
        toast.error(data.message);
        return;
    }
    setPreduzeca(data);
    toast.success("Uspešno izmenili podatke lokacije.")
    setEditFirmaId(null);
    setEditedFirmData({});
    };
    const handleButtonClickLogo = () => {
        fileInputRef.current.click();
    };
    const handleFileChange = async (event) => {
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        const file = event.target.files[0];
        if (!file) return;
    
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Fajl je veći od 2MB!");
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
        formData.append('id', userId);
        formData.append('authToken', authToken);
    
        try {
            const response = await fetch('https://mojtermin.site/api/novi_logo', {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                const data = await response.json();
                // Odmah ažuriraj logo u korisnik state-u
                setKorisnik(prev => ({
                    ...prev,
                    putanja_za_logo: `/logos/${data.filename}`
                }));
                toast.success("Logo uspešno poslat!");
            } else {
                toast.error("Greška prilikom slanja loga.");
            }
        } catch (error) {
            console.error("Greška:", error);
            toast.error("Došlo je do greške.");
        }
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
    }, []);

    const prikaziRadnoVreme = (tip) => {
        if (tip === 'default') {
            setShowRadnoVreme('Podrazumevano radno vreme');

            const radnoVreme = korisnik?.radnoVreme || {};

            const novaVremena = daniRV.map(dan => {
                const key = danMap[dan];
                const vreme = radnoVreme[key];

                if (vreme && vreme.includes('-')) {
                    const [od, doVreme] = vreme.split('-');
                    return { od, do: doVreme };
                }

                return { od: "", do: "" };
            });

            setIzabranaVremena(novaVremena);
        } else {
            console.log(tip)
            setShowRadnoVreme(`Radno vreme za ${tip.ime}`);4
            const radnoVreme = tip?.radno_vreme || korisnik?.radnoVreme || {};
            const novaVremena = daniRV.map(dan => {
                const key = danMap[dan];
                const vreme = radnoVreme[key];

                if (vreme && vreme.includes('-')) {
                    const [od, doVreme] = vreme.split('-');
                    return { od, do: doVreme };
                }

                return { od: "", do: "" };
            });
            setIzabranaVremena(novaVremena);
            setOdabranaFirma(tip);
        }
    };
    const patchDanMap = ["mon", "tue", "wen", "thu", "fri", "sat", "sun"];
    const formiranoRadnoVreme = izabranaVremena.reduce((acc, vreme, index) => {
        const dan = patchDanMap[index];
        let od = vreme.od;
        let doVreme = vreme.do;

        // Ako je oba prazno, šalji prazan string
        if (!od && !doVreme) {
            acc[dan] = "";
            return acc;
        }

        // Ako je uneto samo zatvaranje, otvaranje je 00:00
        if (!od && doVreme) {
            od = "00:00";
        }

        // Ako je uneto samo otvaranje, zatvaranje je 00:00
        if (od && !doVreme) {
            doVreme = "00:00";
        }

        // Ako je od 00:00 do 00:00, šalji prazan string
        if (od === "00:00" && doVreme === "00:00") {
            acc[dan] = "";
            return acc;
        }

        acc[dan] = `${od}-${doVreme}`;
        return acc;
    }, {});

    const handlePromeniVR = async(e) => {
        e.preventDefault();
        const tip = showRadnoVreme === 'Podrazumevano radno vreme' ? 'default' : odabranaFirma.id;
        console.log('Tip',tip);
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');

        try{
            const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/podesavanja/radno-vreme`, {
                method: 'PATCH',
                headers:{
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tip,
                    vremena: formiranoRadnoVreme,
                    userId
                })
            });
            const data = await response.json();
            if (!response.ok) {
                toast.error(data.message || 'Greška prilikom izmene.');
                return;
            }
            toast.success("Uspešno ste promenili radno vreme.");
            setKorisnik(data.korisnik);
            setPreduzeca(data.preduzeca);
            setShowRadnoVreme("");

        } catch (error) {
            console.error("Greška:", error);
            toast.error("Došlo je do greške.");
        }

    }

    const prikaziTT = (tip) => {
        if (tip === 'default') {
            setShowTT("Podrazumevano trajanje termina");
            setIzabranaTrajanja(korisnik.trajanje);
        } else {
            setShowTT(`Trajanje termina za ${tip.ime}`);
            setIzabranaTrajanja(tip.duzina_termina);
            setOdabranaFirma(tip);
        }
    }
    const handlePromeniTT = async(e) => {
        e.preventDefault();
        const tip = showTT === 'Podrazumevano trajanje termina' ? 'default' : odabranaFirma.id;
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        try{
            const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/podesavanja/duzina-termina`, {
                method: 'PATCH',
                headers:{
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tip,
                    termini: izabranaTrajanja,
                    userId
                })
            });
            const data = await response.json();
            if (!response.ok) {
                toast.error(data.message || 'Greška prilikom izmene.');
                return;
            }
            toast.success("Uspešno ste promenili radno vreme.");
            setKorisnik(data.korisnik);
            setPreduzeca(data.preduzeca);
            setShowTT("");
        } catch (error) {
            console.log(error);
        }
    }



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
                    disabled={loadingPotvrdi}
                >
                    {editingUsername && loadingPotvrdi ? <div className="spinnerMali"></div> : (editingUsername ? 'Potvrdi' : 'Izmeni')}
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
                    disabled={loadingPotvrdi}
                >
                    {editingEmail && loadingPotvrdi ? <div className="spinnerMali"></div> : (editingEmail ? 'Potvrdi' : 'Izmeni')}
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
                    disabled={loadingPotvrdi}
                >
                    {editingBrTel && loadingPotvrdi ? <div className="spinnerMali"></div> : (editingBrTel ? 'Potvrdi' : 'Izmeni')}
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
                    disabled={loadingPotvrdi}
                >
                    {editingPrIme && loadingPotvrdi ? <div className="spinnerMali"></div> : (editingPrIme ? 'Potvrdi' : 'Izmeni')}
                </button>            
            </div>
            <div className={styles.stavka} style={{maxHeight:'150px'}}>
                <div>
                    <h4>Logo:</h4>
                    <span style={{fontSize:'14px'}}>Maksimalno do 2MB <br /></span>
                    <button onClick={handleButtonClickLogo} className={styles.btn} style={{width:'120px', textAlign:'center'}}>Izmeni logo</button>
                    <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
                </div>
                <img loading='lazy' src={korisnik.putanja_za_logo === '' ? '/Images/logo.webp' : korisnik.putanja_za_logo} />
            </div>
            <div className={`${styles.stavka} ${styles.firme}`} style={{flexDirection:'column', alignItems:'center'}}>
                <h2>Moje lokacije</h2>
                <div style={{display:'flex',flexDirection:'row',alignItems:'center',gap:'20px'}}>
                    <button className={styles.btn} onClick={() => setShowDodajLokaciju(true)}>Nova lokacija</button>
                    <button className={styles.btn} onClick={() => prikaziRadnoVreme("default")}>
                        Radno vreme
                    </button>
                    <button className={styles.btn} onClick={() => prikaziTT("default")}>
                        Termini
                    </button>
                </div>

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
                            <div style={{display:'flax',flexDirection:'row',gap:'15px'}}>
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
                                    disabled={isEditing && loadingPotvrdi}
                                >
                                    {isEditing && loadingPotvrdi ? <div className="spinnerMali"></div> : (isEditing ? 'Potvrdi' : 'Izmeni')}
                                </button>
                                <button className={styles.btn} onClick={(e) => prikaziRadnoVreme(firma)}>
                                    Radno vreme
                                </button>
                                <button className={styles.btn} onClick={() => prikaziTT(firma)}>
                                    Termini
                                </button>
                            </div>
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
                        <button type='submit' className={styles.btn} disabled={loadingLokacija}>
                            {loadingLokacija ? <div className="spinnerMali"></div> : 'Dodaj lokaciju'}
                        </button>
                        <div className={styles.x} onClick={() => setShowDodajLokaciju(false)}>
                            <i className="fa-regular fa-circle-xmark"></i>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {showRadnoVreme !== '' && (
             <div>
                <div className={styles.blur}></div>
                <div className={styles.dodajKorisnika} style={{height:'280px'}}>
                    <div className={stylesLogin.zatamniLogin} style={{zIndex:'-1'}}></div>
                    <form onSubmit={handlePromeniVR} className={styles.forma} style={{alignItems:'flex-start'}}>
                        <h2 style={{marginBottom:'30px'}}>{showRadnoVreme}</h2>
                        {daniRV.map((dan, idx) => (
                          <div className={styles.dan} key={dan} style={{display:'flex',flexDirection:'row', gap:'5px'}}>
                            <h3>{dan}</h3>
                            <select
                              value={izabranaVremena[idx].od}
                              onChange={e => {
                                const nova = [...izabranaVremena];
                                nova[idx].od = e.target.value;
                                setIzabranaVremena(nova);
                              }}
                              className={styles.formStyle}
                            >
                              {sati.map((sat) => (
                                <option value={sat} key={sat}>{sat}</option>
                              ))}
                            </select>
                            &nbsp;-&nbsp;
                            <select
                              value={izabranaVremena[idx].do}
                              onChange={e => {
                                const nova = [...izabranaVremena];
                                nova[idx].do = e.target.value;
                                setIzabranaVremena(nova);
                              }}
                            >
                              {sati.map((sat) => (
                                <option value={sat} key={sat}>{sat}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                        <button className={styles.btn} type='submit'>
                            Potvrdi izmene
                        </button>
                        

                        <div className={styles.x} onClick={() => setShowRadnoVreme("")}>
                            <i className="fa-regular fa-circle-xmark"></i>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {showTT !== '' && (
             <div>
                <div className={styles.blur}></div>
                <div className={styles.dodajKorisnika} style={{height:'280px'}}>
                    <div className={stylesLogin.zatamniLogin} style={{zIndex:'-1'}}></div>
                    <form onSubmit={handlePromeniTT} className={styles.forma} style={{alignItems:'flex-start'}}>
                        <h2 style={{marginBottom:'30px'}}>{showTT}</h2>
                        {trajanja.map((trajanje, index) => (
                            <label key={index}>
                                <input
                                    type="checkbox"
                                    checked={Array.isArray(izabranaTrajanja) && izabranaTrajanja.includes(trajanje)}
                                    onChange={() => {
                                        setIzabranaTrajanja(prev =>
                                        Array.isArray(prev)
                                            ? (prev.includes(trajanje)
                                                ? prev.filter(t => t !== trajanje)
                                                : [...prev, trajanje])
                                            : [trajanje]
                                        );
                                    }}
                                />
                                {trajanje}
                         </label>
                        ))}
                        <button className={styles.btn} type='submit'>
                            Potvrdi izmene
                        </button>
                        

                        <div className={styles.x} onClick={() => setShowTT("")}>
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
