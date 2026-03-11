'use client';
import React, { useEffect, useState } from 'react';
import styles from './Default.module.css';
import { toast, ToastContainer } from 'react-toastify';

export default function DefaultDesign({
  forma, setForma,
  preduzece, setPreduzece,
  formData, setFormData,
  id, token, handleSubmit, tipUlaska,
  handleOtkazi, potvrdiTermin, loadingSpin, loadingSpinOtkaz, loadingSpinPotvrda
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUslugaChange = (e) => {
    const selectedIndex = parseInt(e.target.value);
    const selectedUsluga = getAvailableServices()[selectedIndex];
    setFormData((prev) => ({
      ...prev,
      usluga: selectedUsluga,
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

  // Kada stigne preduzece, postavi podrazumevanu lokaciju
  useEffect(() => {
    console.log('Tip ulaska: ', tipUlaska)
    if (preduzece.lokacije && preduzece.lokacije.length > 0 && !formData.lokacija) {
      setFormData((prev) => ({
        ...prev,
        lokacija: preduzece.lokacije[0].id.toString()
      }));
    }
  }, [preduzece.lokacije]);

  // Inicijalizuj kalendar na osnovu formData.dan, mesec, godina
  useEffect(() => {
    if (formData.dan && formData.mesec !== '' && formData.godina) {
      const selectedDate = new Date(formData.godina, formData.mesec, formData.dan);
      setSelectedCalendarDate(selectedDate);
      setCalendarMonth(formData.mesec);
      setCalendarYear(formData.godina);
    }
  }, [formData.dan, formData.mesec, formData.godina]);

  // Pronađi selektovanu lokaciju
  const selectedLokacija = preduzece.lokacije?.find(
    (lok) => String(lok.id) === String(formData.lokacija)
  );

  // Pribavi usluge iz lokacije (cenovnik - duzina_termina)
  const getAvailableServices = () => {
    return selectedLokacija?.duzina_termina || [];
  };

  // Pronađi selektovanu uslugu
  const selectedService = (typeof formData.usluga === 'object' && formData.usluga?.usluga) 
    ? formData.usluga 
    : getAvailableServices()[0];

  // Pomocna funkcija za parsiranje trajanja termina u minute
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

  // Vraca Date objekat za vreme
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

  // Pronađi radno vreme za odabrani dan
  const getWorkingHoursForDate = (date) => {
    const dayOfWeek = date.getDay();
    const map = ['sun', 'mon', 'tue', 'wen', 'thu', 'fri', 'sat'];
    const dayKey = map[dayOfWeek];
    return selectedLokacija?.radno_vreme?.[dayKey] || '';
  };

  // Generiši slobodne termine
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

    // Pribavi overlapLimit (default je 1 ako nije definisan)
    const overlapLimit = selectedLokacija?.overlapLimit || 1;

    while (current.getTime() + trajanjeMin * 60000 <= endTime.getTime()) {
      const h = current.getHours().toString().padStart(2, '0');
      const m = current.getMinutes().toString().padStart(2, '0');
      const slot = `${h}:${m}`;

      // Prebrojavanje preklapajućih termina
      const overlapCount = zauzeti.filter(z => {
        const vremeRez = z.vreme_rezervacije.replace(/h$/, '').replace(/\s+/g, '').trim();
        const zStart = getDateForTime(date, vremeRez);
        const zDur = parseDuration(z.duzina_termina);
        return isOverlap(current, trajanjeMin, zStart, zDur);
      }).length;

      // Dodaj termin samo ako je broj preklapа manji od limitiranja
      if (overlapCount < overlapLimit) {
        termini.push(slot);
      }
      current = new Date(current.getTime() + trajanjeMin * 60000);
    }
    return termini;
  };

  // Pronađi dostupne dane za mini kalendar
  const getCalendarDays = () => {
    const days = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Termin se može zakazati tek od sutra
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(calendarYear, calendarMonth, day);
      date.setHours(0, 0, 0, 0);
      
      // Proveri da li je datum pre sutra
      if (date < tomorrow) {
        days.push({ day, date, isDisabled: true });
      } else {
        // Proveri da li je taj dan radni dan
        const dayOfWeek = date.getDay();
        const map = ['sun', 'mon', 'tue', 'wen', 'thu', 'fri', 'sat'];
        const dayKey = map[dayOfWeek];
        const radnoVreme = selectedLokacija?.radno_vreme?.[dayKey];
        const isWorkingDay = radnoVreme && radnoVreme.trim() !== '';
        
        days.push({ day, date, isDisabled: !isWorkingDay });
      }
    }
    return days;
  };

  // Postavi odabrani dan i automatski popuni formData
  const handleCalendarDayClick = (date) => {
    setSelectedCalendarDate(date);
    setFormData((prev) => ({
      ...prev,
      dan: date.getDate(),
      mesec: date.getMonth(),
      godina: date.getFullYear(),
      vreme: ''
    }));
  };

  // Proveri da li opis sadrži stvarni sadržaj (ne samo HTML tagove)
  const hasDescriptionContent = () => {
    const opis = preduzece.opis_preduzeca || preduzece.opis || '';
    // Ukloni sve HTML tagove
    const cleaned = opis.replace(/<[^>]*>/g, '').trim();
    // Proveri da li ima stvarnog teksta
    return cleaned.length > 0;
  };
  const calendarDays = getCalendarDays();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  // Prilagodi za kalendar gde je Ponedeljak prvi dan (not Nedelja)
  // getDay(): 0=Nedelja, 1=Pon, ..., 6=Subota
  // Prikaz: Pon, Uto, Sre, Čet, Pet, Sub, Ned
  const emptySlots = Array(firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1).fill(null);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brandFirme}>
          {forma.logoFirme === true && 
            <img loading='lazy' className={styles.logo} src={preduzece.putanja_za_logo === '' ? '/Images/logo.webp' : `https://mojtermin.site/api/logo/${preduzece.putanja_za_logo}`} />
          }
          {forma.nazivFirme === true && (
            <h2>{preduzece.ime_preduzeca}</h2>
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
        <div style={{
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0'
        }}>
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

          {selectedLokacija && getAvailableServices().length > 0 && (
            <div className={styles.inputGroup}>
              <label>Usluga</label>
              <select
                name="usluga"
                value={getAvailableServices().findIndex(srv => 
                  typeof formData.usluga === 'object' 
                    ? srv.usluga === formData.usluga.usluga 
                    : srv.usluga === formData.usluga
                )}
                onChange={handleUslugaChange}
                required
              >
                <option value="">Izaberi uslugu</option>
                {getAvailableServices().map((srv, idx) => (
                  <option key={idx} value={idx}>
                    {typeof srv === 'object' ? `${srv.usluga} - ${srv.trajanje_prikaz} (${srv.cena}din)` : srv}
                  </option>
                ))}
              </select>
            </div>
          )}

          {forma.datum === true || forma.vreme === true ? (
            <div className={styles.inputGroup}>
              <label>Odaberi dan i vreme</label>
              
              {selectedLokacija && formData.usluga?.usluga && (
                <>
                  {/* MINI KALENDAR */}
                  <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(m => m === 0 ? 11 : m - 1)}
                        style={{ padding: '5px 10px', cursor: 'pointer' }}
                      >
                        &larr;
                      </button>
                      <span style={{ fontWeight: 'bold', minWidth: '150px', textAlign: 'center' }}>
                        {new Date(calendarYear, calendarMonth).toLocaleString('sr-Latn-RS', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(m => m === 11 ? 0 : m + 1)}
                        style={{ padding: '5px 10px', cursor: 'pointer' }}
                      >
                        &rarr;
                      </button>
                    </div>

                    {/* Dan u sedmici */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '5px',
                      marginBottom: '10px'
                    }}>
                      {['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'].map(day => (
                        <div key={day} style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Dani */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '5px'
                    }}>
                      {emptySlots.map((_, idx) => (
                        <div key={`empty-${idx}`} />
                      ))}
                      {calendarDays.map((dayObj) => (
                        <button
                          key={`${dayObj.day}-${calendarMonth}-${calendarYear}`}
                          type="button"
                          onClick={() => handleCalendarDayClick(dayObj.date)}
                          style={{
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: selectedCalendarDate && 
                              selectedCalendarDate.getDate() === dayObj.day &&
                              selectedCalendarDate.getMonth() === calendarMonth &&
                              selectedCalendarDate.getFullYear() === calendarYear
                              ? '#007bff'
                              : dayObj.isDisabled ? '#f0f0f0' : 'white',
                            color: selectedCalendarDate &&
                              selectedCalendarDate.getDate() === dayObj.day &&
                              selectedCalendarDate.getMonth() === calendarMonth &&
                              selectedCalendarDate.getFullYear() === calendarYear
                              ? 'white'
                              : 'black',
                            cursor: dayObj.isDisabled ? 'not-allowed' : 'pointer',
                            opacity: dayObj.isDisabled ? 0.5 : 1,
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                          disabled={dayObj.isDisabled}
                        >
                          {dayObj.day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* IZBOR VREMENA */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                      Vreme
                    </label>
                    <select
                      name="vreme"
                      value={formData.vreme}
                      onChange={handleChange}
                      required
                      disabled={!selectedCalendarDate}
                      style={{ width: '100%', padding: '10px' }}
                    >
                      <option value="">Izaberi vreme</option>
                      {selectedCalendarDate && generateSlobodniTermini(
                        selectedCalendarDate,
                        selectedService?.trajanje,
                        selectedLokacija?.zauzeti_termini
                      ).map((t, i) => (
                        <option key={i} value={t}>{t}h</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {(!selectedLokacija || !formData.usluga?.usluga) && (
                <div style={{ color: '#666', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                  {!selectedLokacija ? 'Prvo izaberi lokaciju' : 'Odaberi uslugu'}
                </div>
              )}
            </div>
          ) : null}

          {forma.opis === true && (
            <div className={styles.inputGroup}>
              <label>Opis</label>
              <textarea style={{height:'60px',resize:'none'}} name="opis" maxLength={200} value={formData.opis} onChange={handleChange} />
            </div>
          )}
          
          
          {formData.otkazano === true ? (
            <p style={{ textAlign:'center'}}>Termin je otkazan.</p>

          ) : (
            <>
              <div className={styles.buttons}>
                {(tipUlaska === 2 || tipUlaska === 3) && (
                  <button onClick={handleOtkazi} className={styles.submitBtn} style={{backgroundColor:'red'}} type='button'>
                    {loadingSpinOtkaz ? (
                      <div style={{maxHeight:'100%',display:'flex',justifyContent:'center',alignItems:'center'}}>
                        <div className="spinnerMali" ></div>
                      </div>
                    ) : (
                      <p>
                        Otkaži termin
                      </p>
                    )}
                  </button>
                )}
                <button type="submit" className={styles.submitBtn}>
                  {loadingSpin === true ? (
                      <div style={{maxHeight:'100%',display:'flex',justifyContent:'center',alignItems:'center'}}>
                        <div className="spinnerMali" ></div>
                      </div>
                    ) : (
                      <>
                        {tipUlaska === 1 && 'Zakaži'}
                        {(tipUlaska === 2 || tipUlaska === 3) && 'Izmeni'}
                      </>
                    )}
                </button>
                {tipUlaska === 3 && formData.potvrdio === 0 && (
                  <button onClick={(e) => {e.preventDefault; potvrdiTermin(formData);}} className={styles.submitBtn} type='button'>
                    {loadingSpinPotvrda ? (
                      <div style={{maxHeight:'100%',display:'flex',justifyContent:'center',alignItems:'center'}}>
                        <div className="spinnerMali" ></div>
                      </div>
                    ) : (
                      <p>
                        Potvrdi
                      </p>
                    )}
                  </button>
                )}
              </div>
              {Number(formData.potvrdio) !== 0 && formData.potvrdio_zaposlen && (
                <p><b>Termin potvrdio:</b> {formData.potvrdio_zaposlen.username}</p>
              )}
            </>
          )}

          </form>

          {(hasDescriptionContent()) && (
          <div style={{
            marginTop: '0',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            borderLeft: '4px solid #007bff',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333', fontSize: '1.2rem' }}>O nama</h3>
            <div 
              style={{ 
                color: '#666', 
                lineHeight: '1.6',
                fontSize: '1rem',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
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
