"use client";
import styles from "./panel.module.css";
import { useEffect, useState, useRef } from "react";

export default function DashboardPage() {
  const [sviTermini, setSviTermini] = useState([]);
  const scrollRef = useRef(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        console.error("Nedostaje userId ili authToken u localStorage.");
        return;
      }

      try {
        const response = await fetch(
          `https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazivanja/${userId}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Greška pri dohvatanju podataka.");
        }

        const data = await response.json();
        const kombinovaniTermini = data.zakazano.flat();

        kombinovaniTermini.sort((a, b) => b.id - a.id);

        setSviTermini(kombinovaniTermini);
      } catch (error) {
        console.error("Greška:", error);
      }
    };

    fetchDashboardData();
  }, []);



  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.deltaX !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaX;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <div className="mojePreduzece">
        
      </div>

      <div className={styles.noviTermini}>
        <h2>Nova zakazivanja</h2>
        { sviTermini.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ime</th>
                  <th>Datum</th>
                  <th>Vreme</th>
                  <th>Trajanje</th>
                  <th>Telefon</th>
                  <th>Email</th>
                  <th>Opis</th>
                </tr>
              </thead>
              <tbody>
                {sviTermini.map((event, index) => (
                  <tr key={index}>
                    <td>{event.ime}</td>
                    <td>{event.datum_rezervacije}</td>
                    <td>{event.vreme_rezervacije}</td>
                    <td>{event.duzina_termina || "-"}</td>
                    <td><a href={`tel:${event.telefon}`}>{event.telefon || "-"}</a></td>
                    <td><a href={`mailto:${event.email}`}>{event.email || "-"}</a></td>
                    <td className={styles.opis}>{event.opis || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : sviTermini.length === 0 ? (
          <p>Nema zakazanih termina</p>
        ) : (
          <h2>Učitavanje...</h2>
        )}
      </div>
    </div>
  );
}
