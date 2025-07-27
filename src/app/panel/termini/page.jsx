"use client";
import styles from "../panel.module.css";
import stylesLocal from "./Termini.module.css"
import Kalendar from "../components/Kalendar";
import Tabela from "../components/Tabela";
import { useEffect, useState, useCallback } from "react";
import useLogout from "@/hooks/useLogout";

export default function PanelPage() {
  const logout = useLogout();
  const [showTabela, setShowTabela] = useState(false);
  const [desavanjaData, setDesavanjaData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canRefresh, setCanRefresh] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [resetFiltersKey, setResetFiltersKey] = useState(0);

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
      const data = await response.json();

      if (!response.ok) {
        if (data && data.code === "ERROR_CODE_UNAUTHORIZED") {
          logout();
          return;
        }
        throw new Error("Greška pri dohvatanju podataka.");
      }


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
    const url = `/zakazi/${userId}/izmeni/${event.token}`;
    window.open(url, "_blank");
  };

  const handleRefreshClick = () => {
    if (!canRefresh || loading) return;
    setCanRefresh(false);
    fetchData();
    setTimeout(() => setCanRefresh(true), 5000); // 2 sekunde cooldown
  };

  const handleFilterToggle = () => {
    setShowFilters(prev => {
      if (prev) setResetFiltersKey(k => k + 1); // resetuj filtere kad se zatvara
      return !prev;
    });
  };

  return (
    <div className={styles.child}>
      <div className={stylesLocal.header}>
        <h1>Termini</h1>
        <div style={{display:'flex',alignItems:'center',gap:'15px'}}>
          {showTabela && (
            <>
            {!showFilters ? (
              <i
              className="fa-solid fa-filter" 
              onClick={handleFilterToggle}
              style={{cursor:'pointer'}}
              />
            ) : (
              <i
              className="fa-solid fa-filter-circle-xmark"
               onClick={handleFilterToggle}
              style={{cursor:'pointer'}}
              />
            )}
            
            </>
          )}
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
        ? <Tabela desavanjaData={desavanjaData} fetchData={fetchData} loading={loading} izmeniTermin={izmeniTermin} showFilters={showFilters} resetFiltersKey={resetFiltersKey}/>
        : <Kalendar desavanjaData={desavanjaData} fetchData={fetchData} loading={loading} izmeniTermin={izmeniTermin} />
      }
    </div>
  );
}