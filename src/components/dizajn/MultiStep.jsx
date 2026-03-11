'use client';
import React, { useEffect, useState } from 'react';
import styles from './MultiStep.module.css';
import { toast, ToastContainer } from 'react-toastify';

export default function MultiStepDesign({
  forma, setForma,
  preduzece, setPreduzece,
  formData, setFormData,
  id, token, handleSubmit, tipUlaska,
  handleOtkazi, potvrdiTermin, loadingSpin, loadingSpinOtkaz, loadingSpinPotvrda,
  shouldResetStep, onResetComplete
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  const TOTAL_STEPS = 4;

  // Reset step na 1 nakon uspešnog zakazivanja
  useEffect(() => {
    if (shouldResetStep) {
      setCurrentStep(1);
      setSelectedCalendarDate(null);
      if (onResetComplete) {
        onResetComplete();
      }
    }
  }, [shouldResetStep, onResetComplete]);

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

  // Automatski postavi podrazumevanu lokaciju
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

  const getCalendarDays = () => {
    const days = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(calendarYear, calendarMonth, day);
      date.setHours(0, 0, 0, 0);
      
      if (date < tomorrow) {
        days.push({ day, date, isDisabled: true });
      } else {
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

  const hasDescriptionContent = () => {
    const opis = preduzece.opis_preduzeca || preduzece.opis || '';
    const cleaned = opis.replace(/<[^>]*>/g, '').trim();
    return cleaned.length > 0;
  };

  const calendarDays = getCalendarDays();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const emptySlots = Array(firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1).fill(null);

  // Validacija između koraka
  const validateStep = (step) => {
    switch(step) {
      case 1:
        return formData.ime && formData.email && formData.telefon;
      case 2:
        return formData.lokacija;
      case 3:
        return typeof formData.usluga === 'object' && formData.usluga.usluga;
      case 4:
        return formData.dan && formData.vreme;
      default:
        return false;
    }
  };

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error('Molim popuni sve polje pre nego što nastavi');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Prikazi sadržaj prema koraku
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Lični podaci</h2>
            
            {forma.ime === true && (
              <div className={styles.inputGroup}>
                <label>Ime *</label>
                <input 
                  type="text" 
                  name="ime" 
                  value={formData.ime} 
                  onChange={handleChange} 
                  placeholder="Unesi svoje ime"
                  required 
                />
              </div>
            )}

            {forma.email === true && (
              <div className={styles.inputGroup}>
                <label>Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="unesi@email.com"
                  required 
                />
              </div>
            )}

            {forma.telefon && (
              <div className={styles.inputGroup}>
                <label>Telefon *</label>
                <div className={styles.phoneInput}>
                  <input
                    type="text"
                    value="+381"
                    readOnly
                    className={styles.phonePrefix}
                  />
                  <input
                    type="tel"
                    name="telefonBezPrefiksa"
                    value={formData.telefon.replace('+381', '')}
                    onChange={handlePhoneChange}
                    placeholder="6X XXX XXXX"
                    required
                    className={styles.phoneNumber}
                  />
                </div>
              </div>
            )}
            {forma.opis === true && (
                <div className={styles.inputGroup}>
                <label>Opis</label>
                <textarea  name="opis" maxLength={200} value={formData.opis} onChange={handleChange} />
                </div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Izbor lokacije</h2>
            
            {preduzece.lokacije?.length > 1 ? (
              <div className={styles.inputGroup}>
                <label>Lokacija *</label>
                <select 
                  name="lokacija" 
                  value={formData.lokacija} 
                  onChange={handleChange}
                >
                  {preduzece.lokacije.map((lokacija, index) => (
                    <option key={index} value={lokacija.id.toString()}>
                      {lokacija.ime} - {lokacija.adresa}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className={styles.infoBox}>
                <p>📍 {preduzece.lokacije?.[0]?.ime}</p>
                <p className={styles.smallText}>{preduzece.lokacije?.[0]?.adresa}</p>
              </div>
            )}
          </div>
        );
      
      case 3:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Izbor usluge</h2>
            
            {selectedLokacija && getAvailableServices().length > 0 ? (
              <div className={styles.inputGroup}>
                <label>Usluga *</label>
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
            ) : (
              <div className={styles.infoBox}>
                <p>⚠️ Nema dostupnih usluga na ovoj lokaciji</p>
              </div>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Datum i vreme</h2>
            
            {selectedLokacija && formData.usluga && typeof formData.usluga === 'object' ? (
              <>
                {/* MINI KALENDAR */}
                <div className={styles.calendarWrapper}>
                  <div className={styles.calendarHeader}>
                    <button
                      type="button"
                      onClick={() => setCalendarMonth(m => m === 0 ? 11 : m - 1)}
                      className={styles.calendarBtn}
                    >
                      ◀
                    </button>
                    <span className={styles.calendarMonth}>
                      {new Date(calendarYear, calendarMonth).toLocaleString('sr-Latn-RS', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCalendarMonth(m => m === 11 ? 0 : m + 1)}
                      className={styles.calendarBtn}
                    >
                      ▶
                    </button>
                  </div>

                  <div className={styles.weekDays}>
                    {['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'].map(day => (
                      <div key={day} className={styles.weekDay}>{day}</div>
                    ))}
                  </div>

                  <div className={styles.calendarGrid}>
                    {emptySlots.map((_, idx) => (
                      <div key={`empty-${idx}`} />
                    ))}
                    {calendarDays.map((dayObj) => (
                      <button
                        key={`${dayObj.day}-${calendarMonth}-${calendarYear}`}
                        type="button"
                        onClick={() => handleCalendarDayClick(dayObj.date)}
                        className={`${styles.calendarDay} ${
                          selectedCalendarDate && 
                          selectedCalendarDate.getDate() === dayObj.day &&
                          selectedCalendarDate.getMonth() === calendarMonth &&
                          selectedCalendarDate.getFullYear() === calendarYear
                          ? styles.selected
                          : ''
                        } ${dayObj.isDisabled ? styles.disabled : ''}`}
                        disabled={dayObj.isDisabled}
                      >
                        {dayObj.day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* IZBOR VREMENA */}
                <div className={styles.inputGroup}>
                  <label>Vreme *</label>
                  <select
                    name="vreme"
                    value={formData.vreme}
                    onChange={handleChange}
                    required
                    disabled={!selectedCalendarDate}
                    className={selectedCalendarDate ? '' : styles.disabled}
                  >
                    <option value="">
                      {selectedCalendarDate ? 'Izaberi vreme' : 'Prvo izaberi dan'}
                    </option>
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
            ) : (
              <div className={styles.infoBox}>
                <p>⚠️ Popuni prethodne korake da vidim raspoloživost</p>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

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
          
          {/* PROGRESS BAR */}
          <div className={styles.progressSection}>
            <div className={styles.progressBar}>
              {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
                <React.Fragment key={idx}>
                  <div className={`${styles.progressStep} ${currentStep > idx ? styles.completed : ''} ${currentStep === idx + 1 ? styles.active : ''}`}>
                    {idx + 1}
                  </div>
                  {idx < TOTAL_STEPS - 1 && (
                    <div className={`${styles.progressLine} ${currentStep > idx + 1 ? styles.completed : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className={styles.progressLabels}>
              <span className={currentStep === 1 ? styles.activeLabel : ''}>Podaci</span>
              <span className={currentStep === 2 ? styles.activeLabel : ''}>Lokacija</span>
              <span className={currentStep === 3 ? styles.activeLabel : ''}>Usluga</span>
              <span className={currentStep === 4 ? styles.activeLabel : ''}>Vreme</span>
            </div>
          </div>

          {/* FORM CONTENT */}
          <form className={styles.form} onSubmit={handleSubmit}>
            {renderStep()}

            {/* BUTTONS */}
            <div className={styles.buttonRow}>
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                ← Nazad
              </button>

              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Dalje →
                </button>
              ) : (
                <>
                  <button type="submit" className={`${styles.btn} ${styles.btnSuccess}`}>
                    {loadingSpin === true ? (
                      <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
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
                    <button onClick={(e) => {e.preventDefault; potvrdiTermin(formData);}} className={`${styles.btn} ${styles.btnInfo}`} type='button'>
                      {loadingSpinPotvrda ? (
                        <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                          <div className="spinnerMali" ></div>
                        </div>
                      ) : (
                        <p>Potvrdi</p>
                      )}
                    </button>
                  )}
                  {(tipUlaska === 2 || tipUlaska === 3) && (
                    <button onClick={handleOtkazi} className={`${styles.btn} ${styles.btnDanger}`} type='button'>
                      {loadingSpinOtkaz ? (
                        <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                          <div className="spinnerMali" ></div>
                        </div>
                      ) : (
                        <p>Otkaži termin</p>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>

            {Number(formData.potvrdio) !== 0 && formData.potvrdio_zaposlen && (
              <p className={styles.confirmInfo}><b>Termin potvrdio:</b> {formData.potvrdio_zaposlen.username}</p>
            )}
          </form>

          {/* O NAMA SECTION */}
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
