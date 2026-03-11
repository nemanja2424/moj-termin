'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import styles from './home.module.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header';


export default function HomePage() {
  const [monthly, setMonthly] = useState(true);

  const toggleTime = () => setMonthly(prev => !prev);
  const toggleYearly = () => setMonthly(true);
  const toggleMonthly = () => setMonthly(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('hidden');
    
          if (entry.target.classList.contains('anim')) {
            entry.target.classList.add('fade-slide-in-right');
          } else if (entry.target.classList.contains('anim2')) {
            entry.target.classList.add('fade-slide-in-down');
          } else if (entry.target.classList.contains('anim3')) {
            entry.target.classList.add('fade-slide-in-left');
          } else if (entry.target.classList.contains('anim4')) {
            entry.target.classList.add('fade-slide-in-up');
          }
    

    
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    

    const elementsAnim = document.querySelectorAll('.anim');
    const elementsAnim2 = document.querySelectorAll('.anim2');
    const elementsAnim3 = document.querySelectorAll('.anim3');
    const elementsAnim4 = document.querySelectorAll('.anim4');

    elementsAnim.forEach(el => {
      el.classList.add('hidden');
      observer.observe(el);
    });

    elementsAnim2.forEach(el => {
      el.classList.add('hidden');
      observer.observe(el);
    });

    elementsAnim3.forEach(el => {
      el.classList.add('hidden');
      observer.observe(el);
    });

    elementsAnim4.forEach(el => {
      el.classList.add('hidden');
      observer.observe(el);
    });

    return () => {
      elementsAnim.forEach(el => observer.unobserve(el));
      elementsAnim2.forEach(el => observer.unobserve(el));
      elementsAnim3.forEach(el => observer.unobserve(el));
      elementsAnim4.forEach(el => observer.unobserve(el));
    };
  }, []);
  {/* animacije: 1 = desno, 2 = dole, 3 = levo, 4 = gore */}



  return (
    <div className={styles.sve}>
      <Header />
      <div className={styles.hero}>
        <div className={styles['zatamni-hero']}></div>
        <div className={styles.content}>
          <div className={styles['hero-naslov']}>
            <h1 className='anim2'>Digitalno zakazivanje termina za moderan biznis</h1>
            <h3 className='anim3'>Brže i jednostavnije upravljanje terminima za vas i vaše klijente.</h3>
            <a href="#footer" className={`${styles.button1} + anim4`} style={{ marginTop: '20px' }}>Kontaktirajte nas</a>
          </div>
        </div>
      </div>

      <section className={styles['info-between']}>
        <h2 className='anim2'><br />Rešite sve svoje potrebe za zakazivanje termina na jednom mestu</h2>
        <p className='anim'>Naš sistem za digitalno zakazivanje termina je jednostavan za korišćenje i prilagodljiv svim vrstama poslovanja. Bilo da ste frizer, lekar, trener ili neko drugi ko upravlja terminima, naš alat vam omogućava brzo i efikasno upravljanje, štedeći vreme i smanjujući greške. Sa našim rešenjem, vaši klijenti će imati jednostavan pristup, a vi ćete moći da se fokusirate na rast svog biznisa.</p>
        <p className='anim3'><br/>Naš sistem nudi jednostavnu stranu za zakazivanje termina za vaše klijente, kontrolnu tablu za vas sa svim potrebnim informacijama, kao i analitiku koja vam pomaže da pratite učinkovitost vašeg poslovanja. Uz mogućnost automatskog slanja obaveštenja i bezbednost podataka, možete biti sigurni da će vaše poslovanje teći glatko i sigurno.</p>
        <p className='anim4'><br/>Bez obzira na vrstu vašeg biznisa, naš sistem je fleksibilan i lako se integriše u vaše postojeće radne procese. Pružite svojim klijentima najbolje iskustvo u zakazivanju termina i uštedite dragoceno vreme!</p>
      </section>

      <section id='about' className={styles['benefits-section']}>
        <h2>Zašto odabrati naš sistem?</h2>
        <div className={styles['benefits-cards']}>

          <div className={`${styles['benefit-card']} anim2`}>
            <div className={styles['benefit-icon']}><i className="fa-regular fa-clock"></i></div>
            <div className={styles['benefit-title']}>Brzo i jednostavno zakazivanje</div>
            <div className={styles['benefit-desc']}>
              Naš sistem omogućava brzo kreiranje i pregled termina uz intuitivan interfejs koji štedi vreme i smanjuje greške.
            </div>
          </div>

          <div className={`${styles['benefit-card']} anim2`}>
            <div className={styles['benefit-icon']}><i className="fa-solid fa-mobile-screen-button"></i></div>
            <div className={styles['benefit-title']}>Pristup sa bilo kog uređaja</div>
            <div className={styles['benefit-desc']}>
              Bez obzira da li ste na računaru, tabletu ili telefonu, pristup rasporedu i podacima je uvek na dohvat ruke.
            </div>
          </div>

          <div className={`${styles['benefit-card']} anim2`}>
            <div className={styles['benefit-icon']}><i className="fa-solid fa-chart-line"></i></div>
            <div className={styles['benefit-title']}>Analitika i pregled poslovanja</div>
            <div className={styles['benefit-desc']}>
              Dobijte uvid u zauzetost, broj zakazanih termina i produktivnost zaposlenih kroz pregledne grafikone i statistiku.
            </div>
          </div>

          <div className={`${styles['benefit-card']} anim4`}>
            <div className={styles['benefit-icon']}><i className="fa-solid fa-bell"></i></div>
            <div className={styles['benefit-title']}>Automatska obaveštenja</div>
            <div className={styles['benefit-desc']}>
              Sistem automatski obaveštava klijente i osoblje o svakom novom terminu, otkazivanju ili izmeni – bez dodatnog napora.
            </div>
          </div>

          <div className={`${styles['benefit-card']} anim4`}>
            <div className={styles['benefit-icon']}><i className="fa-solid fa-lock"></i></div>
            <div className={styles['benefit-title']}>Sigurnost podataka</div>
            <div className={styles['benefit-desc']}>
              Svi podaci su zaštićeni modernim sigurnosnim protokolima kako bi vi i vaši klijenti bili bezbedni u svakom trenutku.
            </div>
          </div>

          <div className={`${styles['benefit-card']} anim4`}>
            <div className={styles['benefit-icon']}><i className="fas fa-headset"></i></div>
            <div className={styles['benefit-title']}>Lična podrška i pomoć</div>
            <div className={styles['benefit-desc']}>
              Naš tim je tu da vam pomogne pri svakom koraku – od podešavanja do svakodnevne upotrebe sistema.
            </div>
          </div>

        </div>
      </section>

      
      <section className={styles['info-between']}>
        <h2 className='anim2'><br />Rešite sve svoje potrebe za zakazivanje termina na jednom mestu</h2>
        <p className='anim'>Platforma takođe omogućava upravljanje više poslovnih lokacija, gde svaka može imati svoje radno vreme, zaposlene i usluge. Sve informacije o terminima, zaposlenima i lokacijama nalaze se na jednom mestu, što olakšava svakodnevno upravljanje poslovanjem.</p>
      </section>

      


      <section className={styles['cta-section']}>
        <div className={styles['zatamni-cta']}></div>
        <div className={`${styles['cta-content']} anim4`}>
          <h2>Zainteresovani? Javite se i počnite da zakazujete lako!</h2>
          <p>Moj Termin prima rezervacije umesto vas – dok vi radite, odmarate ili spavate. <br />
          Sve funkcioniše automatski: klijenti sami biraju slobodan termin, a vi dobijate obaveštenje. Jednostavno, zar ne?</p>
          <a href='mailto:info@mojtermin.site'><button className={styles['cta-button']}>Kontaktirajte nas</button></a><br/><br/>
          <span>Ili isprobajte besplatnu verziju <a href='/login?register=true' style={{color:"#0aadff"}}>kreiranjem naloga</a>.</span>
        </div>
      </section>

      <section className="ponuda-usluga">
        <div className="container anim3">
          <h2>Dodatne usluge</h2>
          <p>
            Takođe nudimo i <strong>redizajn postojećih web sajtova</strong>,
            kao i <strong>izradu novih sajtova</strong> u potpunosti prilagođenih vašim poslovnim ciljevima.
          </p>
          <p style={{fontSize:'18px'}}>
            <br/>
            Za više informacija i individualnu ponudu, javite na <a href='mailto:jakovljevic.nemanja@outlook.com' style={{color:"#0aadff"}}>jakovljevic.nemanja@outlook.com</a>.
          </p>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
