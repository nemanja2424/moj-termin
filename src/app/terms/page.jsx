'use client';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import styles from '../home.module.css'

export default function TermsPage() {
  return (
    <div className={styles.sve}>
        <Header />
        <main style={{ maxWidth: '800px', margin: '0 auto', marginTop:'120px'}}>
            <h1>Uslovi korišćenja – Moj Termin</h1>

            <h2>1. Opšti uslovi</h2>
            <ul>
                <li>1.1. Aplikacija „Moj Termin“ namenjena je zakazivanju termina za različite vrste delatnosti.</li>
                <li>1.2. Korišćenjem platforme korisnik prihvata ove uslove korišćenja u celosti.</li>
                <li>1.3. Platforma omogućava vođenje termina, pregleda, statistike i komunikacije sa klijentima, bez garantovanja tačnosti informacija unetih od strane krajnjih korisnika.</li>
                <li>1.4. Pristup platformi može biti ograničen u zavisnosti od pretplatnog paketa koji korisnik koristi.</li>
            </ul>

            <h2>2. Pravila korišćenja</h2>
            <ul>
                <li>2.1. Korisnik je odgovoran za tačnost informacija koje unosi na platformu.</li>
                <li>2.2. Zabranjena je zloupotreba sistema, uključujući spamovanje, korišćenje tuđih naloga i neovlašćeni pristup podacima drugih korisnika.</li>
                <li>2.3. Deljenje pristupnih podataka sa trećim licima nije dozvoljeno.</li>
                <li>2.4. Platforma zadržava pravo da, u slučaju kršenja pravila, deaktivira nalog korisnika bez prethodnog upozorenja.</li>
            </ul>

            <h2>3. Pretplate i plaćanje</h2>
            <ul>
                <li>3.1. Pretplata se obnavlja mesečno ili godišnje, u zavisnosti od izbora korisnika.</li>
                <li>3.2. Korisnik ima pravo da otkaže pretplatu u roku od 72h od prve uplate i zatraži povraćaj sredstava.</li>
                <li>3.3. Nakon isteka plaćenog perioda, funkcionalnosti naloga mogu biti ograničene dok se pretplata ne obnovi.</li>
            </ul>

            <h2>4. Ograničenje odgovornosti</h2>
            <ul>
                <li>4.1. Moj Termin ne preuzima odgovornost za štetu nastalu usled tehničkih problema, gubitka podataka ili nepravilnog korišćenja aplikacije.</li>
                <li>4.2. Platforma ne garantuje stalnu dostupnost usluge i može privremeno biti nedostupna zbog održavanja.</li>
                <li>4.3. Svi podaci se koriste na sopstvenu odgovornost korisnika.</li>
            </ul>

            <h2>5. Izmene i prekid usluge</h2>
            <ul>
                <li>5.1. Moj Termin zadržava pravo da izmeni uslove korišćenja u bilo kom trenutku.</li>
                <li>5.2. O svim važnim izmenama korisnici će biti blagovremeno obavešteni putem mejla ili obaveštenja u aplikaciji.</li>
                <li>5.3. Platforma može privremeno ili trajno obustaviti deo usluga bez obaveze nadoknade štete.</li>
            </ul>

            <h2>6. Privatnost i podaci</h2>
            <ul>
                <li>6.1. Moj Termin poštuje važeće zakone o zaštiti podataka i čuva privatnost korisnika.</li>
                <li>6.2. Podaci se ne dele sa trećim stranama bez pristanka korisnika, osim ako to ne zahteva zakon.</li>
                <li>6.3. Korisnici imaju pravo da zatraže uvid, izmenu ili brisanje svojih podataka.</li>
            </ul>
        </main>
      <Footer />
    </div>
  );
}
