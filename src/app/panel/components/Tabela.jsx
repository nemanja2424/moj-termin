import { useEffect, useState } from "react";
import styles from "./Tabela.module.css";
import { toast, ToastContainer } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";  
import { reactMaxHeadersLength } from "../../../../next.config";


export default function Tabela({ desavanjaData, fetchData, loading, izmeniTermin, showFilters, resetFiltersKey, dashboard }) {
  const [desavanja, setDesavanja] = useState([]);
  const [rola, setRola] = useState(null); //1 = vlasnik; 2 = korisnik; Eventualno 3 = admin
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [lokacijaFilter, setLokacijaFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');


  useEffect(() => {
      if (desavanjaData && desavanjaData.length > 0) {
          const sortirano = [...desavanjaData].sort((a, b) => b.id - a.id);
          setDesavanja(sortirano);
      }
      let rolaInt = localStorage.getItem('rola');
      setRola(rolaInt);
  }, [desavanjaData]);

    
  const potvrdiTermin = async (termin) => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    termin.potvrdio = userId;
    const res = await fetch("http://127.0.0.1:5000/api/potvrdi_termin", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ termin, authToken })
    });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("Potvrdili ste termin.");
    fetchData();
  };

  function formatirajDatum(datum) {
    if (!datum) return '';
    const [godina, mesec, dan] = datum.split('-');
    return `${dan}.${mesec}.${godina}`;
  }
  function formatirajTimestamp(timestamp) {
    if (!timestamp) return '';

    const date = new Date(timestamp);

    const dan = String(date.getDate()).padStart(2, '0');
    const mesec = String(date.getMonth() + 1).padStart(2, '0'); // meseci su 0-based
    const godina = date.getFullYear();

    const sati = String(date.getHours()).padStart(2, '0');
    const minuti = String(date.getMinutes()).padStart(2, '0');

    return `${dan}.${mesec}.${godina} ${sati}:${minuti}`;
  }


  useEffect(() => {
    let sortirano = [...desavanjaData];

    if (sortKey) {
      sortirano.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        // Ako je datum, obradi posebno
        if (sortKey === 'datum') {
          valA = new Date(valA);
          valB = new Date(valB);
        } else if (sortKey === 'lokacija') {
          valA = a.lokacija?.ime || '';
          valB = b.lokacija?.ime || '';
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Defaultno po ID
      sortirano.sort((a, b) => b.id - a.id);
    }

    setDesavanja(sortirano);
  }, [desavanjaData, sortKey, sortOrder]);

  function handleSort(key) {
    if (sortKey === key) {
      // Ako opet klikneš na isto polje obrni redosled
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  }

  const filtriranaDesavanja = desavanja.filter(event => {
    let statusOk = true;
    let datumOk = true;
    let lokacijaOk = true;
    let createdOk = true;

    // Filtriranje po statusu
    if (statusFilter === 'nije_potvrdjen') {
      statusOk = event.potvrdio === 0 && !event.otkazano;
    } else if (statusFilter === 'potvrdjen') {
      statusOk = event.potvrdio !== 0 && !event.otkazano;
    } else if (statusFilter === 'otkazan') {
      statusOk = event.otkazano;
    }

    // Filtriranje po datumu
    if (dateFrom) {
      datumOk = event.datum >= dateFrom;
    }
    if (datumOk && dateTo) {
      datumOk = event.datum <= dateTo;
    }

    // Filtriranje po lokaciji
    if (lokacijaFilter) {
      lokacijaOk = String(event.ime_firme) === lokacijaFilter;
    }

    // Created_at filter
    let createdDate = '';
    if (event.created_at) {
      if (typeof event.created_at === 'string') {
        createdDate = event.created_at.split('T')[0];
      } else {
        const d = new Date(event.created_at);
        if (!isNaN(d)) {
          createdDate = d.toISOString().split('T')[0];
        }
      }
    }
    if (createdFrom && createdDate && createdDate < createdFrom) createdOk = false;
    if (createdTo && createdDate && createdDate > createdTo) createdOk = false;


    return statusOk && datumOk && lokacijaOk && createdOk;
  });
  // Helper da konvertuješ string yyyy-mm-dd u Date objekat (ako ti su ti dateFrom itd. stringovi)
  const toDate = (str) => (str ? new Date(str) : null);
  // Helper da konvertuješ Date u string yyyy-mm-dd kad šalješ na backend (ako treba)
  const toString = (date) => (date ? date.toISOString().split("T")[0] : "");



  useEffect(() => {
    setStatusFilter('');
    setLokacijaFilter('');
    setDateFrom('');
    setDateTo('');
    setCreatedFrom('');
    setCreatedTo('');
  }, [resetFiltersKey]);

  return (
    <div className={`${styles.tabelaWrapper} ${dashboard && styles.dashboard}`}>
      <ToastContainer />
      <div className={`${styles.filters} ${showFilters ? styles.open : ''}`}>
        <label>
          Status:
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Svi</option>
            <option value="nije_potvrdjen">Nije potvrđen</option>
            <option value="potvrdjen">Potvrđen</option>
            <option value="otkazan">Otkazan</option>
          </select>
        </label>

        {rola === "1" && (
          <label>
            Lokacija:
            <select value={lokacijaFilter} onChange={e => setLokacijaFilter(e.target.value)}>
              <option value="">Sve</option>
              {[...new Set(desavanjaData.map(d => d.ime_firme))]
                .filter(id => id !== null && id !== undefined)
                .map(id => (
                  <option key={id} value={id}>
                    {desavanjaData.find(d => d.ime_firme === id)?.lokacija?.ime || `ID ${id}`}
                  </option>
                ))}
            </select>
          </label>
        )}

        
        <label>
          Datum termina (od):
          <DatePicker
            selected={toDate(dateFrom)}
            onChange={(date) => setDateFrom(toString(date))}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
          />
        </label>

        <label>
          Datum termina (do):
          <DatePicker
            selected={toDate(dateTo)}
            onChange={(date) => setDateTo(toString(date))}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
          />
        </label>

        <label>
          Datum zakazivanja (od):
          <DatePicker
            selected={toDate(createdFrom)}
            onChange={(date) => setCreatedFrom(toString(date))}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
          />
        </label>

        <label>
          Datum zakazivanja (do):
          <DatePicker
            selected={toDate(createdTo)}
            onChange={(date) => setCreatedTo(toString(date))}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
          />
        </label>
      </div>

      {loading ? (
        <p>Učitavanje...</p>
      ) : desavanjaData.length === 0 ? (
        <p>Nema zakazanih termina.</p>
      ) : (
        <table className={`${styles.tabela} ${showFilters ? styles.open : ''}`}>
          <thead>
            <tr>
              {rola === "1" && (
                <th onClick={() => handleSort('lokacija')}>
                  Lokacija{sortKey === 'lokacija' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
              )}
              <th onClick={() => handleSort('created_at')}>
                Zakazano{sortKey === 'created_at' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('ime')}>
                Ime{sortKey === 'ime' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('datum')}>
                Datum{sortKey === 'datum' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('vreme_rezervacije')}>
                Vreme{sortKey === 'vreme_rezervacije' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th style={{cursor:'default'}}>
                Trajanje{sortKey === 'duzina_termina' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th style={{cursor:'default'}}>
                Telefon{sortKey === 'telefon' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('email')}>
                Email{sortKey === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th style={{cursor:'default'}}>Status</th>

            </tr>
          </thead>
          <tbody>
            {filtriranaDesavanja.map((event, idx) => (
              <tr key={idx} style={{cursor:'pointer'}} onClick={() => izmeniTermin(event)}>
                {rola === "1" && (
                  <td>{event.lokacija.ime}</td>
                )}
                <td>{formatirajTimestamp(event.created_at)}</td>
                <td>{event.ime}</td>
                <td>{formatirajDatum(event.datum)}</td>
                <td>{event.vreme_rezervacije}</td>
                <td>{event.duzina_termina}</td>
                <td>
                  <a href={`tel:${event.telefon}`} style={{ color: "#3b82f6" }}>
                    {event.telefon}
                  </a>
                </td>
                <td>
                  <a href={`mailto:${event.email}`} style={{ color: "#3b82f6" }}>
                    {event.email}
                  </a>
                </td>
                <td>
                  {event.otkazano ? (
                    <p style={{color: 'red'}}>Termin je otkazan.</p>
                  ) : event.potvrdio === 0 ? (
                    <button
                      className={styles.btn}
                      onClick={e => {
                        e.stopPropagation();
                        potvrdiTermin(event);
                      }}
                    >
                      Potvrdi
                    </button>
                  ) : (
                    <p><strong>Potvrdio: </strong>{event.potvrdio_user?.username || "Nepoznato"}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}