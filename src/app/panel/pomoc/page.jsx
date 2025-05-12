import React from 'react';
import stylesPanel from '../panel.module.css';

export default function PomocPage() {
  return (
    <div className={stylesPanel.PomocPage}>
      <h1>Pomoć</h1>

      <section>
        <h2>Prvi koraci</h2>
        <p>Otkrijte kako da započnete sa korišćenjem aplikacije, uključujući registraciju i prijavu.</p>
      </section>

      <section>
        <h2>Pravljenje organizacije</h2>
        <p>Naučite kako da kreirate organizaciju i dodate osnovne podatke o njoj.</p>
      </section>

      <section>
        <h2>Upravljanje korisnicima</h2>
        <p>Dodajte, izmenite ili obrišite korisnike, kao i dodelite im uloge.</p>
      </section>

      <section>
        <h2>Upravljanje terminima</h2>
        <p>Saznajte kako da zakazujete, izmenjujete ili otkazujete termine.</p>
      </section>

      <section>
        <h2>Obaveštenja</h2>
        <p>Postavite obaveštenja za korisnike i upravljajte njima.</p>
      </section>

      <section>
        <h2>Kreiranje strane za zakazivanja</h2>
        <p>Prilagodite stranicu za zakazivanje prema potrebama vaših klijenata.</p>
      </section>
    </div>
  );
}