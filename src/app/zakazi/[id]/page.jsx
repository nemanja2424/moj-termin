'use client';
import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { useParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import DefaultDesign from "@/components/dizajn/Default";
import ModernDesign from "@/components/dizajn/Modern";
import MinimalDesign from "@/components/dizajn/Minimal";

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
    const [loadingSpin, setLoadingSpin] = useState(false);
    const [prebukiran, setPrebukiran] = useState(false);

    const fetchData = async () => {
        const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazi/${id}/forma`);
        if (!res.ok) {
            toast.error('Greška prilikom učitavanja podataka');
            console.log(res);
            return;
        }

        const data = await res.json();
        setForma(data.forma);
        setPreduzece(data);

        if (data.paket === "Personalni"){
            // === Zakazano ovog meseca ===
            const today = new Date();
            const currentMonth = today.getMonth(); // 0-based
            const currentYear = today.getFullYear();
    
            let zakazano = 0;
    
            (data?.lokacije || []).forEach((lokacija) => {
                (lokacija?.zauzeti_termini || []).forEach((termin) => {
                    const datum = termin?.datum_rezervacije;
                    if (!datum) return;
    
                    const mesecGodina = datum.slice(0, 7); // 'YYYY-MM'
                    const danasnjiMesecGodina = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    
                    if (mesecGodina === danasnjiMesecGodina) {
                    zakazano++;
                    }
                });
            });
            if (zakazano >= 20) {
                setPrebukiran(true);
            }
        }
        
    };


    useEffect(() => {
        fetchData();
    }, []);

    const [localhost, setLocalHost] = useState(false);
    const handleSubmit = async (e) => {
        let userId = localStorage.getItem('userId') || "0"; // za potvrdio, ako postoji
        e.preventDefault();
        setLoadingSpin(true);

        // Izračunaj datum iz formData
        const odabranDatum = `${formData.godina}-${String(Number(formData.mesec) + 1).padStart(2, '0')}-${String(formData.dan).padStart(2, '0')}`;

        const podaci = {
            ...formData,
            datum_rezervacije: odabranDatum,
        };
        const url = localhost
            ? 'https://mojtermin.site/api/zakazi'
            : 'https://mojtermin.site/api/zakazi';

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ podaci, id, userId })
            });

            if(!res.ok) {
                toast.error('Greška prilikom zakazivanja.');
                return;
            }

            const data = await res.json();
            toast.success(data.app_response || 'Uspešno zakazano!');
            fetchData();
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingSpin(false);
        }
    };

  return (
    <>
        {forma.izgled === "default" && (
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
                loadingSpin={loadingSpin}
            />
        )}
        {forma.izgled === "modern" && (
            <ModernDesign
                forma={forma}
                setForma={setForma}
                preduzece={preduzece}
                setPreduzece={setPreduzece}
                formData={formData}
                setFormData={setFormData}
                id={id}
                handleSubmit={handleSubmit}
                tipUlaska={1}
                loadingSpin={loadingSpin}
            />
        )}
        {forma.izgled === "minimal" && (
            <MinimalDesign
                forma={forma}
                setForma={setForma}
                preduzece={preduzece}
                setPreduzece={setPreduzece}
                formData={formData}
                setFormData={setFormData}
                id={id}
                handleSubmit={handleSubmit}
                tipUlaska={1}
                loadingSpin={loadingSpin}
            />
        )}
        <Footer />
        <ToastContainer />

        {prebukiran && (
            <div className="blur">
                <div 
                    style={{width:'300px',maxWidth:'80%',backgroundColor:'white',border:'2px solid lightgray',borderRadius:'20px',
                        height:'200px',display:'flex',justifyContent:'center',alignItems:'center',textAlign:'center'   
                    }}
                >
                    <h3>{preduzece.ime_preduzeca} je prebukiran ovog meseca.</h3>
                </div>
            </div>
        )}
    </>
  );
}