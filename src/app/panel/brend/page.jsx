'use client';
import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './Brend.module.css';
import { toast, ToastContainer } from 'react-toastify';

export default function BrendPage() {
    const [selectedDesign, setSelectedDesign] = useState('default');
    const [dizajnObavestenja, setDizajnObavestenja] = useState(true);
    const [showLink, setShowLink] = useState(false);
    const [showStruktura, setShowStruktura] = useState(false);
    const [formaStruktura, setFormaStruktura] = useState(null);
    const [paket, setPaket] = useState('')

    const qrRef = useRef(null);
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

    useEffect(() => {
        const init = async () => {
            const userId = localStorage.getItem("userId");
            if (userId === null) return;

            const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazi/${userId}/forma`);
            const data = await res.json();

            localStorage.setItem('zakaziForma', JSON.stringify(data.forma));
            localStorage.setItem('zakaziPreduzece', JSON.stringify(data));
            setPaket(data.paket)
        };

        init();
    }, []);


    const labelMap = {
        ime: "Ime",
        prezime: "Prezime",
        email: "Email",
        telefon: "Telefon",
        datum: "Datum",
        vreme: "Vreme",
        trajanje: "Trajanje",
        lokacija: "Lokacija",
        opis: "Opis",
        nazivFirme: "Naziv firme",
        logoFirme: "Logo firme"
        // Dodaj ostala polja po potrebi
    };

    useEffect(() => {
        if (showStruktura) {
            const stored = localStorage.getItem('zakaziForma');
            if (stored) setFormaStruktura(JSON.parse(stored));
        }
    }, [showStruktura]);

    const handleCheckboxChange = (field) => {
        setFormaStruktura(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleOtkazi = () => setShowStruktura(false);
    const [iframeKey, setIframeKey] = useState(0);
    const handleSacuvajStrukturu = () => {
        localStorage.setItem('zakaziForma', JSON.stringify(formaStruktura));
        toast.success('Struktura je primenjena!');
        setShowStruktura(false);
        setIframeKey(prev => prev + 1); // 🔁 Forsiraj rerender
    };
    const handleDodajLink = () => {
        setFormaStruktura(prev => ({
            ...prev,
            link: [...(prev.link || []), { text: '', url: 'https://' }]
        }));
    };
    const handleChangeLink = (index, field, value) => {
        setFormaStruktura(prev => {
            const updatedLinks = [...prev.link];
            updatedLinks[index] = {
                ...updatedLinks[index],
                [field]: value
            };
            return {
                ...prev,
                link: updatedLinks
            };
        });
    };
    const obrisiLink = (index) => {
        console.log('obrisiLink', index);
        setFormaStruktura(prev => {
            const updatedLinks = [...prev.link];
            updatedLinks.splice(index, 1);
            return {
                ...prev,
                link: updatedLinks
            }
        })
    }
    const saveChanges = async () => {
        const userId = localStorage.getItem('userId');
        const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/brend/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({forma: JSON.parse(localStorage.getItem('zakaziForma'))})
        })
        const data = await res.json();
        if (!res.ok) {
            toast.error('Greška prilikom čuvanja promena.');
            return;
        }

        toast.success('Promene su sačuvane!');

    }
    const [pcZoomed, setPcZoomed] = useState(false);
    const [phZoomed, setPhZoomed] = useState(false);
    const uvelicaj = (type) => {
        if (type === 'pc') {
            setPcZoomed(prev => !prev);

        } else {
            setPhZoomed(prev => !prev);
        }
    }







    return (
        <div className={styles.BrendPage}>
            <div className={styles.header}>
                <div className={styles.linkovi}>
                    {/*<a onClick={() => setDizajnObavestenja(true)}>Strana za zakazivanje</a>*/}
                    <span onClick={() => setShowStruktura(true)}>Struktura strane</span>
                    <span onClick={() => setShowLink(true)}>Link strane za zakazivanje</span>
                    {/*<a onClick={() => setDizajnObavestenja(false)}>Prilagodi obaveštenja</a>*/}
                </div>
                <button onClick={saveChanges} className={styles.button1}>Sačuvaj</button>
            </div>

            {dizajnObavestenja ? (
                <>
                    <div style={{ display: 'flex', gap: '10px', padding: '10px' }}>
                        <button onClick={() => {setSelectedDesign('default'); console.log(selectedDesign)}} className={styles.button2}>Default</button>
                        {/* <button onClick={() => setSelectedDesign('minimal')} className={styles.button2}>Minimal</button> */}
                    </div>
                    <div className={styles.content}>
                        <div className={styles.prikazDizajna}>
                            <div className={`${styles.pcDizajn} ${pcZoomed ? styles.zoomed : ''}`}>
                                <b onClick={() => uvelicaj('pc')}>Uveličaj</b>
                                <iframe
                                    key={`${selectedDesign}-${iframeKey}`}
                                    src={`/preview?design=${selectedDesign}`}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                />
                                <div className={pcZoomed ? styles.closeButton : styles.none} onClick={() => uvelicaj('pc')}>
                                    <i className="fa-regular fa-circle-xmark"></i>
                                </div>
                            </div>
                            <div className={`${styles.phDizajn} ${phZoomed ? styles.zoomed : ''}`}>
                                <b onClick={() => uvelicaj('ph')}>Uveličaj</b>
                                <iframe
                                    key={`${selectedDesign}-${iframeKey}`}
                                    src={`/preview?design=${selectedDesign}`}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                />
                                <div className={phZoomed ? styles.closeButton : styles.none} onClick={() => uvelicaj('ph')}>
                                    <i className="fa-regular fa-circle-xmark"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>asd</>
            )}

            {showLink && (
                <div className={styles.blur} onClick={() => setShowLink(false)}>
                    <div className={styles.linkDiv} onClick={e => e.stopPropagation()}>
                        <div className={styles.qr}>
                            <h3>QR kod za zakazivanje</h3>
                            <QRCodeSVG value={`https://mojtermin.site/zakazi/${localStorage.getItem('userId')}`} className={styles.qr} ref={qrRef} />
                            <button onClick={preuzmiQRCode} className={styles.copyBtn}>Preuzmi QR kod</button>
                        </div>

                        <div className={styles.copyWrapper}>
                            <span className={styles.linkText}>
                            {`https://mojtermin.site/zakazi/${localStorage.getItem('userId')}`}
                            </span>
                            <button
                            className={styles.copyBtn}
                            onClick={() => {
                                navigator.clipboard.writeText(`https://mojtermin.site/zakazi/${localStorage.getItem('userId')}`);
                                toast.success('Link je kopiran.')
                            }}
                            >
                            Kopiraj
                            </button>
                        </div>
                        <div className={styles.closeButton} onClick={() => setShowLink(false)}>
                            <i className="fa-regular fa-circle-xmark"></i>
                        </div>
                    </div>
                </div>
            )}

            {showStruktura && formaStruktura && (
                <div className={styles.blur} onClick={() => {setShowStruktura(false)}}>
                    <div className={styles.strukturaModal} onClick={e => e.stopPropagation()}>
                        <form className={styles.strukturaForm}>
                            <h3>Izaberi polja za formu</h3>
                            {Object.entries(formaStruktura)
                                .filter(([k, v]) => typeof v === 'boolean' && k !== 'logoFirme' && k !== 'nazivFirme' && k !== 'email')
                                .map(([field, value]) => {
                                    const isLokacijaLocked = (paket === 'Personalni' || paket === 'Osnovni') && field === 'lokacija';

                                    return (
                                    <label
                                        key={field}
                                        className={`${styles.strukturaLabel} ${isLokacijaLocked ? styles.lockedField : ''}`}
                                    >
                                        <input
                                        type="checkbox"
                                        checked={!!value}
                                        onChange={() => handleCheckboxChange(field)}
                                        disabled={isLokacijaLocked}
                                        />
                                        {labelMap[field] || field}
                                        {isLokacijaLocked && (
                                        <i className="fa-solid fa-lock" style={{ marginLeft: '6px', color: '#ff4d4f' }} />
                                        )}
                                    </label>
                                    );
                                })}
                            <h3>Header</h3>
                            <label className={styles.strukturaLabel}>
                                <input
                                    type="checkbox"
                                    checked={!!formaStruktura.nazivFirme}
                                    onChange={() => handleCheckboxChange('nazivFirme')}
                                />
                                Naziv firme
                            </label>
                            <label className={styles.strukturaLabel}>
                                <input
                                    type="checkbox"
                                    checked={!!formaStruktura.logoFirme}
                                    onChange={() => handleCheckboxChange('logoFirme')}
                                />
                                Logo firme
                            </label>
                           {Array.isArray(formaStruktura?.link) && formaStruktura.link.length > 0 ? (
                                formaStruktura.link.map((item, index) => (
                                    <div key={index} className={styles.linkItem}>
                                        <input
                                            type="text"
                                            value={item.text}
                                            placeholder="Tekst"
                                            className={styles.linkInput}
                                            onChange={(e) => handleChangeLink(index, 'text', e.target.value)}
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={item.url}
                                            placeholder="URL"
                                            className={styles.linkInput}
                                            onChange={(e) => handleChangeLink(index, 'url', e.target.value)}
                                            required
                                        />
                                        <div className={styles.obrisi} onClick={() => obrisiLink(index)}>
                                            <i className="fa-regular fa-trash-can"></i>
                                        </div>
                                    </div>
                                ))
                                ) : (
                                <p>Nema linkova</p>
                            )}
                            <a onClick={handleDodajLink} >Dodaj link</a>
                        </form>
                        <div className={styles.strukturaDugmad}>
                            <button className={styles.button1} onClick={handleSacuvajStrukturu} type="button">
                                Premeni
                            </button>
                            <button className={styles.button2} onClick={handleOtkazi} type="button">
                                Otkaži
                            </button>
                        </div>
                        <div className={styles.closeButton} onClick={handleOtkazi}>
                            <i className="fa-regular fa-circle-xmark"></i>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
}
