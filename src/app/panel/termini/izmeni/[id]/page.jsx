// app/panel/termini/izmeni/[id]/page.jsx
'use client';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function IzmenaTerminaPage() {
  const { id } = useParams(); // dobijaš ID iz URL-a
  const [termin, setTermin] = useState(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    const fetchTermin = async () => {
      try {
        const res = await fetch(`https://mojtermin.site/api/termin/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await res.json();
        setTermin(data);
      } catch (err) {
        console.error("Greška pri dohvatanju termina:", err);
      }
    };

    fetchTermin();
  }, [id]);

  if (!termin) return <p>Učitavanje termina...</p>;

  return (
    <div>
      <h1>Izmeni Termin #{id}</h1>
      <p>Ime: {termin.ime}</p>
      <p>Datum: {termin.datum_rezervacije}</p>
      {/* Ovde ide forma za izmenu */}
    </div>
  );
}
