'use client';

import { useEffect, useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import styles from './podesavanja.module.css';
import stylesLogin from '@/app/login/login.module.css';
import useLogout from '@/hooks/useLogout';
import MarkdownEditor from '@/components/MarkdownEditor';
import { QRCodeSVG } from 'qrcode.react';

export default function PodesavanjaPage() {
    const logout = useLogout();

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
    const [loadingRadnoVreme, setLoadingRadnoVreme] = useState(false);
    const [loadingTT, setLoadingTT] = useState(false);
    const [showRadnoVreme, setShowRadnoVreme] = useState("");
    const [isLocked, setIsLocked] = useState(true);
    const [copyHover, setCopyHover] = useState(false);
    const [bookingLink, setBookingLink] = useState('');
    const [loadingScreen, setLoadingScreen] = useState(true);

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

    // TT - Cenovnik varijable
    const [novaUsluga_cena, setNovaUsluga_cena] = useState('');
    const [novaUsluga_naziv, setNovaUsluga_naziv] = useState('');
    const [novaUsluga_trajanje, setNovaUsluga_trajanje] = useState('');
    const [novaUsluga_trajanje_prikaz, setNovaUsluga_trajanje_prikaz] = useState('');
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [editingServiceData, setEditingServiceData] = useState({});

    const cenaPrikazi = [
        { vrednost: 30, prikaz: "30 min" },
        { vrednost: 60, prikaz: "1 sat" },
        { vrednost: 90, prikaz: "1 sat 30 min" },
        { vrednost: 120, prikaz: "2 sata" },
        { vrednost: 180, prikaz: "3 sata" },
        { vrednost: 240, prikaz: "4 sata" },
    ];



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
        const trajanje = korisnik.trajanje; 
        const radnoVreme = korisnik.radnoVreme;
        const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/podesavanja/dodaj-lokaciju/${userId}`, {
            method:'POST',
            headers:{
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({imeLokacije, adresa, trajanje, radnoVreme })
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
                    putanja_za_logo: `${data.filename}`
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
            if (data && data.code === "ERROR_CODE_UNAUTHORIZED") {
                logout();
                return;
            }
            toast.error(data.message || 'Greška prilikom preuzimanja podataka.');
            return;
        }

        setKorisnik(data.korisnik);
        setPreduzeca(data.preduzeca);
        const ukupno = data.preduzeca.reduce((suma, firma) => {
            return suma + (firma.zaposleni?.length || 0);
        }, 0);
        setBrRadnika(ukupno);
        setLoadingScreen(false);

        const { paket_limits } = data.korisnik;
        const brojPreduzeca = data.preduzeca.length;
        const maxLokacija = paket_limits?.lokacije ?? 0;

        if (brojPreduzeca < maxLokacija) {
            setIsLocked(false);
        } else {
            setIsLocked(true);
        }
    }
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            setBookingLink(`https://mojtermin.site/zakazi/${userId}`);
        }
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
        setLoadingRadnoVreme(true);
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
        setLoadingRadnoVreme(false);

    }

    const prikaziTT = (tip) => {
        if (tip === 'default') {
            setShowTT("Podrazumevano trajanje termina");
            setIzabranaTrajanja(Array.isArray(korisnik.trajanje) ? korisnik.trajanje : []);
        } else {
            setShowTT(`Trajanje termina za ${tip.ime}`);
            setIzabranaTrajanja(Array.isArray(tip.duzina_termina) ? tip.duzina_termina : []);
            setOdabranaFirma(tip);
        }
        // Resetuj obrasca za novu uslugu
        resetujFormularUsluge();
    };

    const resetujFormularUsluge = () => {
        setNovaUsluga_cena('');
        setNovaUsluga_naziv('');
        setNovaUsluga_trajanje('');
        setNovaUsluga_trajanje_prikaz('');
        setEditingServiceId(null);
        setEditingServiceData({});
    };

    const handleAddService = () => {
        if (!novaUsluga_cena || !novaUsluga_naziv || !novaUsluga_trajanje) {
            toast.error('Popunite sva polja.');
            return;
        }

        const novaUsluga = {
            cena: parseInt(novaUsluga_cena),
            usluga: novaUsluga_naziv,
            trajanje: parseInt(novaUsluga_trajanje),
            trajanje_prikaz: novaUsluga_trajanje_prikaz
        };

        setIzabranaTrajanja(prev => [...prev, novaUsluga]);
        resetujFormularUsluge();
        toast.success('Usluga dodana!');
    };

    const handleDeleteService = (index) => {
        setIzabranaTrajanja(prev => prev.filter((_, i) => i !== index));
        toast.success('Usluga obrisana!');
    };

    const handleStartEditService = (index, service) => {
        setEditingServiceId(index);
        setEditingServiceData({
            cena: service.cena,
            usluga: service.usluga,
            trajanje: service.trajanje,
            trajanje_prikaz: service.trajanje_prikaz
        });
    };

    const handleSaveEditService = (index) => {
        if (!editingServiceData.cena || !editingServiceData.usluga || !editingServiceData.trajanje) {
            toast.error('Popunite sva polja.');
            return;
        }

        const updatedServices = [...izabranaTrajanja];
        updatedServices[index] = editingServiceData;
        setIzabranaTrajanja(updatedServices);
        setEditingServiceId(null);
        setEditingServiceData({});
        toast.success('Usluga ažurirana!');
    };
    const handlePromeniTT = async(e) => {
        e.preventDefault();
        setLoadingTT(true);
        if (!Array.isArray(izabranaTrajanja) || izabranaTrajanja.length === 0) {
            toast.error("Morate dodati makar jednu uslugu.");
            setLoadingTT(false);
            return;
        }
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
            toast.success("Uspešno ste promenili cenovnik.");
            setKorisnik(data.korisnik);
            setPreduzeca(data.preduzeca);
            setShowTT("");
        } catch (error) {
            console.log(error);
            toast.error("Došlo je do greške.");
        }
        setLoadingTT(false);
    }

    const [link, setLink] = useState('');
    const qrRef = useRef(null);
    
    const preuzmiQRCode = async () => {
        try {
            const svg = qrRef.current?.querySelector('svg');
            if (!svg) return;

            const serializer = new XMLSerializer();
            const svgStr = serializer.serializeToString(svg);

            const blob = new Blob([svgStr], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "booking-qrcode.svg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('QR kod je preuzet!');
        } catch (error) {
            console.error('Greška pri preuzimanju QR koda:', error);
            toast.error('Greška pri preuzimanju QR koda');
        }
    };



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
            {/*<div className={styles.stavka}>
                <div>
                    <span>Odabran paket:</span>
                    <h4>{korisnik.paket}</h4>
                </div>
                <a href="/panel/pretplata"><button className={styles.btn}>Izmeni</button></a>
            </div>*/}
            <div className={styles.stavka}>
                <div>
                    <div>
                        <span>Odabran paket:</span>
                        <h4>{korisnik.paket}</h4>
                    </div>
                    <span>Datum isteka:</span>
                    {korisnik.paket === 'Personalni' ? (
                        <h4>Ne postoji</h4>
                    ) : (
                        <h4>{formatirajDatum(korisnik.istek_pretplate)}</h4>
                    )}
                    
                    
                    {korisnik.paket === 'Personalni' ? (
                        <></>
                    ) : (
                        <>
                            <span>Paket traje još:</span>
                            <h4>{danaDoDatuma(korisnik.istek_pretplate)}</h4>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.stavka} style={{flexDirection:'column', alignItems:'center'}}>
                <h3>URL za zakazivanje</h3>
                <div style={{display:'flex', width:'100%', maxWidth: '500px', marginBottom:'20px', position:'relative'}}>
                    <input 
                        type="text"
                        value={bookingLink}
                        disabled
                        placeholder="Link za zakazivanje"
                        style={{flex:1, padding:'8px 40px 8px 12px', borderRadius:'4px', border:'1px solid #ccc', backgroundColor:'#f5f5f5'}}
                    />
                    <button 
                        type="button"
                        onClick={() => {
                            navigator.clipboard.writeText(bookingLink);
                            toast.success('Link je kopiran u clipboard!');
                        }} 
                        onMouseEnter={() => setCopyHover(true)}
                        onMouseLeave={() => setCopyHover(false)}
                        style={{position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:'4px'}}
                        title="Kopiraj link"
                    >
                        <i className="fa-solid fa-copy" style={{color: copyHover ? '#1890ff' : '#666', fontSize:'16px', transition: 'color 0.2s ease'}}></i>
                    </button>
                </div>
                {/* Skriveni QR kod za preuzimanje */}
                <div ref={qrRef} style={{display: 'none'}}>
                    <QRCodeSVG 
                        value={bookingLink} 
                        size={300}
                        level="H"
                        includeMargin={true}
                    />
                </div>
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
                    <h4>{korisnik.ime_preduzeca  === '' ? ('Unesite ime') : (korisnik.ime_preduzeca)}</h4>
                    <span>Ukupan broj zaposlenih:</span>
                    <h4>{brRadnika}</h4>
                </div>
                <div className={styles.buttonsDiv}>
                    <button 
                        onClick={handlePrIme} 
                        className={styles.btn}
                        style={{maxHeight:'35px'}}
                        disabled={loadingPotvrdi}
                    >
                        Izmeni
                    </button>
                </div>
            </div>
            <div className={styles.stavka} style={{maxHeight:'150px'}}>
                <div className={styles.logoDiv}>
                    <div>
                        <h4>Logo:</h4>
                        <span style={{fontSize:'14px'}}>Maksimalno do 2MB <br /></span>
                    </div>
                    <button onClick={handleButtonClickLogo} className={styles.btn} style={{width:'120px', textAlign:'center'}}>Izmeni logo</button>
                    <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
                </div>
                <img loading='lazy' src={korisnik.putanja_za_logo === '' ? '/Images/logo.webp' : `https://mojtermin.site/api/logo/${korisnik.putanja_za_logo}`} />
            </div>
            <div className={`${styles.stavka} ${styles.firme}`} style={{flexDirection:'column', alignItems:'center'}}>
                <h2>Moje lokacije</h2>
                <div style={{display:'flex',flexDirection:'row',alignItems:'center',gap:'20px'}}>
                    {isLocked ? (
                        <div style={{position:'relative'}}>
                            <button className={styles.btn}>Nova lokacija</button>
                            <div
                                style={{
                                    width: '100%',
                                    height: 'calc(100% - 20px)',
                                    position: 'absolute',
                                    top: '50%',
                                    left: 0,
                                    transform: 'translateY(-50%)',
                                    backgroundColor: '#f0f0f08a',
                                    zIndex: 10
                                }}
                            ></div>
                            <i className="fa-solid fa-lock" 
                                style={{ 
                                    color: '#ff4d4f',
                                    position:'absolute',
                                    zIndex:'15',
                                    top:'2px',
                                    right:'-5px',
                                    transform:'rotate(20deg)'
                                }} 
                            />

                        </div>
                        
                    ) : (
                        <button className={styles.btn} onClick={() => setShowDodajLokaciju(true)}>Nova lokacija</button>
                    )}
                    <button className={styles.btn} onClick={() => prikaziRadnoVreme("default")}>
                        Radno vreme
                    </button>
                    <button className={styles.btn} onClick={() => prikaziTT("default")}>
                        Cenovnik
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
                                        <input 
                                            min={1}
                                            value={editedFirmData.overlapLimit || ''} 
                                            onChange={(e) => setEditedFirmData({...editedFirmData, overlapLimit: e.target.value})}
                                            placeholder='Ograničenja istovremenih termina'
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h4>{firma.ime}</h4>
                                        <span>{firma.adresa}</span>
                                        <span style={{fontWeight:'300'}}>Ograničenja istovremenih termina: <span style={{fontWeight:'600'}}>{firma.overlapLimit}</span></span>
                                    </>
                                )}

                                <p style={{fontWeight:'300'}}>Broj zaposlenih: <strong style={{fontWeight:'600'}}>{firma.zaposleni.length}</strong></p>
                            </div>
                            <div style={{display:'flax',flexDirection:'row',gap:'15px'}}>
                                <button 
                                    className={styles.btn} 
                                    onClick={() => {
                                        if (isEditing) {
                                            handleConfirmEdit(firma.id);
                                        } else {
                                            setEditFirmaId(firma.id);
                                            setEditedFirmData({ ime: firma.ime, adresa: firma.adresa, overlapLimit: firma.overlapLimit });
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
                                    Cenovnik
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>

        {editingPrIme && (
            <div>
                <div className={styles.blur}></div>
                <div className={styles.dodajKorisnika} style={{height:'auto'}}>
                    <div className={stylesLogin.zatamniLogin} style={{zIndex:'-1'}}></div>
                    <form onSubmit={handleImeEmailTel} className={styles.forma}>
                        <h2 style={{marginBottom:'15px', marginTop:"8px"}} >Izmeni podatke preduzeća</h2>
                        <div className={stylesLogin.formGroup}>
                            <input type='text' value={korisnik.ime_preduzeca} onChange={(e) => { setKorisnik({...korisnik, ime_preduzeca: e.target.value}) }}
                                className={stylesLogin.formStyle} placeholder='Ime preduzeća' />
                            <i className={`${stylesLogin.inputIcon} uil uil-building`}></i>
                        </div>
                        <div className={stylesLogin.formGroup}>
                            <MarkdownEditor 
                                value={korisnik.opis || ''} 
                                onChange={(e) => { 
                                    const opis = e.target.value.slice(0, 150);
                                    setKorisnik({...korisnik, opis}) 
                                }}
                                placeholder='Opis preduzeća'
                            />
                            
                        </div>
                        <button type='submit' className={styles.btn2} disabled={loadingPotvrdi}>
                            {loadingPotvrdi ? <div className="spinnerMali"></div> : 'Sačuvaj'}
                        </button>
                        <div className={styles.x} onClick={() => setEditingPrIme(false)}>
                            <i className="fa-regular fa-circle-xmark"></i>
                        </div>
                    </form>
                </div>
            </div>
        )}

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
                        <button type='submit' className={styles.btn2}>Promeni lozinku</button>
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
                        <button type='submit' className={styles.btn2} disabled={loadingLokacija}>
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
                <div className={styles.radnoVreme}>
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
                        <button className={styles.btn2} type='submit'>
                            {loadingRadnoVreme ? <div className="spinnerMali"></div> : 'Potvrdi izmene'}
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
                <div className={styles.dodajKorisnika2} style={{height:'auto', maxHeight:'80vh', overflowY:'auto'}}>
                    <div className={styles.cenovnikZatamni}>
                        <form onSubmit={handlePromeniTT} className={styles.forma} style={{alignItems:'flex-start'}}>
                            <h2 style={{marginBottom:'30px'}}>{showTT}</h2>

                            {/* Forma za dodavanje nove usluge */}
                            <div className={styles.cenovnikForm}>
                                <h3>Dodaj novu uslugu</h3>
                                <div className={styles.cenovnikFormInputs}>
                                    <input
                                        type="text"
                                        placeholder="Naziv usluge"
                                        value={novaUsluga_naziv}
                                        onChange={(e) => setNovaUsluga_naziv(e.target.value)}
                                        className={styles.cenovnikInput}
                                    />
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="Cena (RSD)"
                                        value={novaUsluga_cena}
                                        onChange={(e) => setNovaUsluga_cena(e.target.value)}
                                        className={styles.cenovnikInput}
                                    />
                                    <select
                                        value={novaUsluga_trajanje}
                                        onChange={(e) => {
                                            const selectedIndex = e.target.selectedIndex;
                                            setNovaUsluga_trajanje(e.target.value);
                                            if (selectedIndex > 0) {
                                                setNovaUsluga_trajanje_prikaz(cenaPrikazi[selectedIndex - 1].prikaz);
                                            }
                                        }}
                                        className={styles.cenovnikSelect}
                                    >
                                        <option value="">Odaberite trajanje</option>
                                        {cenaPrikazi.map((p) => (
                                            <option key={p.vrednost} value={p.vrednost}>
                                                {p.prikaz}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className={styles.cenovnikAddBtn}
                                        onClick={handleAddService}
                                    >
                                        Dodaj uslugu
                                    </button>
                                </div>
                            </div>

                            {/* Prikaz postojećih usluga */}
                            <div className={styles.cenovnikUsluge}>
                                <h3>Usluge ({Array.isArray(izabranaTrajanja) ? izabranaTrajanja.length : 0})</h3>
                                {Array.isArray(izabranaTrajanja) && izabranaTrajanja.length > 0 ? (
                                    <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                        {izabranaTrajanja.map((usluga, index) => (
                                            <div
                                                key={index}
                                                className={`${styles.cenovnikUsluga} ${editingServiceId === index ? styles.cenovnikUslugaEditMode : ''}`}
                                            >
                                                {editingServiceId === index ? (
                                                    <div>
                                                        <div className={styles.uslugaEditInputs}>
                                                            <input
                                                                type="text"
                                                                placeholder="Naziv usluge"
                                                                value={editingServiceData.usluga || ''}
                                                                onChange={(e) => setEditingServiceData({...editingServiceData, usluga: e.target.value})}
                                                                className={styles.cenovnikInput}
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Cena (RSD)"
                                                                value={editingServiceData.cena || ''}
                                                                onChange={(e) => setEditingServiceData({...editingServiceData, cena: parseInt(e.target.value) || 0})}
                                                                className={styles.cenovnikInput}
                                                            />
                                                            <select
                                                                value={editingServiceData.trajanje || ''}
                                                                onChange={(e) => {
                                                                    const selectedIndex = e.target.selectedIndex;
                                                                    setEditingServiceData({...editingServiceData, trajanje: parseInt(e.target.value) || 0});
                                                                    if (selectedIndex > 0) {
                                                                        setEditingServiceData(prev => ({...prev, trajanje_prikaz: cenaPrikazi[selectedIndex - 1].prikaz}));
                                                                    }
                                                                }}
                                                                className={styles.cenovnikSelect}
                                                            >
                                                                <option value="">Odaberite trajanje</option>
                                                                {cenaPrikazi.map((p) => (
                                                                    <option key={p.vrednost} value={p.vrednost} selected={editingServiceData.trajanje === p.vrednost}>
                                                                        {p.prikaz}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className={styles.uslugaEditDugmici}>
                                                            <button
                                                                type="button"
                                                                className={styles.uslugaDugmeSacuvaj}
                                                                onClick={() => handleSaveEditService(index)}
                                                                disabled={loadingTT}
                                                            >
                                                                Sačuvaj
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={styles.uslugaDugmeOtkaziEdit}
                                                                onClick={() => setEditingServiceId(null)}
                                                            >
                                                                Otkaži
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className={styles.uslugaDisplay}>
                                                        <div className={styles.uslugaHeader}>
                                                            <div className={styles.uslugaNaziv}>
                                                                <h4 style={{textAlign:'left'}}>{usluga.usluga}</h4>
                                                                <span style={{textAlign:'left'}}>{usluga.trajanje_prikaz || `${usluga.trajanje} min`}</span>
                                                            </div>
                                                            <div className={styles.uslugaCena} style={{fontSize:'16px'}}>{usluga.cena} RSD</div>
                                                        </div>
                                                        <div className={styles.uslugaDugmici}>
                                                            <button
                                                                type="button"
                                                                className={styles.uslugaDugmeIzmeni}
                                                                onClick={() => handleStartEditService(index, usluga)}
                                                            >
                                                                Izmeni
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={styles.uslugaDugmeObrisi}
                                                                onClick={() => handleDeleteService(index)}
                                                            >
                                                                Obriši
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.cenovnikEmpty}>
                                        Nema usluga. Dodajte novu uslugu gore.
                                    </div>
                                )}
                            </div>

                            <button className={styles.btn2} type='submit' style={{marginTop:'20px', alignSelf:'center'}}>
                                {loadingTT ? <div className="spinnerMali"></div> : 'Sačuvaj cenovnik'}
                            </button>

                            <div className={styles.x} onClick={() => {
                                setShowTT("");
                                resetujFormularUsluge();
                            }}>
                                <i className="fa-regular fa-circle-xmark"></i>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}

        <div className={`${styles.loadingScreen} ${loadingScreen ? '' : styles.ucitano}`}>
            <span className="spinner"></span>
        </div>
        <ToastContainer />
    </div>
  );
}
