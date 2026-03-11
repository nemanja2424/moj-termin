'use client';
import React, { useEffect, useState } from 'react';
import styles from './Timeline.module.css';
import { toast, ToastContainer } from 'react-toastify';

export default function TimelineDesign({
  forma, setForma,
  preduzece, setPreduzece,
  formData, setFormData,
  id, token, handleSubmit, tipUlaska,
  handleOtkazi, potvrdiTermin, loadingSpin, loadingSpinOtkaz, loadingSpinPotvrda
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUslugaChange = (usluga) => {
    setFormData((prev) => ({
      ...prev,
      usluga: usluga,
      vreme: ''
    }));
  };

  const handlePhoneChange = (e) => {
    const broj = e.target.value.replace(/\D/g, '').slice(0, 9);
    setFormData((prev) => ({ ...prev, telefon: '+381' + broj }));
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    if (preduzece.lokacije && preduzece.lokacije.length > 0 && !formData.lokacija) {
      setFormData((prev) => ({
        ...prev,
        lokacija: preduzece.lokacije[0].id.toString()
      }));
    }
  }, [preduzece.lokacije]);

  const selectedLokacija = preduzece.lokacije?.find(
    (lok) => String(lok.id) === String(formData.lokacija)
  );

  const getAvailableServices = () => {
    return selectedLokacija?.duzina_termina || [];
  };

  const selectedService = (typeof formData.usluga === 'object' && formData.usluga) 
    ? formData.usluga 
    : getAvailableServices()[0];

  const parseDuration = (trajanje) => {
    if (!trajanje) return 60;
    if (typeof trajanje === 'number') return trajanje;
    const t = trajanje.replace(/\s+/g, '');
    const hMatch = t.match(/(\d+)h/);
    const mMatch = t.match(/(\d+)min/);
    const sati = hMatch ? parseInt(hMatch[1], 10) : 0;
    const minuti = mMatch ? parseInt(mMatch[1], 10) : 0;
    if (sati || minuti) return sati * 60 + minuti;
    if (/^\d+min$/.test(t)) return parseInt(t, 10);
    if (/^\d+h$/.test(t)) return parseInt(t, 10) * 60;
    return 60;
  };

  const getDateForTime = (baseDate, timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), h, m, 0, 0);
  };

  const isOverlap = (startA, durationA, startB, durationB) => {
    const endA = new Date(startA.getTime() + durationA * 60000);
    const endB = new Date(startB.getTime() + durationB * 60000);
    return startA < endB && startB < endA;
  };

  const getWorkingHoursForDate = (date) => {
    const dayOfWeek = date.getDay();
    const map = ['sun', 'mon', 'tue', 'wen', 'thu', 'fri', 'sat'];
    const dayKey = map[dayOfWeek];
    return selectedLokacija?.radno_vreme?.[dayKey] || '';
  };

  const generateSlobodniTermini = (date, trajanje, zauzetiTermini) => {
    const radnoVreme = getWorkingHoursForDate(date);
    if (!radnoVreme || !trajanje) return [];

    const [start, end] = radnoVreme.split('-');
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const trajanjeMin = parseDuration(trajanje);
    const termini = [];
    let current = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMin, 0, 0);
    const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, endMin, 0, 0);

    const selectedDateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const zauzeti = (zauzetiTermini || []).filter(z => z.datum_rezervacije === selectedDateStr);

    const overlapLimit = selectedLokacija?.overlapLimit || 1;

    while (current.getTime() + trajanjeMin * 60000 <= endTime.getTime()) {
      const h = current.getHours().toString().padStart(2, '0');
      const m = current.getMinutes().toString().padStart(2, '0');
      const slot = `${h}:${m}`;

      const overlapCount = zauzeti.filter(z => {
        const vremeRez = z.vreme_rezervacije.replace(/h$/, '').replace(/\s+/g, '').trim();
        const zStart = getDateForTime(date, vremeRez);
        const zDur = parseDuration(z.duzina_termina);
        return isOverlap(current, trajanjeMin, zStart, zDur);
      }).length;

      if (overlapCount < overlapLimit) {
        termini.push(slot);
      }
      current = new Date(current.getTime() + trajanjeMin * 60000);
    }
    return termini;
  };

  const getAvailableDays = () => {
    const days = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Generiši 60 dana
    for (let i = 0; i < 60; i++) {
      const date = new Date(tomorrow);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const dayOfWeek = date.getDay();
      const map = ['sun', 'mon', 'tue', 'wen', 'thu', 'fri', 'sat'];
      const dayKey = map[dayOfWeek];
      const radnoVreme = selectedLokacija?.radno_vreme?.[dayKey];
      const isWorkingDay = radnoVreme && radnoVreme.trim() !== '';
      
      days.push({ 
        day: date.getDate(), 
        date, 
        isDisabled: !isWorkingDay,
        dayName: date.toLocaleString('sr-Latn-RS', { weekday: 'short' })
      });
    }
    return days;
  };

  const handleDateCardClick = (date) => {
    setSelectedDate(date);
    setFormData((prev) => ({
      ...prev,
      dan: date.getDate(),
      mesec: date.getMonth(),
      godina: date.getFullYear(),
      vreme: ''
    }));
  };

  const handleTimeSlotClick = (slot) => {
    setFormData((prev) => ({
      ...prev,
      vreme: slot
    }));
  };

  const hasDescriptionContent = () => {
    const opis = preduzece.opis_preduzeca || preduzece.opis || '';
    const cleaned = opis.replace(/<[^>]*>/g, '').trim();
    return cleaned.length > 0;
  };

  const availableDays = selectedLokacija ? getAvailableDays() : [];
  const visibleDays = availableDays;
  const availableTimes = selectedDate && formData.usluga && typeof formData.usluga === 'object' ? 
    generateSlobodniTermini(selectedDate, selectedService?.trajanje, selectedLokacija?.zauzeti_termini) 
    : [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brandFirme}>
          {forma.logoFirme === true && 
            <img loading='lazy' className={styles.logo} src={preduzece.putanja_za_logo === '' ? '/Images/logo.webp' : `https://mojtermin.site/api/logo/${preduzece.putanja_za_logo}`} />
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
        <div className={styles.formContainer}>
          <form className={styles.form} onSubmit={handleSubmit}>
            {/* KORAK 1: LIČNI PODACI */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Lični podaci</h2>
              
              {forma.ime === true && (
                <div className={styles.inputGroup}>
                  <label>Ime</label>
                  <input type="text" name="ime" value={formData.ime} onChange={handleChange} required placeholder="Unesi ime" />
                </div>
              )}

              {forma.email === true && (
                <div className={styles.inputGroup}>
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@example.com" />
                </div>
              )}

              {forma.telefon && (
                <div className={styles.inputGroup}>
                  <label>Telefon</label>
                  <div className={styles.phoneInput}>
                    <input type="text" value="+381" readOnly className={styles.phonePrefix} />
                    <input type="tel" name="telefonBezPrefiksa" value={formData.telefon.replace('+381', '')} onChange={handlePhoneChange} required placeholder="6X XXX XXXX" />
                  </div>
                </div>
              )}
            </div>

            {/* KORAK 2: LOKACIJA */}
            {preduzece.lokacije?.length > 1 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Lokacija</h2>
                <div className={styles.inputGroup}>
                  <select name="lokacija" value={formData.lokacija} onChange={handleChange}>
                    {preduzece.lokacije.map((lokacija, index) => (
                      <option key={index} value={lokacija.id.toString()}>
                        {lokacija.ime} - {lokacija.adresa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* KORAK 3: USLUGA */}
            {selectedLokacija && getAvailableServices().length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Usluga</h2>
                <div className={styles.servicesGrid}>
                  {getAvailableServices().map((srv, idx) => (
                    <div
                      key={idx}
                      className={`${styles.serviceCard} ${typeof formData.usluga === 'object' && formData.usluga.usluga === srv.usluga ? styles.selected : ''}`}
                      onClick={() => handleUslugaChange(srv)}
                    >
                      <div className={styles.serviceName}>{srv.usluga}</div>
                      <div className={styles.servicePrice}>{srv.cena}din</div>
                      <div className={styles.serviceDuration}>{srv.trajanje_prikaz}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KORAK 4: TERMIN - TIMELINE */}
            {selectedLokacija && formData.usluga && typeof formData.usluga === 'object' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Odaberi datum i vreme</h2>
                
                {/* TIMELINE KARTICE */}
                <div className={styles.timelineWrapper}>
                  <div className={styles.timelineCards}>
                    {visibleDays.map((dayObj) => (
                      <div
                        key={`${dayObj.day}-${dayObj.date.getMonth()}-${dayObj.date.getFullYear()}`}
                        className={`${styles.timelineCard} ${selectedDate && selectedDate.getDate() === dayObj.day && selectedDate.getMonth() === dayObj.date.getMonth() && selectedDate.getFullYear() === dayObj.date.getFullYear() ? styles.active : ''} ${dayObj.isDisabled ? styles.disabled : ''}`}
                        onClick={() => !dayObj.isDisabled && handleDateCardClick(dayObj.date)}
                      >
                        <div className={styles.calendarDay}>{dayObj.day}</div>
                        <div className={styles.calendarDayName}>{dayObj.dayName}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VREMENSKE SLOTOVE */}
                {selectedDate && (
                  <div className={styles.timesWrapper}>
                    <h3>Dostupna vremena za {selectedDate.toLocaleDateString('sr-Latn-RS')}</h3>
                    <div className={styles.timesGrid}>
                      {availableTimes.length > 0 ? (
                        availableTimes.map((time, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`${styles.timeSlot} ${formData.vreme === time ? styles.selected : ''}`}
                            onClick={() => handleTimeSlotClick(time)}
                          >
                            {time}h
                          </button>
                        ))
                      ) : (
                        <p className={styles.noTimes}>Nema dostupnih vremena za ovaj dan</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {forma.opis === true && (
              <div className={styles.inputGroup}>
                <label>Opis</label>
                <textarea name="opis" maxLength={200} value={formData.opis} onChange={handleChange} />
              </div>
            )}

            {/* DUGME */}
            <div className={styles.buttonWrapper}>
              <button type="submit" className={styles.submitBtn} disabled={loadingSpin}>
                {loadingSpin ? (
                  <div className="spinnerMali"></div>
                ) : (
                  <>
                    {tipUlaska === 1 && 'Zakaži'}
                    {(tipUlaska === 2 || tipUlaska === 3) && 'Izmeni'}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* O NAMA */}
          {hasDescriptionContent() && (
            <div className={styles.aboutSection}>
              <h3>O nama</h3>
              <div 
                className={styles.aboutContent}
                dangerouslySetInnerHTML={{ __html: preduzece.opis_preduzeca || preduzece.opis }}
              />
            </div>
          )}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
