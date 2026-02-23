from dotenv import load_dotenv
from together import Together
from datetime import datetime
import json

load_dotenv()
client = Together()


# Mapping od skraćenih imena na pune model zvanične nazive
MODEL_NAMES = {
    #"llama3": "meta-llama/Meta-Llama-3-8B-Instruct-Lite",
    "llama3": "meta-llama/Llama-3.2-3B-Instruct-Turbo",
    "llama4": "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8"
}


def askAI(data_firme, poruke, pitanje, model="llama4"):
    today = datetime.today()
    
    # Formatiraj JSON sa podacima firme
    formatted_data = json.dumps(data_firme, indent=2, ensure_ascii=False)
    
    # SYSTEM PROMPT za llama4 - kompletan sa svih mogućnostima
    system_prompt_llama4 = """
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

        AGENT PROPOSAL:
        Kada korisnik traži akciju, generiši samo radnju i poruku:

        [agent_proposal]
        {
          "radnja": "kreiranje|izmena|otkazivanje|potvrdjivanje",
          "poruka": "Kratko",
          "body": {
            "ime": [ime iz podataka], "email": [email iz podataka], "telefon": [telefon iz podataka],
            datum_rezervacije: "2026-02-13", "vreme": "08:00", duzina_termina: [trajanje iz podataka]
            "lokacija": [iskljucivo ID, ne ime. iz podataka], "token": [token iz podataka], "opis": [opis iz podataka]
            "potvrdio": [id korisnika ili null]
          }
        }
        [/agent_proposal]
        Nikada ne prikazujes JSON

        Obavezni podaci:
        - Ime
        - email
        - datum
        - vreme 
        - duzina trajanja
        - Lokacija
        
        AGENT PROPOSAL pises tek kada korisnik unese sve ove podatke.
        Ako ne unese naglasi mu da mora da ih unese.

        Popuni sva polja podacima koji su ti dostavljeni, ne izostavljaj nista, ostala ostavljaju null.
        Nema mogucnosti za bulk radnje.
        Nakon kreiranja termina, token se kreira u backend-u i korisnik ako hoce da menja taj termin mora da napravi novi chat.
    """
    
    # SYSTEM PROMPT za llama3 - pojednostavljen, bez grafika
    system_prompt_llama3 = """
        Ti si AI asistent za zakazivanje termina na mojtermin.site
        Nikada ne prikazujes JSON

        Obavezni podaci:
        - Ime
        - email
        - datum
        - vreme 
        - duzina trajanja
        - Lokacija
        
        AGENT PROPOSAL pises tek kada korisnik unese sve ove podatke.
        Ako ne unese naglasi mu da mora da ih unese.

            AGENT PROPOSAL:
            Kada korisnik traži akciju, generiši samo radnju i poruku:

            [agent_proposal]
            {
            "radnja": "kreiranje",
            "poruka": "Kratko",
            "body": {
                "ime": [ime iz podataka], "email": [email iz podataka], "telefon": [telefon iz podataka],
                datum_rezervacije: "yyyy-mm-dd", "vreme": "hh:mm", duzina_termina: [trajanje iz podataka]
                "lokacija": [iskljucivo ID, ne ime. iz podataka], "token": [token iz podataka], "opis": [opis iz podataka]
                "potvrdio": [id korisnika ili null]
            }
            }
            [/agent_proposal]
            
            JSON mora da bude isti kao i u primeru, menjas samo vrednosti
            OBAVEZNO NAPISI SVA POLJA, PA MAKAR BILA BEZ VREDNOSTI ILI NULL
            Nakon kreiranja termina, token se kreira u backend-u i korisnik ako hoce da menja taj termin mora da napravi novi chat.
    """
    
    # Odaberi odgovarajući system prompt
    if model == "llama3":
        system_content = system_prompt_llama3
    else:
        system_content = system_prompt_llama4
    
    # Izgradi messages niz sa sistemskim instrukcijama
    messages = [
        {
            "role": "system",
            "content": system_content
        },
        {
            "role": "system",
            "content": f"PODACI FIRME:\n{formatted_data}\n\nDanasnji datum: {today}"
        }
    ]
    #print(formatted_data)
    # Dodaj prethodne poruke (conversation history)
    messages.extend(poruke)
    
    # Dodaj novo pitanje korisnika
    messages.append({
        "role": "user",
        "content": pitanje
    })
    
    # Dobij puni naziv modela
    full_model_name = MODEL_NAMES.get(model, MODEL_NAMES["llama4"])
    
    print(f"\n🤖 AI ZAHTEV - Model: {model.upper()} ({full_model_name})")
    print(f"💬 Pitanje: {pitanje[:80]}...")
    print(f"📊 Broj prethodnih poruka: {len(poruke)}")
    print()

    # Pozovi LLM
    response = client.chat.completions.create(
        model=full_model_name,
        messages=messages,
        temperature=0.2,
    )
    
    print(response.choices[-1].message.content)
    return response.choices[0].message.content
