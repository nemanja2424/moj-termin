"use client";
import styles from "../panel.module.css";
import stylesLocal from "./Termini.module.css"
import Kalendar from "../components/Kalendar";
import Tabela from "../components/Tabela";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function PanelPage() {
  const router = useRouter();
  const [showTabela, setShowTabela] = useState(false);
  const [desavanjaData, setDesavanjaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canRefresh, setCanRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      console.error("Nedostaje userId ili authToken u localStorage.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazivanja/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Greška pri dohvatanju podataka.");
      }

      const data = await response.json();

      const allEvents = data.zakazano.flat().map((item) => ({
        ...item,
        datum: item.datum_rezervacije,
        potvrdio_user: item.potvrdio_user || {},
      })).sort((a, b) => a.vreme_rezervacije.localeCompare(b.vreme_rezervacije));

      setDesavanjaData(allEvents);
    } catch (error) {
      console.error("Greška:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 3600000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const izmeniTermin = (event) => {
    const userId = localStorage.getItem("userId");
    router.push(`/zakazi/${userId}/izmeni/${event.token}`)
  }

  const handleRefreshClick = () => {
    if (!canRefresh || loading) return;
    setCanRefresh(false);
    fetchData();
    setTimeout(() => setCanRefresh(true), 5000); // 2 sekunde cooldown
  };

  return (
    <div className={styles.child}>
      <div className={stylesLocal.header}>
        <h1>Termini</h1>
        <div style={{display:'flex',alignItems:'center',gap:'15px'}}>
            <i
              className={`fa-solid fa-arrows-rotate refreshSpin${loading ? ' loading' : ''}`}
              onClick={handleRefreshClick}
              style={{
                cursor: canRefresh && !loading ? 'pointer' : 'not-allowed',
                opacity: canRefresh && !loading ? 1 : 0.5,
              }}
            />
          <button className={stylesLocal.btn} onClick={() => setShowTabela(prev => !prev)}>{showTabela ? "Kalendar" : "Tabela" }</button>
        </div>
      </div>
      {showTabela
        ? <Tabela desavanjaData={desavanjaData} fetchData={fetchData} loading={loading} izmeniTermin={izmeniTermin} />
        : <Kalendar desavanjaData={desavanjaData} fetchData={fetchData} loading={loading} izmeniTermin={izmeniTermin} />
      }
    </div>
  );
}