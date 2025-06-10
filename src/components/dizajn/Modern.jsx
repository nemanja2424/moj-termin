'use client';
import React, { useEffect, useState } from 'react';
import styles from './Default.module.css';
import { toast, ToastContainer } from 'react-toastify';

export default function ModernDesign({
  forma, setForma,
  preduzece, setPreduzece,
  formData, setFormData,
  id, token, handleSubmit
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);


  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const years = Array.from({ length: 3 }, (_, i) => today.getFullYear() + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  const getDaysInMonthExcludingWeekends = (year, month) => {
    const days = [];
    const now = new Date();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        if (
        year === now.getFullYear() &&
        month === now.getMonth() &&
        day < now.getDate()
        ) continue;

        days.push(day);
    }

    return days;
  };

  const getAvailableDays = (year, month) => {
    const days = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0); // samo datum, bez vremena
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);

      // Prikazi samo danas ili u budućnosti
      if (date < now) continue;

      // Ako želiš da preskočiš vikende, otkomentariši sledeće dve linije:
      // const dayOfWeek = date.getDay();
      // if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      days.push(day);
    }
    return days;
  };

  const useFilteredDays = false; // ili true da uključiš

  const days = getAvailableDays(formData.godina, formData.mesec);
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };


  const handlePhoneChange = (e) => {
    const broj = e.target.value.replace(/\D/g, '').slice(0, 9);
    setFormData((prev) => ({ ...prev, telefon: '+381' + broj }));
  };


  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };




  // Kada stigne preduzece, postavi podrazumevanu lokaciju
  useEffect(() => {
    if (preduzece.lokacije && preduzece.lokacije.length > 0 && !formData.lokacija) {
      setFormData((prev) => ({
        ...prev,
        lokacija: preduzece.lokacije[0].id.toString()
      }));
    }
  }, [preduzece.lokacije]);


  // Pronađi selektovanu lokaciju (pazi na tip podatka)
  const selectedLokacija = preduzece.lokacije?.find(
    (lok) => String(lok.id) === String(formData.lokacija)
  );

  // Prikaz vremena samo ako postoji i nije prazan string
  const getDayKey = () => {
    if (!formData.godina || !formData.mesec || !formData.dan) return null;
    const jsDay = new Date(formData.godina, formData.mesec, formData.dan).getDay();
    const map = ['sun', 'mon', 'tue', 'wen', 'thu', 'fri', 'sat'];
    return map[jsDay];
  };

  const danKey = getDayKey();
  const radnoVreme = selectedLokacija?.radno_vreme?.[danKey] || '';

  // Pomocna funkcija za parsiranje trajanja termina u minute
  const parseDuration = (trajanje) => {
    if (!trajanje) return 60;
    // Ukloni sve razmake radi lakšeg parsiranja
    const t = trajanje.replace(/\s+/g, '');
    // "1h30min"
    const hMatch = t.match(/(\d+)h/);
    const mMatch = t.match(/(\d+)min/);
    const sati = hMatch ? parseInt(hMatch[1], 10) : 0;
    const minuti = mMatch ? parseInt(mMatch[1], 10) : 0;
    if (sati || minuti) return sati * 60 + minuti;
    // Samo minuti, npr "45min"
    if (/^\d+min$/.test(t)) return parseInt(t, 10);
    // Samo sati, npr "2h"
    if (/^\d+h$/.test(t)) return parseInt(t, 10) * 60;
    return 60;
  };

  // Pomocna funkcija: vraca Date objekat za vreme (npr. "09:30")
  const getDateForTime = (baseDate, timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), h, m, 0, 0);
  };

  // Provera da li se dva termina preklapaju
  const isOverlap = (startA, durationA, startB, durationB) => {
    const endA = new Date(startA.getTime() + durationA * 60000);
    const endB = new Date(startB.getTime() + durationB * 60000);
    return startA < endB && startB < endA;
  };

  let odabranDatum;
  // Generisanje slobodnih termina na osnovu radnog vremena, trajanja i zauzetih termina
  const generateSlobodniTermini = (radnoVreme, trajanje, zauzetiTermini, selectedDate) => {
    console.log('IZABRAN DATUM:', `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`);
    odabranDatum = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`;
    console.log(days)
    if (!radnoVreme || !trajanje) return [];
    const [start, end] = radnoVreme.split('-');
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const trajanjeMin = parseDuration(trajanje);

    const termini = [];
    let current = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), startHour, startMin, 0, 0);
    const endTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), endHour, endMin, 0, 0);

    // Filtriraj zauzete termine za taj dan
    const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`;
    const danPre = new Date(selectedDate);
    danPre.setDate(selectedDate.getDate());
    const danPreStr = `${danPre.getFullYear()}-${String(danPre.getMonth()+1).padStart(2,'0')}-${String(danPre.getDate()).padStart(2,'0')}`;

    const zauzeti = (zauzetiTermini || []).filter(
      z => z.datum_rezervacije === selectedDateStr || z.datum_rezervacije === danPreStr
    );
    console.log('ZAUZETI TERMINI ZA DAN:', zauzeti);

    while (current.getTime() + trajanjeMin * 60000 <= endTime.getTime()) {
      const h = current.getHours().toString().padStart(2, '0');
      const m = current.getMinutes().toString().padStart(2, '0');
      const slot = `${h}:${m}`;

      const overlap = zauzeti.some(z => {
        const vremeRez = z.vreme_rezervacije.replace(/h$/, '').replace(/\s+/g, '').trim();
        const zStart = getDateForTime(selectedDate, vremeRez);
        const zDur = parseDuration(z.duzina_termina);
        return isOverlap(current, trajanjeMin, zStart, zDur);
      });

      if (!overlap) {
        termini.push(slot);
      }
      current = new Date(current.getTime() + trajanjeMin * 60000);
    }
    return termini;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brandFirme}>
          {forma.logoFirme === true && 
            <img className={styles.logo} src={preduzece.putanja_za_logo} />
          }
          {forma.nazivFirme === true && (
            <h1>{preduzece.ime_preduzeca}</h1>
          )}
        </div>
        <div className={styles.menuIcon} onClick={toggleMenu}>☰</div>
        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
          {Array.isArray(forma?.link) && forma.link.map((link, index) => (
            <a key={index} href={link.url}>{link.text}</a>
          ))}
        </nav>
      </header>

      <main className={styles.formWrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {forma.ime === true && (
            <div className={styles.inputGroup}>
              <label>Ime</label>
              <input type="text" name="ime" value={formData.ime} onChange={handleChange} required />
            </div>
          )}

          {forma.email === true && (
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          )}

          {forma.telefon && (
            <div className={styles.inputGroup}>
              <label>Telefon</label>
              <div style={{ display: 'flex' }}>
                <input
                  type="text"
                  value="+381"
                  readOnly
                  style={{
                    width: '60px',
                    backgroundColor: '#f0f0f0',
                    borderRight: 'none',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                />
                <input
                  type="tel"
                  name="telefonBezPrefiksa"
                  value={formData.telefon.replace('+381', '')}
                  onChange={handlePhoneChange}
                  required
                  style={{
                    flex: 1,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                />
              </div>
            </div>
          )}

          {preduzece.lokacije?.length > 1 && (
            <div className={styles.inputGroup}>
              <label>Lokacija</label>
              <select name="lokacija" value={formData.lokacija} onChange={handleChange}>
                {preduzece.lokacije.map((lokacija, index) => (
                  <option key={index} value={lokacija.id.toString()}>
                    {lokacija.ime} - {lokacija.adresa}
                  </option>
                ))}
              </select>
            </div>
          )}

          {forma.trajanje === true && selectedLokacija && (
            <div className={styles.inputGroup}>
              <label>Trajanje</label>
              <select
                name="trajanje"
                value={formData.trajanje}
                onChange={handleChange}
                required
              >
                <option value="">Izaberi trajanje</option>
                {selectedLokacija.duzina_termina?.map((dt, idx) => (
                  <option key={idx} value={dt}>{dt}</option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>{forma.datum === true && 'Datum'}{forma.datum === true && forma.vreme === true && ' i '}{forma.vreme === true && 'Vreme'}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {forma.datum === true && (
                <>
                  <select
                    value={formData.dan}
                    onChange={e => setFormData(prev => ({ ...prev, dan: Number(e.target.value), vreme: '' }))}
                    required
                  >
                    <option value="">Dan</option>
                    {days.map(day => {
                      const dateObj = new Date(formData.godina, formData.mesec, day);
                      const weekday = dateObj.toLocaleDateString('sr-Latn-RS', { weekday: 'short' }); // ili 'long'
                      return (
                        <option key={day} value={day}>
                          {day} ({weekday})
                        </option>
                      );
                    })}
                  </select>

                  <select
                    value={formData.mesec}
                    onChange={e => setFormData(prev => ({ ...prev, mesec: Number(e.target.value), dan: '', vreme: '' }))}
                    required
                  >
                    {months.map(m => (
                      <option key={m} value={m}>
                        {new Date(0, m).toLocaleString('sr-Latn-RS', { month: 'long' })}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.godina}
                    onChange={e => setFormData(prev => ({ ...prev, godina: Number(e.target.value), dan: '', vreme: '' }))}
                    required
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </>
              )}
              
              {forma.vreme === true && formData.dan && (
                radnoVreme && radnoVreme !== "" && formData.trajanje ? (
                  <select
                    name="vreme"
                    value={formData.vreme}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Izaberi vreme</option>
                    {generateSlobodniTermini(
                      radnoVreme,
                      formData.trajanje,
                      selectedLokacija?.zauzeti_termini,
                      new Date(formData.godina, formData.mesec, Number(formData.dan))
                    ).map((t, i) => (
                      <option key={i} value={t}>{t}h</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ color: 'gray', alignSelf: 'center', padding: '0 10px' }}>
                    Nema termina za izabrani dan
                  </div>
                )
              )}

            </div>
          </div>

          {forma.opis === true && (
            <div className={styles.inputGroup}>
              <label>Opis</label>
              <textarea style={{height:'60px',resize:'none'}} name="opis" maxLength={200} value={formData.opis} onChange={handleChange} />
            </div>
          )}
          

          

          <button type="submit" className={styles.submitBtn} style={{background:'green'}}>Zakaži</button>
        </form>
      </main>

      <ToastContainer />
    </div>
  );
}
