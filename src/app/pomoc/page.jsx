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
          <a onClick={() => {scrollToSection(1); setOpenNav(false);}}>
            <i className={`fa-solid fa-clipboard-list ${styles.ikonaKartice}`}></i>
            <span className={styles.naslov}>Upravljanje podacima</span>
            <p>Saznajte kako upravljati terminima i svojim zaposlenima i upoznajte se sa svim funkcijama</p>
          </a>
          <a onClick={() => {scrollToSection(2); setOpenNav(false);}}>
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
            Dobrodošli u <strong>Moj Termin</strong>.<br /><br />

            Glavna funkcija ovog servisa je <strong>jednostavno i lako online zakazivanje termina</strong>. Ono što odlikuje ovaj servis, osim jednostavnosti za vaše klijente, jeste i <strong>potpuna kontrola</strong> nad vašim <strong>podacima</strong>, <strong>zakazanim terminima</strong> i <strong>zaposlenima</strong>.<br /><br />

            Takođe, tu su i <strong>email obaveštenja</strong> koja stižu kako vama, tako i vašim klijentima koji su zakazali termin. Više o obaveštenjima pročitajte ovde.<br /><br />

            Nakon što ste uspešno kreirali nalog, preporučujemo da prvo podesite osnovne podatke o vašoj firmi. U sekciji <strong>Podešavanja</strong> možete uneti <strong>naziv preduzeća</strong> i postaviti <strong>logo</strong>, što će vašim klijentima omogućiti da vas lakše prepoznaju.<br /><br />

            Ispod se nalazi sekcija za <strong>dodavanje lokacija</strong>. Dodajte <strong>minimalno jednu lokaciju</strong> kako ne bi dolazilo do problema i kako biste nesmetano mogli da promenite paket ukoliko bude potrebe za tim.<br /><br />

            Ako vaš paket podržava više lokacija, ovde možete dodati i sve <strong>poslovnice</strong> ili <strong>radna mesta</strong> vaše firme. Svaka lokacija može imati svoj naziv i adresu.<br /><br />

            Sledeći korak je <strong>dodavanje zaposlenih</strong>. U sekciji <strong>Zaposleni</strong> možete kreirati <strong>naloge za radnike</strong>, dodeliti im pristup određenim lokacijama i omogućiti im da upravljaju terminima. Svaki zaposleni dobija svoj <strong>pristupni nalog</strong> i može <strong>samostalno pratiti svoje termine</strong>.<br /><br />

            Kada završite sa <strong>osnovnim podešavanjima</strong>, spremni ste da počnete sa <strong>zakazivanjem termina</strong> i korišćenjem svih funkcionalnosti sistema.
          </p>
        </section>
        <section className={styles.section}>
          <h1>Upravljanje podacima</h1>
          <p>
            <strong>Upravljanje terminima</strong><br />
            Kako bi efikasno upravljali terminima, i iskoristili pun potencijal ovog servisa, ovde možete saznati sve funkcije. Na početnoj strani se nalazi sekcija koja prikazuje 10 najnovijih termina. Ta sekcija služi za brzi pregled novih termina.<br /><br />
            Dok na strani termini možete naći kalendar sa svim terminima. U kalendaru možete odabrati datum i ispod će se prikazati svi termini za taj dan. Svaki termin ćete moći da potvrdite, otkažete i izmenite vreme i datum. Prilikom potvrđivanja, izmene ili otkazivanja termina vaš klijent koji je zakazao termin dobija email obaveštenje na adresu koju je uneo prilikom zakazivanja. Takođe kada neko zakaže termin vama i svim vašim zaposlenicima stiže email obaveštenje (saznajte više o obaveštenjima ovde).<br /><br />
            Na početnoj strani panela i na strani termina, možete vi dodati novi termin za vašeg klijenta. Njemu će stići obaveštenje na unetu email adresu.<br /><br />
            Vaši klijenti će takođe imati opcije izmene i otkazivanja termina. Vama i vašim zaposlenima isto stižu obaveštenja o promenama, i termin će morati ponovo da se potvrdi.<br /><br />
            <strong>Upravljanje nalozima – zaposlenima</strong><br />
            Ovisno od odabranog paketa imate pravo na kreiranje naloga za vaše zaposlene. Kada dostignete ograničenje, biće vam onemogućeno kreiranje novih naloga. Prilikom kreiranja naloga za zaposlenog unosite ime, email, lozinku, broj telefona i radno mesto. Obavezno je uneti tačnu email adresu kako bi vaš zaposlenik primao email obaveštenja o novim terminima, dok lozinka treba da sadrzi najmanje 8 karaktera.<br /><br />
            Kako budete dodavali korisnike tako će se oni pojavljivati u tabeli. Tabela sadrži promenljiva polja, i nakon promene podataka klikom na dugme „izmeni“ ćete sačuvati promene.<br /><br />
            Lozinku naloga možete promeniti bilo kog trenutka klikom na dugme „nova loznka“, i to bez navođenja već postojeće lozinke. Takođe tu je funkcija brisanja naloga ukoliko to želite. Klikom na dugme „obriši“ dugme će pocrveneti i promeniće se tekst u „potvrdi“. Tek nakon klika na „potvrdi“ korisnik će biti obrisan.<br /><br />
            Nalozi koje napravite za zaposlene će imati pristup samo za početnu stranu panela, termine , statistiku i pomoć. Takođe moćiće da vide samo termine koji su zakazani na poslovnici u kojoj rade.
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
          <h1>Pretplata</h1>
          <p>
            Plaćanje usluga za sada još nije automatsko preko servisa kao što je Stripe. Zbog ovog nedostatka nakon isteka pretplate će biti postavljen rok od 3 dana preko za plaćanje i potvrdu sa naše strane. Ukoliko sledeći mesec platite u ovom dodatnom roku od 3 dana, vašoj pretplati se oduzima broj dana koji kasnite sa uplatom. Još jednom naglašavamo da je trajanje mesečnih paketa uvek 30 dana (ne od 5. do 5. u sledećem mesecu).<br /><br />
            <strong>Šta se dešava sa podacima ako ne stignem da obnovim paket na vreme?</strong><br />
            Ukoliko ne stignete na vreme da obnovite paket, vama i vašim zaposlenima ostaje pristup panelu još 3 meseca, ali vaši klijenti neće moći zakazivati nove termine. A nakon isteka 3 meseca svi vaši podaci (termini, korsnici) će biti trajno obrisani.<br /><br />
            <strong>Promena mesečnog paketa</strong><br />
            Za promenu paketa potrebno je otići na stranu „Pretplata“ i odabrati novi željeni paket. Ili nam se možete javiti na email adresu uprava@mojtermin.site sa naslovo „promena mesečnog paketa“ i napisati koji paket želite, da li želite da vas pozovem, i ukoliko ne pišete sa email adrese koju ste naveli prilikom registracije navedite je ponovo u poruci. Nakon toga dobićete odgovor sa više informacija. Promene će moći da se vrše samo za sledeći mesec.<br /><br />
            Ukoliko želite sami da promenite paket, sa manjeg na veći neće biti nikakvih problema, ograničenja će vam se samo proširiti . Ukoliko želite da sa većeg pređete na manji paket – onda nakon odabranog manjeg paketa ćete dobiti pitanje koja radna mesta želite da zadržite. Nakon odabira i potvrde odmah gubite pristup radnim mestima koje niste zadržali. Poželjno je menjati paket pred istek pretplate.<br /><br />
            <strong>Promena godišnjeg paketa</strong><br />
            Za sada je neophodno javiti se na mejl uprava@mojtermin.site sa naslovom „Promena godišnjeg paketa“ i napisati koji paket želite, da li želite da vas pozovem, i ukoliko ne pišete sa email adrese koju ste naveli prilikom registracije navedite je ponovo u poruci. Nakon toga dobićete odgovor sa više informacija. Prilikom pretplate na veći paket, samo će te doplatiti razliku u ceni za preostale mesece. Smanjivanje paketa nije moguće, i zato se nude i personalni paket i potpuno prilagođeni paketi, kako bi vi dobili baš ono što vam treba.<br /><br />
            <strong>Otkazivanje i promena paketa na jeftinije izbore</strong><br />
            Otkazivanje i promena paketa na jeftiniji izbor je moguć u prva 3 dana od uplate pretplate. Kasnije se svi prihodi ulažu u dalje razvijanje servisa i povratak novca neće biti moguć nakon 3 dana.
          </p>
        </section>
        <section className={styles.section}>
          <h1>Obaveštenja</h1>
          <p>
            Obaveštenja su jedna od najvažnijih funkcija ovog servisa. Ona vam štede vreme i ubrzavaju proces zakazivanja termina. Za sada se sva obaveštenja šalju putem email-a preko adrese obavestenje@mojtermin.site. Obaveštenja se šalju u određenim slučajevima kroz koje ćemo sada da prođemo.<br /><br />
            <strong>Zakazivanje termina</strong><br />
            Kada vaš klijent zakaže termin obaveštenja se šalju vama, svim vašim zaposlenicima i vašem klijentu. To je podrazumevano podešavanje, koje možete isključiti i sami odabrati kome slati obaveštenja a kome ne na strani za podešavanja.(Videćemo na kojoj strani)<br /><br />
            Vama i vašim zaposlenicima stiže email koji vas obaveštava da je neko zakazao novi termin. U emailu će se nalaziti njegovi podaci koje je uneo i dugme za potvrdu termina, kao i link do panela.<br /><br />
            Dok korisniku stiže email isto sa unetim podacima, i linkom za izmenu termina. Taj link će otvarati stranu na kojoj će moći da promeni vreme i datum termina, ili da ga otkaže ukoliko bude hteo.<br /><br />
            <strong>Potvrda termina</strong><br />
            Prilikom potvrde termina vaš klijent ponovo dobija obaveštenje o tome kako ste vi ili vaš zaposleni potvrdio termin i spreman je da primi klijenta. U email-u će biti podaci naloga koji je potvrdio termin, npr. ime i email.<br /><br />
            <strong>Izmena termina</strong><br />
            Izmene termina mogu da se dese sa strane vas (preduzeća) ili sa strane klijenta. U slučaju da neko iz preduzeća promeni termin, email stiže samo klijentu čiji je termin izmenjen. <br /><br />
            U obrnutom slučaju, ako klijent menja termin, obaveštenja se šalju ponovo svim zaposlenima, osim ako neko nije potvrdio termin. Ako je neko potvrdio termin obaveštenje će stići samo zaposlenom koji je potvrdio termin. I u tom email-u će biti novi podaci termina.<br /><br />
            Na strani (nije odlučena  strana) ćete moći da promenite sadržaje obaveštenja, i kome da se šalju mejlovi.
          </p>
        </section>
      </div>

    </div>
  );
}
