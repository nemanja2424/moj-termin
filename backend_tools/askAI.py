from dotenv import load_dotenv
from together import Together
from datetime import date
import json

load_dotenv()
client = Together()


def askAI(data_firme, poruke, pitanje):
    """
    Poziva LLM sa kontekstom podataka firme za analizu i savete.
    
    Parametri:
        data_firme (dict): Podaci preuzeti sa /zakazivanja/{id} endpointa.
                          Podaci se keširaju na backend-u tokom sesije
                          kako ne bi prenatrpavili AI kontekst.
        poruke (list): Istorija prethodnih poruka u formatu:
                      [{"role": "user/assistant", "content": "..."}, ...]
        pitanje (str): Korisnikovo novo pitanje
    
    Vraća:
        str: Odgovor AI asistenta
    
    Napomena:
        - Keš se čuva u `firm_data_cache` dict-u u app.py
        - Prvom pozivu se preuzimaju podaci, narednim se koristi keš
        - Korisnik može ručno obrisati keš sa /api/clearCache rutom
    """
    today = date.today()
    
    # Formatiraj JSON sa podacima firme
    formatted_data = json.dumps(data_firme, indent=2, ensure_ascii=False)
    
    # Izgradi messages niz sa sistemskim instrukcijama
    messages = [
        {
            "role": "system",
            "content": """
                Ti si AI asistent za mojtermin.site.

                Tvoj zadatak je da pomažeš vlasnicima firmi u donošenju odluka
                na osnovu TAČNO prosleđenih podataka u JSON formatu.

                Pravila:
                - Koristi isključivo podatke iz JSON-a
                - Ako podatak ne postoji, jasno to reci
                - Ne nagađaj i ne izmišljaj
                - Predlaži optimizacije samo ako postoji osnova u podacima
                - Govori jasno i prijateljski
                - Ne spominji ID-jeve i JSON
                - Dobio si sve podatke koji postoje, ništa ne fali

                Korisnicima omogućava da podese firmu, lokacije i radno vreme, dodaju zaposlene i upravljaju terminima iz admin panela.
                Priručnik pokriva:
                Prve korake: osnovna podešavanja firme, lokacija i zaposlenih
                Upravljanje terminima: pregled, potvrda, izmena i otkazivanje termina
                Zakazivanje: kako klijenti zakazuju termine i kako se sprečava preklapanje
                Pretplate: paketi, ograničenja i obnova
                Obaveštenja: automatski emailovi pri zakazivanju i promenama termina
                URL za uputsvo: "https://mojtermin.site/pomoc"

                GRAFICI I VIZUELIZACIJA:
                Kada trebaju da prikazeš analizu sa graficima, koristi sledeći format:

                [CHART]{
                  "type": "bar|line|pie",
                  "title": "Naslov grafikona",
                  "data": [{"key": "value", ...}, ...],
                  "xKey": "kolona_za_x_osu",
                  "yKey": "kolona_za_y_osu"
                }[/CHART]

                Primer - Broj termina po danu:
                [CHART]{
                  "type": "bar",
                  "title": "Broj termina po danu",
                  "data": [
                    {"date": "2026-02-13", "count": 1},
                    {"date": "2026-02-18", "count": 8},
                    {"date": "2026-02-20", "count": 8}
                  ],
                  "xKey": "date",
                  "yKey": "count"
                }[/CHART]

                Primer - Distribucija zaposlenih (pie chart):
                [CHART]{
                  "type": "pie",
                  "title": "Distribucija termina po zaposlenom",
                  "data": [
                    {"name": "Marko", "value": 15},
                    {"name": "Ana", "value": 22}
                  ],
                  "xKey": "name",
                  "yKey": "value"
                }[/CHART]

                Koristi grafike kada:
                - Analiziruješ trendove termina po vremenskog perioda
                - Prikazuješ distribuciju (zaposleni, usluge, itd)
                - Poređuješ vrednosti (zarada, termini, itd)
                - Prikazuješ progrese i statistiku

                Uvek dodaj tekstualni opis IZ PODATAKA pre i/ili posle grafikona.
            """
        },
        {
            "role": "system",
            "content": f"PODACI FIRME:\n{formatted_data}\n\nDanasnji datum: {today}"
        }
    ]
    
    # Dodaj prethodne poruke (conversation history)
    messages.extend(poruke)
    
    # Dodaj novo pitanje korisnika
    messages.append({
        "role": "user",
        "content": pitanje
    })
    
    # Pozovi LLM
    response = client.chat.completions.create(
        model="meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
        messages=messages,
        temperature=0.2
    )
    
    return response.choices[0].message.content
