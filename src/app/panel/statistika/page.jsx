"use client";

import { useEffect, useState } from "react";

export default function StatistikaPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistika = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        if (!userId || !authToken) {
          throw new Error("Nedostaju podaci za autentifikaciju");
        }

        const response = await fetch(
          `https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazivanja/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Greška prilikom učitavanja");
        }

        const result = await response.json();

        // 🔥 BITNO
        const allAppointments = Array.isArray(result.zakazano)
          ? result.zakazano.flat()
          : [];

        setAppointments(allAppointments);
      } catch (err) {
        setError(err.message || "Nepoznata greška");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistika();
  }, []);

  if (loading) return <main>Učitavanje...</main>;
  if (error) return <main>Greška: {error}</main>;

  return (
    <main style={{ padding: "1rem" }}>
      <h1>Statistika zakazivanja</h1>

      <p>
        Ukupan broj termina: <strong>{appointments.length}</strong>
      </p>

      <h2>Poslednjih 5 termina</h2>
      <ul>
        {appointments.slice(0, 5).map((t) => (
          <li key={t.id}>
            {t.datum_rezervacije} u {t.vreme_rezervacije} – {t.lokacija?.ime}
          </li>
        ))}
      </ul>
    </main>
  );
}
