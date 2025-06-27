"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./panel.module.css";

export default function DashboardPage() {
  const [sviTermini, setSviTermini] = useState([]);
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [canRefresh, setCanRefresh] = useState(true); // dodaj cooldown state

  const fetchDashboardData = async () => {
    setLoading(true); // pokreni loading
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      console.error("Nedostaje userId ili authToken u localStorage.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazivanja/${userId}`,
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
    } finally {
      setLoading(false); // zaustavi loading
    }
  };

  // Cooldown handler
  const handleRefreshClick = () => {
    if (!canRefresh || loading) return;
    setCanRefresh(false);
    fetchDashboardData();
    setTimeout(() => setCanRefresh(true), 5000); // 2 sekunde cooldown
  };

  useEffect(() => {
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
    <div style={{ width: "100%" }} className={styles.child}>
      <div></div>
      <div className={styles.noviTermini}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          <h2>Nova zakazivanja</h2>
          <i
            className={`fa-solid fa-arrows-rotate refreshSpin${
              loading ? " loading" : ""
            }`}
            onClick={handleRefreshClick}
            style={{
              cursor: canRefresh && !loading ? "pointer" : "not-allowed",
              opacity: canRefresh && !loading ? 1 : 0.5,
            }}
          />
        </div>
        {sviTermini.length > 0 ? (
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
                {sviTermini
                  .filter((event) => event.otkazano !== true)
                  .slice(0, 20)
                  .map((event, index) => (
                    <tr key={index}>
                      <td>{event.ime}</td>
                      <td>{event.datum_rezervacije}</td>
                      <td>{event.vreme_rezervacije}</td>
                      <td>{event.duzina_termina || "-"}</td>
                      <td>
                        <a href={`tel:${event.telefon}`}>{event.telefon || "-"}</a>
                      </td>
                      <td>
                        <a href={`mailto:${event.email}`}>{event.email || "-"}</a>
                      </td>
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
