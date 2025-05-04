'use client';

import { useState } from 'react';
import styles from './home.module.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header';


export default function HomePage() {
  const [monthly, setMonthly] = useState(true);

  const toggleTime = () => setMonthly(prev => !prev);
  const toggleYearly = () => setMonthly(true);
  const toggleMonthly = () => setMonthly(false);

  return (
    <>
     <Header />
      <div className={styles.hero}>
        <div className={styles['zatamni-hero']}></div>
        <div className={styles.content}>
          <div className={styles['hero-naslov']}>
            <h1>Digitalno zakazivanje termina za moderan biznis</h1>
            <h3>Brže i jednostavnije upravljanje terminima za vas i vaše klijente.</h3>
            <button className={styles.button1} style={{ marginTop: '20px' }}>Kontaktirajte nas</button>
          </div>
        </div>
      </div>

      <section className={styles['benefits-section']}>
        <h2>Zašto odabrati naš sistem?</h2>
        <div className={styles['benefits-cards']}>

          <div className={styles['benefit-card']}>
            <div className={styles['benefit-icon']}><i className="fa-regular fa-clock"></i></div>
            <div className={styles['benefit-title']}>Brzo i jednostavno zakazivanje</div>
            <div className={styles['benefit-desc']}>
              Naš sistem omogućava brzo kreiranje i pregled termina uz intuitivan interfejs koji štedi vreme i smanjuje greške.
            </div>
          </div>

          <div className={styles['benefit-card']}>
            <div className={styles['benefit-icon']}><i className="fa-solid fa-mobile-screen-button"></i></div>
            <div className={styles['benefit-title']}>Pristup sa bilo kog uređaja</div>
            <div className={styles['benefit-desc']}>
              Bez obzira da li ste na računaru, tabletu ili telefonu, pristup rasporedu i podacima je uvek na dohvat ruke.
            </div>
          </div>

          <div className={styles['benefit-card']}>
            <div className={styles['benefit-icon']}><i className="fa-solid fa-chart-line"></i></div>
            <div className={styles['benefit-title']}>Analitika i pregled poslovanja</div>
            <div className={styles['benefit-desc']}>
              Dobijte uvid u zauzetost, broj zakazanih termina, i produktivnost zaposlenih kroz pregledne grafikone i statistiku.
            </div>
          </div>

          <div className={styles['benefit-card']}>
            <div className={styles['benefit-icon']}><i className="fa-solid fa-bell"></i></div>
            <div className={styles['benefit-title']}>Automatska obaveštenja</div>
            <div className={styles['benefit-desc']}>
              Sistem automatski obaveštava klijente i osoblje o svakom novom terminu, otkazivanju ili izmeni – bez dodatnog napora.
            </div>
          </div>

          <div className={styles['benefit-card']}>
            <div className={styles['benefit-icon']}><i className="fa-solid fa-lock"></i></div>
            <div className={styles['benefit-title']}>Sigurnost podataka</div>
            <div className={styles['benefit-desc']}>
              Svi podaci su zaštićeni modernim sigurnosnim protokolima kako biste vi i vaši klijenti bili bezbedni u svakom trenutku.
            </div>
          </div>

          <div className={styles['benefit-card']}>
            <div className={styles['benefit-icon']}><i className="fas fa-headset"></i></div>
            <div className={styles['benefit-title']}>Lična podrška i pomoć</div>
            <div className={styles['benefit-desc']}>
              Naš tim je tu da vam pomogne pri svakom koraku – od podešavanja do svakodnevne upotrebe sistema.
            </div>
          </div>

        </div>
      </section>


      <section className={styles['info-between']}>
        <h2><br />Rešite sve svoje potrebe za zakazivanje termina na jednom mestu</h2>
        <p>Naš sistem za digitalno zakazivanje termina je jednostavan za korišćenje i prilagodljiv svim vrstama poslovanja. Bilo da ste frizer, lekar, trener ili neko drugi ko upravlja terminima, naš alat vam omogućava brzo i efikasno upravljanje, štedeći vreme i smanjujući greške. Sa našim rešenjem, vaši klijenti će imati jednostavan pristup, a vi ćete moći da se fokusirate na rast svog biznisa.</p>
        <p><br/>Naš sistem nudi jednostavnu stranu za zakazivanje termina za vaše klijente, kontrolnu tablu za vas sa svim potrebnim informacijama, kao i naprednu analitiku koja vam pomaže da pratite učinkovitost vašeg poslovanja. Uz mogućnost automatskog slanja obaveštenja i bezbednost podataka, možete biti sigurni da će vaše poslovanje teći glatko i sigurno.</p>
        <p><br/>Bez obzira na vrstu vašeg biznisa, naš sistem je fleksibilan i lako se integriše u vaše postojeće radne procese. Pružite svojim klijentima najbolje iskustvo u zakazivanju termina i uštedite dragoceno vreme!</p>
      </section>


      <section className={styles['benefits-section']}>
        <h2>Fleksibilni paketi za svaki biznis</h2>
        <div>
          <h6 className="mb-0 pb-3 h6">
            <span id="prijavaOkret" onClick={toggleTime}>
              Mesečno
            </span>
            <span id="registracijaOkret" onClick={toggleTime}>
              Godišnje
            </span>
          </h6>
          <input
            type="checkbox"
            checked={monthly}
            onChange={toggleTime}
            id="reg-log"
            name="reg-log"
            className={styles.checkbox}
          />
          <label htmlFor="reg-log"></label>
        </div>

        <div className={styles.paketi}>
          {/* Osnovni paket */}
          <div className={styles.paket}>
            <h2>Osnovni paket</h2>
            <p>1 organizacija</p>
            <p>Do 3 korisnička naloga</p>
            <p>Online kalendar</p>
            <p>Email obaveštenja</p>
            <p>Korisnička podrška</p>
            <p>Integracija na vaš sajt - 600 RSD</p>
            <div className={styles.cena}>
              {!monthly ? (
                <h3>2.500 RSD</h3>
              ) : (
                <h3 className={styles['godisnja-cena']}>
                  25.000 RSD <span>30.000 RSD</span>
                </h3>
              )}
            </div>
          </div>
          <div className={styles.paket}>
            <h2>Pro paket</h2>
            <p>1 organizacija</p>
            <p>Do 5 korisničkih naloga</p>
            <p>Online kalendar</p>
            <p>Statistika</p>
            <p>Email obaveštenja</p>
            <p>Korisnička podrška</p>
            <p>Integracija na vaš sajt - 600 RSD</p>
            <div className={styles.cena}>
              {!monthly ? (
                <h3>5.000 RSD</h3>
              ) : (
                <h3 className={styles['godisnja-cena']}>
                  45.000 RSD <span>60.000 RSD</span>
                </h3>
              )}
            </div>
          </div>
          <div className={styles.paket}>
            <h2>Premium paket</h2>
            <p>Neograničen broj organizacija</p>
            <p>Neograničen broj korisničkih naloga</p>
            <p>Online kalendar</p>
            <p>Statistika</p>
            <p>Email obaveštenja</p>
            <p>Korisnička podrška</p>
            <p>Besplatna integracija na vaš sajt</p>
            <div className={styles.cena}>
              {!monthly ? (
                <h3>10.000 RSD</h3>
              ) : (
                <h3 className={styles['godisnja-cena']}>
                  80.000 RSD <span>120.000 RSD</span>
                </h3>
              )}
            </div>
          </div>
          <div className={styles.paket}>
            <h2>Personalni paket</h2>
            <p>1 korisnički nalog</p>
            <p>Online kalendar</p>
            <p>Email obaveštenja</p>
            <p>Bez integracije na vašem sajtu</p>
            <p>Do 20 termina mesečno</p>
            <h3 className={styles.cena}>Besplatno</h3>
          </div>
        </div>
      </section>


      <section className={styles['cta-section']}>
        <div className={styles['zatamni-cta']}></div>
        <div className={styles['cta-content']}>
          <h2>Zainteresovani? Prijavite se za besplatan probni period od 14 dana!</h2>
          <p>Isprobajte sve funkcionalnosti...</p>
          <button className={styles['cta-button']}>Zatraži probni period</button>
          <p className={styles['cta-note']}>Bez obaveza, bez automatske naplate...</p>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
