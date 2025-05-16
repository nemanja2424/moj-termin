import { useEffect, useRef, useState } from "react";
import styles from "./Kalendar.module.css";
import { toast, ToastContainer } from "react-toastify";

const formatDate = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const meseci = [
  "Januar", "Februar", "Mart", "April", "Maj", "Jun",
  "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
];

const daysOfWeek = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];

const today = new Date();

export default function Kalendar() {
  const [desavanjaData, setDesavanjaData] = useState([]);
  const [days, setDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [selectedEvents, setSelectedEvents] = useState([]);
  const scrollRef = useRef(null);


  const generateCalendar = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayIndex = (firstDay.getDay() + 6) % 7;
    const totalCells = Math.ceil((firstDayIndex + lastDay.getDate()) / 7) * 7;

    const daysArray = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      daysArray.push({
        day: prevMonthLastDay - i,
        isToday: false,
        isOtherMonth: true,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateObj = new Date(year, month, i);
      const isToday =
        dateObj.getDate() === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear();
      daysArray.push({
        day: i,
        isToday,
        isOtherMonth: false,
        date: dateObj
      });
    }

    for (let i = 1; daysArray.length < totalCells; i++) {
      daysArray.push({
        day: i,
        isToday: false,
        isOtherMonth: true,
        date: new Date(year, month + 1, i)
      });
    }

    setDays(daysArray);
  };
  const changeMonth = (dir) => {
    let newMonth = currentMonth + dir;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    generateCalendar(newMonth, newYear);
  };
  const isHighlighted = (date) => {
    const formatted = formatDate(date);
    return desavanjaData.some((e) => e.datum === formatted);
  };
  const getEventCount = (date) => {
    const formatted = formatDate(date);
    return desavanjaData.filter((e) => e.datum === formatted).length;
  };
  const handleDateClick = (date) => {
    const formatted = formatDate(date);
    const events = desavanjaData.filter((e) => e.datum === formatted);
    setSelectedDate(formatted);
    setSelectedEvents(events);
  };

  const fetchData = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      console.error("Nedostaje userId ili authToken u localStorage.");
      return;
    }

    try {
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
      console.log(allEvents);

      const formatted = selectedDate || formatDate(today);
      const currentEvents = allEvents.filter((e) => e.datum === formatted);
      setSelectedEvents(currentEvents);


    } catch (error) {
      console.error("Greška:", error);
    }
  };

  useEffect(() => {

    fetchData();

    const intervalId = setInterval(fetchData, 3600000);

    return () => clearInterval(intervalId);
  }, []);

  
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
  
    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        const scrollSpeed = 3; 
        el.scrollLeft += e.deltaY * scrollSpeed;
      }
    };
  
    el.addEventListener("wheel", onWheel, { passive: false });
  
    return () => el.removeEventListener("wheel", onWheel);
  }, [selectedEvents.length]);
  


  useEffect(() => {
    generateCalendar(currentMonth, currentYear);
  }, [desavanjaData, currentMonth, currentYear]);


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
  }

  return (
    <div className={styles.kalendarContent}>
      <div className={styles.kalendarWrapper}>
        <div className={styles.header}>
          <button onClick={() => changeMonth(-1)}>&lt;</button>
          <h2>{meseci[currentMonth]} {currentYear}</h2>
          <button onClick={() => changeMonth(1)}>&gt;</button>
        </div>
        <div className={styles.grid}>
          {daysOfWeek.map((dan, idx) => (
            <div key={idx} className={styles.dayName}>{dan}</div>
          ))}
          {days.map((d, idx) => {
            const formatted = formatDate(d.date);
            const isSelected = formatted === selectedDate;

            return (
              <div
                key={idx}
                data-date={formatted}
                className={`
                  ${styles.date}
                  ${d.isToday ? styles.today : ""}
                  ${d.isOtherMonth ? styles.otherMonth : ""}
                  ${isSelected ? styles.selectedDay : ""}
                `}
                style={isHighlighted(d.date) ? { color: "#0072ff", fontWeight: "600" } : {}}
                onClick={() => handleDateClick(d.date)}
              >
                <div>{d.day}</div>
                {isHighlighted(d.date) && (
                  <div className={styles.eventCount}>{getEventCount(d.date)}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{width:'100%'}}>
        {selectedDate ? (
          selectedEvents.length > 0 ? (
            <div className={styles.dayWrapper} ref={scrollRef}>
              {selectedEvents.map((event, index) => (
                <div key={index} className={styles.eventCard}>
                  <div>
                    <h3>{event.ime}</h3>
                    <p><strong>Vreme:</strong> {event.vreme_rezervacije}</p>
                    <p><strong>Trajanje:</strong> {event.duzina_termina}</p>
                    <p><strong>Opis:</strong> {event.opis}</p>
                    <p><strong>Telefon:</strong> <a href={`tel:${event.telefon}`} style={{color:'#3b82f6'}}>{event.telefon}</a></p>
                    <p><strong>Email:</strong> <a href={`mailto:${event.email}`} style={{color:'#3b82f6'}}>{event.email}</a></p>
                    <p>
                      {event.potvrdio !== 0 ? (
                        <>
                          <strong>Potvrdio: </strong>{event.potvrdio_user.username}
                        </>
                      ) : (
                        <strong>Nije potvrđeno</strong>
                      )}
                    </p>
                  </div>
                  <div style={{display:'flex',flexDirection:'row',gap:'10px'}}>
                    {event.potvrdio === 0 ? (
                        <button onClick={() => potvrdiTermin(event)} className={styles.btn}>Potvrdi termin</button>
                      ) : null}
                    <button className={styles.btn}>Izmeni termin</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <h2>Nema zakazanih termina</h2>
          )
        ) : (
          <h2>Izaberite datum</h2>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}
