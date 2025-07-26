"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import styles from "./panel.module.css";
import Tabela from "./components/Tabela";
import useLogout from "@/hooks/useLogout";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);


export default function DashboardPage() {
  const logout = useLogout();

  const [sviTermini, setSviTermini] = useState([]);
  const [vlasnik, setVlasnik] = useState({});
  const [korisnik, setKorisnik] = useState({});
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [canRefresh, setCanRefresh] = useState(true);
  const [resetFiltersKey, setResetFiltersKey] = useState(0); // za reset filtera
  const danas = new Date();
  danas.setHours(0, 0, 0, 0);

  const fetchDashboardData = async () => {
    setLoading(true);
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");


    try {
      const response = await fetch(
        `https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/auth/me/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        if (data && data.code === "ERROR_CODE_UNAUTHORIZED") {
          logout();
          return;
        }
        throw new Error("Greška u dohvatanju podataka.");
      }


      const kombinovaniTermini = data.zakazano.flat().map(item => ({
        ...item,
        datum: item.datum_rezervacije, // Dodaj polje datum
        potvrdio_user: item.potvrdio_user || {},
      }));

      kombinovaniTermini.sort((a, b) => b.id - a.id);

      setSviTermini(kombinovaniTermini);
      setVlasnik(data.vlasnik);
      setKorisnik(data.korisnik)
    } catch (error) {
      console.error("Greška:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshClick = () => {
    if (!canRefresh || loading) return;
    setCanRefresh(false);
    fetchDashboardData();
    setTimeout(() => setCanRefresh(true), 5000);
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

  const izmeniTermin = (event) => {
    console.log("Kliknut termin:", event);
  };



  function getLast7DaysChartData(termini) {
    const dani = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
    const danas = new Date();
    const poslednjih7 = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(danas.getDate() - i);
      const datumStr = d.toISOString().split("T")[0];
      poslednjih7.push({
        datum: datumStr,
        dan: dani[d.getDay()],
        broj: 0,
      });
    }

    for (const termin of termini) {
      const terminDatum = termin.datum.split("T")[0];
      const dan = poslednjih7.find(d => d.datum === terminDatum);
      if (dan) {
        dan.broj++;
      }
    }

    return {
      labels: poslednjih7.map(d => d.dan),
      datasets: [
        {
          label: 'Broj termina',
          data: poslednjih7.map(d => d.broj),
          backgroundColor: '#3b82f6',
          borderRadius: 6,
        },
      ],
    };
  }
  function getThisWeekChartData(termini) {
    const dani = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
    const danas = new Date();

    // 1. Pronađi ponedeljak ove nedelje
    const dayOfWeek = danas.getDay(); // 0 (nedelja) do 6 (subota)
    const monday = new Date(danas);
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    monday.setDate(danas.getDate() + diffToMonday);

    // 2. Pripremi dane od ponedeljka do nedelje
    const nedeljniDani = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const datumStr = d.toISOString().split("T")[0];

      nedeljniDani.push({
        datum: datumStr,
        dan: dani[d.getDay()],
        broj: 0,
      });
    }

    // 3. Prebroj termine koji spadaju u ovu nedelju
    for (const termin of termini) {
      const terminDatum = termin.datum.split("T")[0];
      const dan = nedeljniDani.find(d => d.datum === terminDatum);
      if (dan) {
        dan.broj++;
      }
    }

    return {
      labels: nedeljniDani.map(d => d.dan),
      datasets: [
        {
          label: 'Termini ove nedelje',
          data: nedeljniDani.map(d => d.broj),
          backgroundColor: '#3b82f6',
          borderRadius: 6,
        },
      ],
    };
  }
  const terminiDanas = useMemo(() => {
    return sviTermini.filter((termin) => {
      const terminDatum = new Date(termin.datum); // prilagodi svojstvu sa datumom
      terminDatum.setHours(0, 0, 0, 0);
      return terminDatum.getTime() === danas.getTime();
    });
  }, [sviTermini]);
  const brojNepotvrdjenih = useMemo(() => {
    return sviTermini.filter(termin => termin.potvrdio === 0).length;
  }, [sviTermini]);
  const prosecnoTerminaDnevno = useMemo(() => {
    const danas = new Date();
    danas.setHours(0, 0, 0, 0);

    const sedamDanaUnazad = new Date(danas);
    sedamDanaUnazad.setDate(danas.getDate() - 6); // poslednjih 7 dana uključujući danas
    // Prosečno po danu
    return (sviTermini.length / 7).toFixed(1);
  }, [sviTermini]);
  const procenatOtkazanih = useMemo(() => {
    if (sviTermini.length === 0) return "0%";

    const brojOtkazanih = sviTermini.filter(termin => termin.otkazano === true).length;

    const procenat = (brojOtkazanih / sviTermini.length) * 100;
    return `${procenat.toFixed(1)}%`;
  }, [sviTermini]);
  const prosecnoTerminaPoMesecu = useMemo(() => {
    if (sviTermini.length === 0) return "0.0";

    const mesecnaGrupa = {};

    for (const termin of sviTermini) {
      const datum = new Date(termin.datum);
      const kljuc = `${(datum.getMonth() + 1).toString().padStart(2, '0')}/${datum.getFullYear()}`;

      if (!mesecnaGrupa[kljuc]) {
        mesecnaGrupa[kljuc] = 0;
      }

      mesecnaGrupa[kljuc]++;
    }

    const brojMeseci = Object.keys(mesecnaGrupa).length;
    const ukupanBrojTermina = Object.values(mesecnaGrupa).reduce((a, b) => a + b, 0);

    const prosek = ukupanBrojTermina / brojMeseci;

    return prosek.toFixed(1);
  }, [sviTermini]);
  const najcesceVremeZakazivanja = useMemo(() => {
    if (sviTermini.length === 0) return "-";

    const satCount = {};

    sviTermini.forEach(termin => {
      const date = new Date(termin.datum);
      const sat = date.getHours();

      satCount[sat] = (satCount[sat] || 0) + 1;
    });

    // Nađi sat sa najvećim brojem termina
    let maxSat = null;
    let maxCount = 0;

    for (const [sat, count] of Object.entries(satCount)) {
      if (count > maxCount) {
        maxCount = count;
        maxSat = sat;
      }
    }

    // Formatiraj sat u čitljiv oblik, npr. "14:00 - 15:00"
    if (maxSat !== null) {
      const start = `${maxSat.padStart(2, '0')}:00`;
      const end = `${(parseInt(maxSat) + 1).toString().padStart(2, '0')}:00`;
      return `${start} - ${end}`;
    }

    return "-";
  }, [sviTermini]);



  return (
    <div style={{ width: "100%" }} className={styles.child}>
      <div className={styles.prvaSekcija}>
        <div className={styles.sekcija30}>
          <div className={`${styles.stavka2}`}>
            <div className={styles.logoDiv}>
              <img src={vlasnik.putanja_za_logo} alt="Logo" />
            </div>
            <div>
              <h2>{vlasnik?.ime_preduzeca || "Preduzece"}</h2>
              <p>{korisnik.username}</p>
            </div>
          </div>
          <div className={styles.stavka}>
            <div>
              <strong>Ukupno termina</strong>  
              <h2>{sviTermini.length}</h2>
            </div>

            <div>
              <strong>Broj termina danas</strong>
              <h2>{terminiDanas.length}</h2>
            </div>

            <div>
              <strong>Nepotvrđeni termini</strong>
              <h2>{brojNepotvrdjenih}</h2>
            </div>

            <div>
              <strong>Dnevni prosek</strong>
              <h2>{prosecnoTerminaDnevno}</h2>
            </div>
            <div>
              <strong>Mesečni prosek</strong>
              <h2>{prosecnoTerminaPoMesecu}</h2>
            </div>
            <div>
              <strong>Otkazani termini</strong>
              <h2>{procenatOtkazanih}</h2>
            </div>

          </div>
        </div>

        <div className={styles.chartbar}>
            <Bar
              data={getThisWeekChartData(sviTermini)}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Termini za tekuću nedelju',
                    font: {
                      size: 16,
                    },
                    padding: {
                      top: 10,
                      bottom: 20,
                    },
                    color: '#111',
                  },
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
        </div>
      </div>


      <div className={styles.noviTermini}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 10px",
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
        <Tabela
          desavanjaData={sviTermini.slice(0, 20)}
          fetchData={fetchDashboardData}
          loading={loading}
          izmeniTermin={izmeniTermin}
          showFilters={false}
          resetFiltersKey={resetFiltersKey}
          dashboard={true}
        />
      </div>
    </div>
  );
}
