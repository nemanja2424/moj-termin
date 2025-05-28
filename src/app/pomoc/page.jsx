'use client';
{/*
export default function PomocPage() {
  return (
    <div>
      
    </div>
  )
}
*/}


import React, { useRef, useState } from 'react';
import styles from './pomoc.module.css';

export default function PomocPage() {
  const containerRef = useRef();

  const scrollToSection = (index) => {
    const section = containerRef.current.children[index];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };
  

  const [openNav, setOpenNav] = useState(true)

  return (
    <div className={styles.PomocPage}>
      <div className={`${styles.navbar} ${openNav ? (styles.open) : ''}`}>
        <div className={styles.zatamni}></div>
        <div>
          <a onClick={() => {scrollToSection(0); setOpenNav(false);}}>
            <i className={`fa-solid fa-rocket ${styles.ikonaKartice}`}></i>
            <span className={styles.naslov}>Prvi koraci</span>
            <p>Saznajte kako da zapčnete sa korišćenjem i upoznate se sa osnovnim funkcijama.</p>
          </a>
          <a onClick={() => {scrollToSection(2); setOpenNav(false);}}>
            <i className={`fa-solid fa-clipboard-list ${styles.ikonaKartice}`}></i>
            <span className={styles.naslov}>Upravljanje podacima</span>
            <p>Saznajte kako upravljati terminima i svojim zaposlenima i upoznajte se sa svim funkcijama</p>
          </a>
          <a onClick={() => {scrollToSection(1); setOpenNav(false);}}>
            <i className={`fa-solid fa-bookmark ${styles.ikonaKartice}`}></i>
            <span className={styles.naslov}>Zakazivanje</span>
            <p>Saznajte kako funkcioniše zakazivanje termina i kako dizajnirati svoju stranu za zakazivanje.</p>
          </a>
          <a onClick={() => {scrollToSection(3); setOpenNav(false);}}>
            <i className={`fa-solid fa-credit-card ${styles.ikonaKartice}`}></i>
            <span className={styles.naslov}>Pretplata</span>
            <p>Pročitajte neka od mogućih pitanja koja vam se vrte u mislima i saznajte više o pretplatama.</p>
          </a>
          <a onClick={() => {scrollToSection(4); setOpenNav(false);}}>
            <i className={`fa-solid fa-bell ${styles.ikonaKartice}`}></i>
            <span className={styles.naslov}>Obaveštenja</span>
            <p>Saznajte kako i kada se šalju obaveštenja i kako promeniti sadržaj obaveštenja.</p>
          </a>
        </div>
        <i className={`fa fa-angle-down ${styles.otvoriIkona}`} onClick={() => setOpenNav(prev => !prev)}></i>
      </div>
      

      <div className={styles.sectionsContainer} ref={containerRef}>
        <section className={styles.section}>
          <h1>Prvi koraci</h1>
          <p>
            Dobrodošli u Moj Termin!<br /><br />
            Nakon što ste uspešno kreirali nalog, preporučujemo da prvo podesite osnovne podatke o vašoj firmi. U sekciji <strong>Podešavanja</strong> možete uneti naziv preduzeća i postaviti svoj logo, što će vašim klijentima omogućiti da vas lakše prepoznaju.<br /><br />
            Ako vaš paket podržava više lokacija, ovde možete dodati i sve poslovnice ili radna mesta vaše firme. Svaka lokacija može imati svoj naziv i adresu.<br /><br />
            Sledeći korak je dodavanje zaposlenih. U sekciji <strong>Zaposleni</strong> možete kreirati naloge za svoje radnike, dodeliti im pristup određenim lokacijama i omogućiti im da upravljaju terminima. Svaki zaposleni dobija svoj pristupni nalog i može samostalno pratiti svoje termine.<br /><br />
            Kada završite sa osnovnim podešavanjima, spremni ste da počnete sa zakazivanjem termina i korišćenjem svih funkcionalnosti sistema.
          </p>
        </section>
        <section className={styles.section}>
          <h1>Zakazivanje</h1>
          <p>
            Sistem Moj Termin omogućava jednostavno i brzo zakazivanje termina za vaše klijente.<br /><br />
            <strong>Kako klijent zakazuje termin?</strong><br />
            Klijent pristupa vašoj javnoj stranici za zakazivanje (link dobijate u podešavanjima ili putem QR koda). Na toj stranici bira željenu uslugu, lokaciju, datum i vreme, i ostavlja svoje podatke.<br /><br />
            <strong>Kako vi upravljate terminima?</strong><br />
            U kontrolnoj tabli (panelu) imate pregled svih zakazanih termina. Možete filtrirati termine po datumu, lokaciji ili zaposlenom. Svaki termin možete potvrditi, izmeniti ili otkazati. Klijent automatski dobija obaveštenje o svakoj promeni.<br /><br />
            <strong>Dodavanje termina ručno</strong><br />
            Ako želite, možete i sami ručno dodati termin za klijenta direktno iz panela, što je korisno za telefonska ili lična zakazivanja.<br /><br />
            <strong>Napomena:</strong> Broj termina i mogućnosti zavise od paketa koji ste izabrali.
          </p>
        </section>
        <section className={styles.section}>
          <h1>Upravljanje podacima</h1>
          <p>
            U sekciji <strong>Podešavanja</strong> možete u svakom trenutku izmeniti svoje lične podatke (ime, email, broj telefona), kao i podatke o firmi i lokacijama.<br /><br />
            <strong>Promena lozinke:</strong><br />
            Lozinku možete promeniti klikom na dugme "Izmeni" pored polja za lozinku. Potrebno je da unesete trenutnu i novu lozinku, a sistem će vas obavestiti o uspešnoj promeni.<br /><br />
            <strong>Upravljanje zaposlenima:</strong><br />
            U sekciji <strong>Zaposleni</strong> možete dodavati, menjati ili brisati naloge zaposlenih. Svakom zaposlenom možete dodeliti određenu lokaciju i prava pristupa.<br /><br />
            <strong>Bezbednost podataka:</strong><br />
            Svi vaši podaci su zaštićeni i dostupni samo ovlašćenim korisnicima. Redovno ažurirajte svoje podatke radi tačnosti i sigurnosti.
          </p>
        </section>
        <section className={styles.section}>
          <h1>Pretplata</h1>
          <p>
            Moj Termin nudi više paketa prilagođenih različitim potrebama:<br /><br />
            <strong>Personalni paket:</strong> Pogodan za pojedince ili male firme sa jednim nalogom i ograničenim brojem termina mesečno.<br /><br />
            <strong>Pro paket:</strong> Omogućava više lokacija, više korisničkih naloga i napredne funkcije kao što su statistika i analitika.<br /><br />
            <strong>Premium paket:</strong> Neograničen broj lokacija i korisnika, napredna podrška i sve funkcionalnosti sistema.<br /><br />
            Status vaše pretplate, datum isteka i mogućnost obnove ili promene paketa nalaze se u sekciji <strong>Pretplata</strong> u panelu.<br /><br />
            <strong>Napomena:</strong> Prilikom isteka pretplate, bićete obavešteni putem emaila i u samom panelu. Uvek možete produžiti ili promeniti paket prema potrebama vašeg poslovanja.
          </p>
        </section>
        <section className={styles.section}>
          <h1>Obaveštenja</h1>
          <p>
            Sistem automatski šalje obaveštenja putem emaila za sve važne događaje:<br /><br />
            - Kada klijent zakaže termin, vi i klijent dobijate potvrdu na email.<br />
            - Kada izmenite ili otkažete termin, klijent automatski dobija obaveštenje.<br />
            - Zaposleni dobijaju obaveštenja o svojim terminima i promenama.<br /><br />
            <strong>Podešavanje obaveštenja:</strong><br />
            U podešavanjima možete izabrati koje vrste obaveštenja želite da primate i na koje email adrese.<br /><br />
            <strong>Napomena:</strong> Proverite da li su vaši email podaci tačni kako biste uvek dobijali sve važne informacije. Ako ne dobijate obaveštenja, proverite spam folder ili kontaktirajte podršku.<br /><br />
            Za sva dodatna pitanja ili pomoć, obratite se našem timu putem kontakt forme ili emaila navedenog u sekciji "Pomoć".
          </p>
        </section>
      </div>

    </div>
  );
}
