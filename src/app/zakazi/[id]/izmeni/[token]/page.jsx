'use client';
import Footer from "@/components/Footer";
import DefaultDesign from "@/components/dizajn/Default";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";


export default function IzmeniZakaziPage() {
    const { id, token } = useParams();
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
    }

    useEffect(() => {
        fetchData();
    }, []);

    const [localhost, setLocalHost] = useState(false);
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

        console.log('Form data:', podaci, id);


        
        const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podaci, id, token })
        });

        if(!res.ok) {
        toast.error('Greška prilikom zakazivanja.');
        return;
        }

        toast.success(res.app_response);

    };


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
            />
            <Footer />
            <ToastContainer />
        </>
    )
}