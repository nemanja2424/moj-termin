'use client';
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function PotvrdiPage() {
    const { id, token, idZaposlenog } = useParams();
    const [terminPotvrdjen, setTerminPotvrdjen] = useState(null);
    
    
    const potvrdiTermin = async () => {
        const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazivanja/${token}/xrdcytfuvgbhjnkjhbgvyftucdyrxtsezxrdcytfuvy`, {
            body: JSON.stringify(idZaposlenog)
        })

        if (!res) {
            setTerminPotvrdjen(false);
            return;
        }
        setTerminPotvrdjen(true);
        
    }

    return(
        <main style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',width:'100%',
            backgroundColor: terminPotvrdjen === true ? 'green' : 'red'
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
            {terminPotvrdjen ? (<h3>Uspešno ste potvrdili termin</h3>) : (<><h3>Termin nije potvrđen, probajte ručno.</h3><a href="/panel/termini">Korisnički panel</a></>)}

        </main>
    )
}