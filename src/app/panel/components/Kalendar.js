import { useEffect, useState } from "react";
import styles from "./Kalendar.module.css";

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

  useEffect(() => {
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
        }));

        setDesavanjaData(allEvents);

        // Automatski prikaz termina za danas
        const formatted = formatDate(today);
        const todayEvents = allEvents.filter((e) => e.datum === formatted);
        setSelectedEvents(todayEvents);
      } catch (error) {
        console.error("Greška:", error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 3600000); // 10000ms = 10s

    return () => clearInterval(intervalId);

  }, []);

  useEffect(() => {
    generateCalendar(currentMonth, currentYear);
  }, [desavanjaData, currentMonth, currentYear]);

  return (
    <div>
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
                style={isHighlighted(d.date) ? { color: "#6c3dff", fontWeight: "600" } : {}}
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

      <div className={styles.dayWrapper}>
        {selectedDate ? (
          selectedEvents.length > 0 ? (
            <div className={styles.eventCards}>
              {selectedEvents.map((event, index) => (
                <div key={index} className={styles.eventCard}>
                  <h3>{event.ime}</h3>
                  <p><strong>Vreme:</strong> {event.vreme_rezervacije}</p>
                  <p><strong>Trajanje:</strong> {event.duzina_termina}</p>
                  <p><strong>Opis:</strong> {event.opis}</p>
                  <p><strong>Telefon:</strong> {event.telefon}</p>
                  <p><strong>Email:</strong> {event.email}</p>
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
    </div>
  );
}
