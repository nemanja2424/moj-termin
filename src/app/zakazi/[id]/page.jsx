'use client';
import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import DefaultDesign from "@/components/dizajn/Default";
import { useParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

export default function ZakaziPage() {
    const { id } = useParams();
    const [forma, setForma] = useState({});
    const [preduzece, setPreduzece] = useState({});
    const today = new Date();
    const [formData, setFormData] = useState({
        ime: '',
        prezime: '',
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
        const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazi/${id}/forma`);
        if (!res.ok) {
        toast.error('Greška prilikom učitavanja podataka');
        console.log(res);
        }
        const data = await res.json();
        setForma(data.forma);
        setPreduzece(data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const [localhost, setLocalHost] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Izračunaj datum iz formData
        const odabranDatum = `${formData.godina}-${String(Number(formData.mesec) + 1).padStart(2, '0')}-${String(formData.dan).padStart(2, '0')}`;

        const podaci = {
            ...formData,
            datum_rezervacije: odabranDatum,
        };
        const url = localhost
            ? 'http://127.0.0.1:5000/api/zakazi'
            : 'https://mojtermin.site/api/zakazi';

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ podaci, id })
        });

        if(!res.ok) {
            toast.error('Greška prilikom zakazivanja.');
            return;
        }

        const data = await res.json();
        toast.success(data.app_response || 'Uspešno zakazano!');
        fetchData();
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
            handleSubmit={handleSubmit}
            tipUlaska={1}
        />
        <Footer />
        <ToastContainer />
    </>
  );
}