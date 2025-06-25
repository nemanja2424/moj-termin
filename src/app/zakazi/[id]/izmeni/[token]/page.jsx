'use client';
import Footer from "@/components/Footer";
import DefaultDesign from "@/components/dizajn/Default";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";


export default function IzmeniZakaziPage() {
    const router = useRouter();
    const { id, token } = useParams();
    //Tip ulaska = 1 je za zakazivanje, 2 je za izmenu za korisnika, 3 je za izmenu za preduzece
    const [tipUlaska, setTipUlaska] = useState(2); 
    const [forma, setForma] = useState({}); // froma = objekat u preduzece
    const [preduzece, setPreduzece] = useState({}); //preduzece = objekat koji ima {forma} i ostale podatke
    const today = new Date();
    const [formData, setFormData] = useState({ // formData = podaci termina (termin)
        ime: '',
        email: '',
        telefon: '+381',
        trajanje: '1h',
        lokacija: '',
        vreme: '',
        dan: '',
        mesec: today.getMonth(),
        godina: today.getFullYear(),
        opis: ''
    });
    const [stariPodaci, setStariPodaci] = useState({}); // stariPodaci se koriste za mejl za zaposlene
    const [loadingSpin, setLoadingSpin] = useState(false);
    const [loadingSpinOtkaz, setLoadingSpinOtkaz] = useState(false);
    const [loadingSpinPotvrda, setLoadingSpinPotvrda] = useState(false);
    

    const fetchData = async () => {
        const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazi/${id}/izmena/${token}`);
        if (!res.ok) {
            if (res.status === 404) {
                toast.error('Termin ne postoji.');
                return;
            }
            toast.error('Greška prilikom učitavanja podataka');
            console.log(res);
            return;
        }
        const data = await res.json();
        setPreduzece(data.preduzece);
        setForma(data.preduzece.forma);

        let termin = { ...data.termin };
        if (termin.datum_rezervacije) {
            const [godina, mesec, dan] = termin.datum_rezervacije.split('-');
            termin.godina = Number(godina);
            termin.mesec = Number(mesec) - 1; // mesec je 0-indeksiran u JS
            termin.dan = Number(dan);
        }
        if (termin.duzina_termina) {termin.trajanje = termin.duzina_termina}
        if(termin.vreme_rezervacije) {termin.vreme = termin.vreme_rezervacije}
        if(termin.ime_firme) {termin.lokacija = termin.ime_firme}
        setFormData(termin);
        setStariPodaci(termin);
    }

    useEffect(() => {
        fetchData();
        const authToken = localStorage.getItem('authToken');
        if (authToken) {setTipUlaska(3)}
    }, []);

    const [localhost, setLocalHost] = useState(true);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const odabranDatum = `${formData.godina}-${String(Number(formData.mesec) + 1).padStart(2, '0')}-${String(formData.dan).padStart(2, '0')}`;
        const podaci = {
        ...formData,
        datum_rezervacije: odabranDatum,
        };
        const url = localhost
        ? 'http://127.0.0.1:5000/api/zakazi/izmena'
        : 'https://mojtermin.site/api/zakazi/izmena';

        console.log('Form data:', podaci, id, token, stariPodaci);

        setLoadingSpin(true);
        try{
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ podaci, id, token, tipUlaska, stariPodaci })
            });

            if(!res.ok) {
                toast.error('Greška prilikom zakazivanja.');
                return;
            }

            toast.success("Uspešno ste izmenili termin.");
            fetchData();
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingSpin(false);
        }
    };

    const handleOtkazi = async (e) => {
        e.preventDefault();
        const odabranDatum = `${formData.godina}-${String(Number(formData.mesec) + 1).padStart(2, '0')}-${String(formData.dan).padStart(2, '0')}`;
        const podaci = {
            ...formData,
            datum_rezervacije: odabranDatum,
        };
        const url = localhost
        ? 'http://127.0.0.1:5000/api/zakazi/otkazi'
        : 'https://mojtermin.site/api/zakazi/otkazi';

        setLoadingSpinOtkaz(true);
        try {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ podaci, id, token, tipUlaska })
        });


        if (!res.ok) {
            toast.error('Greška prilikom otkazivanja termina.');
            return;
        }
        
        toast.success('Uspešno ste otkazali termin.');
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingSpinOtkaz(false);
        }
    }

    const potvrdiTermin = async (termin) => {
        setLoadingSpinPotvrda(true);
        try {
        const authToken = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        termin.potvrdio = userId;
        const res = await fetch("https://mojtermin.site/api/potvrdi_termin", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ termin, authToken })
        });
        const data = await res.json();

        if (!res.ok) {
        toast.error(data.message);
        return;
        }

        toast.success("Potvrdili ste termin.");
        fetchData();
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingSpinPotvrda(false);
        }
    }

    return (
        <>
            <DefaultDesign
                forma={forma}
                setForma={setForma}
                preduzece={preduzece}
                setPreduzece={setPreduzece}
                formData={formData}
                setFormData={setFormData}
                id={id}
                token={token}
                handleSubmit={handleSubmit}
                tipUlaska={tipUlaska}
                handleOtkazi={handleOtkazi}
                potvrdiTermin={potvrdiTermin}
                loadingSpin={loadingSpin}
                loadingSpinOtkaz={loadingSpinOtkaz}
                loadingSpinPotvrda={loadingSpinPotvrda}
            />
            <Footer />
            <ToastContainer />
        </>
    )
}