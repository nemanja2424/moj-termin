import { useEffect, useState } from "react";
import styles from "./Tabela.module.css";
import { toast, ToastContainer } from "react-toastify";


export default function Tabela({ desavanjaData, fetchData, loading, izmeniTermin }) {
    const [desavanja, setDesavanja] = useState([]);
    useEffect(() => {
        if (desavanjaData && desavanjaData.length > 0) {
            const sortirano = [...desavanjaData].sort((a, b) => b.id - a.id);
            setDesavanja(sortirano);
        }
    }, [desavanjaData]);

    
  const potvrdiTermin = async (termin) => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    termin.potvrdio = userId;
    const res = await fetch("https://mojtermin.site/api/potvrdi_termin", {
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

  return (
    <div className={styles.tabelaWrapper}>
      <ToastContainer />
      {loading ? (
        <p>Učitavanje...</p>
      ) : desavanjaData.length === 0 ? (
        <p>Nema zakazanih termina.</p>
      ) : (
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Ime</th>
              <th>Datum</th>
              <th>Vreme</th>
              <th>Trajanje</th>
              <th>Telefon</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {desavanja.map((event, idx) => (
              <tr key={idx} style={{cursor:'pointer'}} onClick={() => izmeniTermin(event)}>
                <td>{event.ime}</td>
                <td>{event.datum}</td>
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
                  {event.potvrdio === 0 ? (
                    <button
                      className={styles.btn}
                      onClick={() => potvrdiTermin(event)}
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