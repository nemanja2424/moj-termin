'use client';
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function PotvrdiPage() {
    const { id, token, idZaposlenog } = useParams();
    const [terminPotvrdjen, setTerminPotvrdjen] = useState(null);
    
    
    const potvrdiTermin = async () => {
        try {
            const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazivanja/${token}/xrdcytfuvgbhjnkjhbgvyftucdyrxtsezxrdcytfuvy`, {
                method: "PATCH", // ili PUT, PATCH ako je drugačije specificirano
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({id: idZaposlenog})
            });

            if (!res.ok) {
                setTerminPotvrdjen(false);
                return;
            }

            setTerminPotvrdjen(true);
        } catch (error) {
            console.error("Greška prilikom potvrđivanja termina:", error);
            setTerminPotvrdjen(false);
        }
    };


    useEffect(() => {
        potvrdiTermin();
    }, []);

    return(
        <main style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            color: "white",
            backgroundColor: terminPotvrdjen === true ? 'green' : terminPotvrdjen === false ? 'red' : undefined
        }}>
            {terminPotvrdjen === null && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px'
                }}>
                    <div className="spinner"></div>
                </div>
            )}
            {terminPotvrdjen && (<h3>Uspešno ste potvrdili termin</h3>)}
            {terminPotvrdjen === false && (<><h3>Termin nije potvrđen, probajte ručno.</h3><a href="/panel/termini"> Korisnički panel</a></>)}
        </main>
    )
}