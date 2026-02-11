import requests
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, get_jwt, jwt_required, get_jwt_identity
from flask_cors import CORS
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
from werkzeug.utils import secure_filename
import secrets
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import time
from backend_tools.askAI import askAI
from backend_tools.chat_manager import (
    create_new_chat, save_chat_message, load_chat, 
    get_user_chats, delete_chat, rename_chat
)
from dotenv import load_dotenv

# Učitaj .env fajl
load_dotenv()

# Validacija SMTP kredencijala
def verify_smtp_config():
    """Proverava da li su SMTP kredencijali pravilno učitani iz .env"""
    required_vars = ['SMTP_SERVER', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"⚠️  UPOZORENJE: Nedostaju sledeće SMTP varijable u .env: {', '.join(missing_vars)}")
        print("   Molimo kreirajte .env fajl na osnovu .env.example")
        return False
    
    print("✅ SMTP konfiguracija je uspešno učitana iz .env")
    return True


app = Flask(__name__)
CORS(app)

# Proverava SMTP konfiguraciju pri startu
verify_smtp_config()

# Keš za korisničke podatke tokom sesije
# Format: { "user_id": {"data": {...}, "timestamp": datetime} }
# 
# KAKO FUNKCIONIŠE:
# 1. Prvom pozivu /api/askAI se preuzimaju podaci sa /zakazivanja/{id} endpointa
# 2. Podaci se čuvaju u memoriji sa timestamp-om (firm_data_cache)
# 3. Narednim pozivima se koristi keš bez pozivanja Xano API-ja
# 4. Ako je keš stariji od 1h, automatski se briše i preuzimaju novi podaci
# 5. Korisnik može ručno obrisati keš sa POST /api/clearCache rutom
# 
# PREDNOSTI:
# - Sprečava prenatrpanost AI konteksta
# - Brže je (ne čeka API odgovore)
# - Čuva bandwidth
# - Automatski oslobađa RAM (1h TTL)
#
# NAPOMENA: Keš se briše kada se server restartuje (u memoriji je)
firm_data_cache = {}


def is_cache_valid(user_id):
    """
    Proverava da li je keš za korisnika validan.
    Vraća True ako keš postoji i nije stariji od 1 sata.
    """
    if user_id not in firm_data_cache:
        return False
    
    cache_entry = firm_data_cache[user_id]
    if "timestamp" not in cache_entry:
        return False
    
    # Proveravamo da li je keš stariji od 1 sata
    age = datetime.now() - cache_entry["timestamp"]
    if age > timedelta(hours=1):
        # Keš je istekao, brišemo ga
        del firm_data_cache[user_id]
        print(f"[Keš] Keš za korisnika {user_id} je istekao (stariji od 1h), obrisan")
        return False
    
    return True

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Zdravo iz Flask API-ja!"})



UPLOAD_FOLDER = os.path.join(os.getcwd(), 'public', 'logos')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
@app.route('/api/novi_logo', methods=['POST'])
def upload_logo():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = secure_filename(file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    userId = request.form.get('id')
    authToken = request.form.get('authToken')
    logoName = f'/logos/{file.filename}'

    if not userId or not authToken:
        return jsonify({'error': 'Nedostaju podaci'}), 400

    xano_url = f'https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/podesavanja/logo/{userId}'
    try:
        response = requests.patch(
            xano_url,
            headers={
                'Authorization': f'Bearer {authToken}',
                'Content-Type': 'application/json'
            },
            json={
                "putanja": logoName
            }
        )
        if response.status_code != 200:
            return jsonify({'error': 'Xano error', 'details': response.text}), response.status_code

        return jsonify({'message': 'Logo uploaded successfully', 'filename': filename}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



html_head = """
<head>
    <!-- Google Fonts: Poppins -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet" />

    <style type="text/css">
    body {
        margin: 0;
        padding: 0;
        background-color: #ffffff;
        color: #000000;
        font-family: 'Poppins', sans-serif;
    }

    *{
        color: #000 !important;
    }

    .content {
        padding: 20px;
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    .btn {
        display: inline-block;
        padding: 12px 24px;
        background-color: #3b82f6;
        color: #ffffff;
        font-weight: 600;
        text-transform: uppercase;
        border-radius: 5px;
        margin-top: 15px;
        text-align: center;
    }

    .btn:hover {
        background-color: #000000;
        color: #3b82f6 !important;
    }

    @media (prefers-color-scheme: dark) {
        body {
            background-color: #000000 !important;
            color: #ffffff !important;
        }

        *{
            color: #fff !important;
        }

        .btn {
            background-color: #3b82f6;
            color: #000000;
        }

        .btn:hover {
            background-color: #ffffff;
            color: #3b82f6;
        }
    }
    </style>
</head>"""



def send_confirmation_email(to_email, poruka, subject, html_poruka=None ):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = "notifications@mojtermin.site"
        msg["To"] = to_email

        # Dodaj tekstualni deo (plain text)
        part1 = MIMEText(poruka, "plain")
        msg.attach(part1)

        # Dodaj HTML deo ako postoji
        if html_poruka:
            part2 = MIMEText(html_poruka, "html")
            msg.attach(part2)

        # Učitaj SMTP kredencijale
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        smtp_user = os.getenv('SMTP_USER')
        smtp_password = os.getenv('SMTP_PASSWORD')

        # Validacija kredencijala
        if not all([smtp_server, smtp_port, smtp_user, smtp_password]):
            print("❌ GREŠKA: Nedostaju SMTP kredencijali u .env fajlu!")
            print(f"   SMTP_SERVER: {bool(smtp_server)}")
            print(f"   SMTP_PORT: {bool(smtp_port)}")
            print(f"   SMTP_USER: {bool(smtp_user)}")
            print(f"   SMTP_PASSWORD: {bool(smtp_password)}")
            return False

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        print(f"✅ Email poslat na: {to_email}")
        return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ SMTP autentifikacijska greška: {str(e)}")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ SMTP greška: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Neočekivana greška pri slanju emaila: {str(e)}")
        return False



def send_email_to_workers(vlasnikId, preduzeceId, naslov, token, lokacija, preduzece, datum_i_vreme, zakazivac, stariPodaci=None):
    print(f"\n=== SLANJE MEJLOVA ZAPOSLENIMA ===")
    print(f"vlasnikId: {vlasnikId}, naslov: {naslov}, lokacija: {lokacija}")
    zaposleni = []
    xano_url = f'https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zaposleni/{vlasnikId}/rxyctdufvyigubohinuvgycftdxrytcufyvgubh'
    try:
        print(f"Učitavanje zaposlenih sa Xano API-ja...")
        res = requests.get(xano_url, headers={'Content-Type': 'application/json'})
        print(f"Xano status: {res.status_code}")
        if res.status_code != 200:
            print(f"ERROR: Xano error pri učitavanju zaposlenih: {res.status_code} - {res.text}")
            return False
        
        data = res.json()        

        # Dodaj vlasnika
        vlasnik = data.get('vlasnik', {})
        if vlasnik.get('email'):
            zaposleni.append({'email': vlasnik.get('email'), 'id': vlasnik.get('id')})
            print(f"Dodat vlasnik: {vlasnik.get('email')}")

        # Prođi kroz sve grupe korisnika (zaposleni po firmama)
        korisnici = data.get('korisnici', [])
        print(f"Broj grupa korisnika: {len(korisnici)}")
        for grupa in korisnici:
            for osoba in grupa:
                if str(osoba.get('zaposlen_u')) == str(lokacija):
                    email = osoba.get('email')
                    id_korisnika = osoba.get('id')
                    if email:
                        zaposleni.append({'email': email, 'id': id_korisnika})
                        print(f"Dodan zaposlenik: {email}")


        print(f"Ukupno zaposlenih za obaveštavanja: {len(zaposleni)}")
        # Slanje mejlova svakom od njih
        for z in zaposleni:
            email = z['email']
            korisnik_id = z['id']
            if naslov == 'Novo zakazivanje':
                send_confirmation_email(
                    to_email=email,
                    poruka=f"""
                        Novi termin zakazan u {preduzece} za {datum_i_vreme}. Zakazao ga je {zakazivac}.
                        \nNa linku ispod možete izmeniti vreme i datum termina, potvrditi ga ili otkazati.
                        \nhttps://mojtermin.site/zakazi/{vlasnikId}/izmena/{token}
                    """,
                    subject=f"{naslov} - {preduzece}",
                    html_poruka=f"""
                        <html>
                            {html_head}
                            <body>
                                <div class="content">
                                    <p>Novi termin zakazan u {preduzece} za {datum_i_vreme}. Zakazao ga je {zakazivac}</p>
                                    <a href="https://mojtermin.site/zakazi/{vlasnikId}/izmeni/{token}/potvrda/{korisnik_id}" class="btn">Potvrdi termin</a>
                                    <a href="https://mojtermin.site/zakazi/{vlasnikId}/izmeni/{token}" class="btn">Izmenite termin</a>
                                </div>
                            </body>
                        </html>
                    """
                )

            elif naslov == 'Izmena termina':
                send_confirmation_email(
                    to_email=email,
                    poruka=f"""
                        Izmenjen termin zakazan u {preduzece} za {datum_i_vreme}. Izmenio ga je {zakazivac}.
                        \nNa linku ispod možete izmeniti vreme i datum termina, potvrditi ga ili otkazati.
                        \nhttps://mojtermin.site/zakazi/{vlasnikId}/izmena/{token}
                        \nStari podaci: 
                        \nIme: {stariPodaci.get("ime", "N/A")},
                        \nLokacija: {stariPodaci.get("lokacija", "N/A")},
                        \nVreme: {stariPodaci.get('dan')}.{stariPodaci.get('mesec')}.{stariPodaci.get('godina')} u {stariPodaci.get('vreme')},
                        \nTrajanje termina: {stariPodaci.get('trajanje', 'N/A')}
                    """,
                    subject=f"{naslov}",
                    html_poruka=f"""
                        <html>
                            {html_head}
                            <body>
                                <div class="content">
                                    <p>Izmenjen termin zakazan u {preduzece} za {datum_i_vreme}. Izmenio ga je {zakazivac}</p>
                                    <a href="https://mojtermin.site/zakazi/{vlasnikId}/izmeni/{token}/potvrda/{korisnik_id}" class="btn">Potvrdi termin</a>
                                    <a href="https://mojtermin.site/zakazi/{vlasnikId}/izmeni/{token}" class="btn">Izmenite termin</a>
                                    <p style="margin-top: 20px;">Stari podaci:</p>
                                    <ul>
                                        <li>Ime: {stariPodaci.get("ime", "N/A")}</li>
                                        <li>Lokacija: {stariPodaci.get("lokacija", "N/A")}</li>
                                        <li>Vreme: {stariPodaci.get('dan')}.{stariPodaci.get('mesec')}.{stariPodaci.get('godina')} u {stariPodaci.get('vreme')}</li>
                                        <li>Trajanje termina: {stariPodaci.get('trajanje', 'N/A')}</li>
                                    </ul>
                                </div>
                            </body>
                        </html>
                    """
                )
            
            elif naslov == 'Izmena termina - nova lokacija':
                send_confirmation_email(
                    to_email=email,
                    poruka=f"""Termin koji je bio zakazan na drugom radnom mestu je izmenjen i odabrano je novo radno mesto - {preduzece} za {datum_i_vreme}. Izmenio ga je {zakazivac}.
                        \nNa linku ispod možete izmeniti vreme i datum termina, potvrditi ga ili otkazati.
                        \nhttps://mojtermin.site/zakazi/{vlasnikId}/izmena/{token}
                        \nStari podaci: 
                        \nIme: {stariPodaci.get("ime", "N/A")},
                        \nLokacija: {stariPodaci.get("lokacija", "N/A")} (id),
                        \nVreme: {stariPodaci.get('dan')}.{stariPodaci.get('mesec')}.{stariPodaci.get('godina')} u {stariPodaci.get('vreme')},
                        \nTrajanje termina: {stariPodaci.get('trajanje', 'N/A')}
                    """,
                    subject=f"{naslov}",
                    html_poruka=f"""
                        <html>
                            {html_head}
                            <body>
                                <div class="content">
                                    <p>Termin koji je bio zakazan na drugom radnom mestu je izmenjen i odabrano je novo radno mesto - {preduzece} za {datum_i_vreme}. Izmenio ga je {zakazivac}.</p>
                                    <a href="https://mojtermin.site/zakazi/{vlasnikId}/izmeni/{token}/potvrda/{korisnik_id}" class="btn">Potvrdi termin</a>
                                    <a href="https://mojtermin.site/zakazi/{vlasnikId}/izmeni/{token}" class="btn">Izmenite termin</a>
                                    <p style="margin-top: 20px;">Stari podaci:</p>
                                    <ul>
                                        <li>Ime: {stariPodaci.get("ime", "N/A")}</li>
                                        <li>Lokacija: {stariPodaci.get("lokacija", "N/A")} (id)</li>
                                        <li>Vreme: {stariPodaci.get('dan')}.{stariPodaci.get('mesec')}.{stariPodaci.get('godina')} u {stariPodaci.get('vreme')}</li>
                                        <li>Trajanje termina: {stariPodaci.get('trajanje', 'N/A')}</li>
                                    </ul>
                                </div>
                            </body>
                        </html>
                    """
                )

            elif naslov == 'Izmena termina na novu lokaciju':
                send_confirmation_email(
                    to_email=email,
                    poruka=f"""Termin koji je bio zakazan na vašem radnom mestu je izmenjen i odabrano je novo radno mesto -  {preduzece}. Izmenio ga je {zakazivac}.
                        \nStari podaci: 
                        \nIme: {stariPodaci.get("ime", "N/A")},
                        \nLokacija: {stariPodaci.get("lokacija", "N/A")} (id),
                        \nVreme: {stariPodaci.get('dan')}.{stariPodaci.get('mesec')}.{stariPodaci.get('godina')} u {stariPodaci.get('vreme')},
                        \nTrajanje termina: {stariPodaci.get('trajanje', 'N/A')}
                    """,
                    subject=f"{naslov}"
                )
            
            elif naslov == 'Otkazivanje termina':
                send_confirmation_email(
                    to_email=email,
                    poruka=f"Termin u {preduzece} za {datum_i_vreme} je otkazan od strane {zakazivac}.",
                    subject=f"{naslov} - {preduzece}"
                )

        return True

    except requests.exceptions.RequestException as e:
        print(f"ERROR u send_email_to_workers: {str(e)}")
        return False
    except Exception as e:
        print(f"NEOČEKIVANA GREŠKA u send_email_to_workers: {str(e)}")
        return False





@app.route('/api/potvrdi_termin', methods=['POST'])
def potvrdiTermin():
    data = request.json
    termin = data.get('termin')
    auth_token = data.get('authToken')

    if not termin or not auth_token:
        return jsonify({'error': 'Nedostaju podaci'}), 400

    termin_id = termin.get('id')
    potvrdio = termin.get('potvrdio')
    if not termin_id:
        return jsonify({'error': 'Nedostaje ID termina'}), 400
    
    xano_url = f'https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazivanja/{termin_id}/potvrda'
    try:
        response = requests.patch(
            xano_url,
            headers={
                'Authorization': f'Bearer {auth_token}',
                'Content-Type': 'application/json'
            },
            json={
                "potvrdio": potvrdio
            }
        )

        if response.status_code == 200:
            try:
                poruka = f"""Poštovani,
                    \nVaš termin u {response.json().get("ime_preduzeca").get("ime")} je potvrdio {response.json().get("potvrdio_zaposlen").get("username")}.
                """
                naslov = f"Potvrda termina - {response.json().get("ime_preduzeca").get("ime")}"

                send_confirmation_email(response.json().get("email"), poruka, naslov)

            except Exception as mail_err:
                return jsonify({
                    'status': response.status_code,
                    'xano_response': response.json(),
                    'mail_error': str(mail_err)
                }), response.status_code

        return jsonify({
            'status': response.status_code,
            'xano_response': response.json()
        }), response.status_code

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500



@app.route('/api/zakazi', methods=['POST'])
def zakazi():
    data = request.json
    podaci = data.get('podaci')
    odabrana_lokacija = podaci.get('lokacija')
    token = secrets.token_urlsafe(10)
    data['token'] = token

    if not podaci:
        return jsonify({'error': 'Nedostaju podaci'}), 400
    
    xano_url = f'https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazi/{data.get("id")}'
    try:
        response = requests.post(xano_url, json=data, headers={'Content-Type': 'application/json'})

        if response.status_code != 200:
            return jsonify({'error': 'Xano error', 'message': response.text}), response.status_code
        
        res_json = response.json()


        user = res_json.get('user', [{}])[0]
        preduzece = user.get('ime_preduzeca')
        lokacije = user.get('lokacije', [])


        izabrana_lokacija = next((l for l in lokacije if str(l.get('id')) == str(odabrana_lokacija)), None)
        adresa = izabrana_lokacija.get('adresa') if izabrana_lokacija else ''

        datum_i_vreme = f"{podaci.get('dan')}.{podaci.get('mesec')}.{podaci.get('godina')} u {podaci.get('vreme')}"
        subject = f"Zakazivanje termina - {preduzece}"
        poruka = f"""Poštovani,
            \nVaš termin u {preduzece} je uspešno zakazan za {datum_i_vreme}, na adresi {adresa}. Dobićete obaveštenje kada neko potvrdi vaš termin.
            \n Takođe možete izmeniti vreme i datum Vašeg termina na linku ispod. Nakon izmene očekujte ponovnu potvrdu.
            \n https://mojtermin.site/zakazi/{data.get("id")}/izmeni/{token}
            \n\nHvala što ste izabrali našu uslugu! Ovu uslugu je omogućio servis Moj Termin."""

        html_poruka = f"""
        <html>
            {html_head}
            <body>
                <div class="content">
                <h2>Poštovani,</h2>
                <p>Vaš termin u {preduzece} je <b>uspešno zakazan</b> za <b>{datum_i_vreme}</b> na adresi <b>{adresa}</b>. Dobićete obaveštenje kada neko potvrdi vaš termin.</p>
                <p>Takođe možete izmeniti vreme i datum Vašeg termina. Nakon izmene očekujte ponovnu potvrdu.</p>
                <a href="https://mojtermin.site/zakazi/{data.get("id")}/izmeni/{token}" class="btn">Izmenite termin</a>
                <p style="margin-top: 20px;">Hvala što ste izabrali našu uslugu! Ovu uslugu je omogućio servis <b><a href="https://mojtermin.site">Moj Termin</a></b>.</p>
                </div>
            </body>
        </html>
        """

        # Slanje emaila sa error handling-om
        try:
            send_confirmation_email(
                podaci.get('email'),
                poruka,
                subject,
                html_poruka
            )
        except Exception as email_error:
            print(f"❌ Greška pri slanju potvrde emaila: {str(email_error)}")
        
        print(f"\nUsulov userId == '0': {data.get('userId') == '0'}")
        print(f"Vrednost userId: {data.get('userId')} (tip: {type(data.get('userId'))})")
        if data.get("userId") == "0":
            print(f"Slanje mejla zaposlenima...")
            try:
                send_email_to_workers(
                    data.get("id"),
                    odabrana_lokacija,
                    'Novo zakazivanje',
                    token,
                    odabrana_lokacija,
                    preduzece,
                    datum_i_vreme,
                    podaci.get('ime')
                )
            except Exception as worker_email_error:
                print(f"❌ Greška pri slanju emaila zaposlenima: {str(worker_email_error)}")
        else:
            print(f"UserId je {data.get('userId')}, mejl zaposlenima se ne šalje")

        return jsonify({
            'status': response.status_code,
            'xano_response': response.json(),
            'app_response': 'Zakazivanje uspešno'
        })
    
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        print(f"❌ Neočekivana greška u /api/zakazi: {str(e)}")
        return jsonify({'error': f'Server greška: {str(e)}'}), 500



@app.route('/api/zakazi/izmena', methods=['POST'])
def izmeniTermin():
    data = request.json
    podaci = data.get('podaci')
    token = data.get('token')
    odabrana_lokacija = podaci.get('lokacija')
    stariPodaci = data.get('stariPodaci', {})
    tipUlaska = data.get('tipUlaska')


    if not podaci:
        return jsonify({'error': 'Nedostaju podaci'}), 400
    if not token:
        return jsonify({'error': 'Nema tokena'}), 400
    
    xano_url = f'https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazi/{token}/izmena'
    try:
        response = requests.patch(xano_url, json=data, headers={'Content-Type': 'application/json'})

        if response.status_code != 200:
            return jsonify({'error': 'Xano error', 'message': response.text}), response.status_code
        
        res_json = response.json()

        #p rint(res_json)
        user = res_json.get('user', {})
        preduzece = user.get('ime_preduzeca')
        lokacije = user.get('lokacije', [])
        datum_i_vreme = f"{podaci.get('dan')}.{podaci.get('mesec')}.{podaci.get('godina')} u {podaci.get('vreme')}"

        subject = f"Izmena termina - {preduzece}"
        
        try:
            if stariPodaci.get('lokacija') == odabrana_lokacija: #ista lokacjia
                if tipUlaska == 2: #korisnik menja
                    poruka = f"""Poštovani,
                        \nVaš termin je uspešno izmenjen za {datum_i_vreme}. Dobićete obaveštenje kada neko potvrdi vaš termin.
                        \n Takođe možete izmeniti vreme i datum Vašeg termina na linku ispod. Nakon izmene očekujte ponovnu potvrdu.
                        \n https://mojtermin.site/zakazi/{data.get("id")}/izmeni/{token}
                        \n\nHvala što ste izabrali našu uslugu! Ovu uslugu je omogućio servis Moj Termin.
                    """

                    html_poruka = f"""
                        <html>
                            {html_head}
                            <body>
                                <div class="content">
                                <h2>Poštovani,</h2>
                                <p>Vaš termin je <b>uspešno izmenjen</b> za <b>{datum_i_vreme}</b>. Dobićete obaveštenje kada neko potvrdi vaš termin.</p>
                                <p>Takođe možete izmeniti vreme i datum Vašeg termina. Nakon izmene očekujte ponovnu potvrdu.</p>
                                <a href="https://mojtermin.site/zakazi/{data.get("id")}/izmeni/{token}" class="btn">Izmenite termin</a>
                                <p style="margin-top: 20px;">Hvala što ste izabrali našu uslugu! Ovu uslugu je omogućio servis <b><a href="https://mojtermin.site">Moj Termin</a></b>.</p>
                                </div>
                            </body>
                        </html>
                        """
                    
                    send_confirmation_email(
                        podaci.get('email'),
                        poruka,
                        subject,
                        html_poruka
                    )
                    send_email_to_workers(
                        data.get("id"),
                        odabrana_lokacija,
                        'Izmena termina',
                        token,
                        odabrana_lokacija,
                        preduzece,
                        datum_i_vreme,
                        podaci.get('ime'),
                        stariPodaci
                    )
                
                else: #zaposlen menja
                    poruka = f"""Poštovani,
                        \nVaš termin u {preduzece} je izmenio zaposlenik za {datum_i_vreme}.
                        \nUkoliko Vam novo vreme termina ne odgovara, možete da izmeniti ili otkazati na linku ispod.
                        \nhttps://mojtermin.site/zakazi/{data.get("id")}/izmeni/{token}
                        \n Ukoliko menjate termin vreme termina, molimo Vas da ne zakazujete termin u vreme koje ste prvobitno odabrali.
                        \n\nHvala što ste izabrali našu uslugu! Ovu uslugu je omogućio servis Moj Termin.
                    """
                    html_poruka = f"""
                        <html>
                            {html_head}
                            <body>
                                <div class="content">
                                    <h2>Poštovani,</h2>
                                    <p>Vaš termin u {preduzece} je izmenio zaposlenik za <b>{datum_i_vreme}</b>.</p>
                                    <p>Ukoliko Vam novo vreme termina ne odgovara, možete da izmenite ili otkazati na linku ispod.</p>
                                    <a href="https://mojtermin.site/zakazi/{data.get("id")}/izmeni/{token}" class="btn">Izmenite termin</a>
                                    <p style="margin-top: 20px;">Hvala što ste izabrali našu uslugu! Ovu uslugu je omogućio servis <b><a href="https://mojtermin.site">Moj Termin</a></b>.</p>
                                </div>
                            </body>
                        </html>
                    """

                    send_confirmation_email(
                        podaci.get('email'),
                        poruka,
                        subject,
                        html_poruka
                    )
               
            else: #promena lokacije
                if tipUlaska == 2: #korisnik menja
                    poruka = f"""Poštovani,
                        \nVaš termin je uspešno izmenjen za {datum_i_vreme}. Dobićete obaveštenje kada neko potvrdi vaš termin.
                        \n Takođe možete izmeniti vreme i datum Vašeg termina na linku ispod. Nakon izmene očekujte ponovnu potvrdu.
                        \n https://mojtermin.site/zakazi/{data.get("id")}/izmeni/{token}
                        \n\nHvala što ste izabrali našu uslugu! Ovu uslugu je omogućio servis Moj Termin.
                    """

                    html_poruka = f"""
                        <html>
                            {html_head}
                            <body>
                                <div class="content">
                                <h2>Poštovani,</h2>
                                <p>Vaš termin je <b>uspešno izmenjen</b> za <b>{datum_i_vreme}</b>. Dobićete obaveštenje kada neko potvrdi vaš termin.</p>
                                <p>Takođe možete izmeniti vreme i datum Vašeg termina. Nakon izmene očekujte ponovnu potvrdu.</p>
                                <a href="https://mojtermin.site/zakazi/{data.get("id")}/izmeni/{token}" class="btn">Izmenite termin</a>
                                <p style="margin-top: 20px;">Hvala što ste izabrali našu uslugu! Ovu uslugu je omogućio servis <b><a href="https://mojtermin.site">Moj Termin</a></b>.</p>
                                </div>
                            </body>
                        </html>
                        """
                    
                    send_confirmation_email(
                        podaci.get('email'),
                        poruka,
                        subject,
                        html_poruka
                    )

                    send_email_to_workers( #novoj lokaciji
                        data.get("id"),
                        odabrana_lokacija,
                        'Izmena termina - nova lokacija',
                        token,
                        odabrana_lokacija,
                        preduzece,
                        datum_i_vreme,
                        podaci.get('ime'),
                        stariPodaci
                    )
                    send_email_to_workers( #staroj lokaciji
                        data.get("id"),
                        odabrana_lokacija,
                        'Izmena termina na novu lokaciju',
                        token,
                        stariPodaci.get('lokacija'),
                        preduzece,
                        datum_i_vreme,
                        podaci.get('ime'),
                        stariPodaci
                    )
                
                else: #zaposlen menja
                    send_email_to_workers(
                        data.get("id"),
                        odabrana_lokacija,
                        'Izmena termina - nova lokacija',
                        token,
                        odabrana_lokacija,
                        preduzece,
                        datum_i_vreme,
                        podaci.get('ime'),
                        stariPodaci
                    )
                    send_email_to_workers(
                        data.get("id"),
                        odabrana_lokacija,
                        'Izmena termina na novu lokaciju',
                        token,
                        stariPodaci.get('lokacija'),
                        preduzece,
                        datum_i_vreme,
                        podaci.get('ime'),
                        stariPodaci
                    )
        except Exception as email_error:
            print(f"❌ Greška pri slanju emaila u /api/zakazi/izmena: {str(email_error)}")


        return jsonify({
            'status': response.status_code,
            'xano_response': response.json(),
            'app_response': 'Zakazivanje uspešno'
        })
    
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        print(f"❌ Neočekivana greška u /api/zakazi/izmena: {str(e)}")
        return jsonify({'error': f'Server greška: {str(e)}'}), 500



@app.route('/api/zakazi/otkazi', methods=['PATCH'])
def otkaziTermin():
    data = request.json
    podaci = data.get('podaci')
    odabrana_lokacija = podaci.get('lokacija')
    token = data.get('token')
    tipUlaska = data.get('tipUlaska')
    if not token:
        return jsonify({'error': 'Nedostaje token'}), 400
    if not podaci:
        return jsonify({'error': 'Nedostaju podaci'}), 400
    if not odabrana_lokacija:
        return jsonify({'error': 'Nedostaje ime lokacije'}), 400
    if not tipUlaska:
        return jsonify({'error': 'Nedostaje podatak o tipu korisnika'}), 400
    
    xano_url = f'https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/zakazivanja/{token}/otkazi'
    try:
        response = requests.patch(xano_url, json=data, headers={'Content-Type': 'application/json'})
        if response.status_code !=200:
            return jsonify({'error': 'Xano error', 'Xano message': response}), response.status_code

        res_json = response.json()
        user = res_json.get('user', {})
        preduzece = user.get('ime_preduzeca')
        lokacije = user.get('lokacije', [])
        datum_i_vreme = f"{podaci.get('dan')}.{podaci.get('mesec')}.{podaci.get('godina')} u {podaci.get('vreme')}"

        subject = "Otkazivanje termina"

        if tipUlaska == 2: #ulazi korisnik i mejl se šalje zaposlenima
            try:
                send_email_to_workers(
                    data.get("id"),
                    odabrana_lokacija,
                    subject,
                    token,
                    odabrana_lokacija,
                    preduzece,
                    datum_i_vreme,
                    podaci.get('ime')
                )
            except Exception as worker_email_error:
                print(f"❌ Greška pri slanju emaila zaposlenima: {str(worker_email_error)}")
        else: #zaposlen otkazuje termin, mejl ide korisniku
            try:
                send_confirmation_email(
                    podaci.get('email'),
                    f"""
                        Poštovani,
                        \nVaš termin u {preduzece} za {datum_i_vreme} je otkazan od strane zaposlenog radnika.
                        \nNaravno možete ponovo zakazati termin na linku ispod.
                        \nhttps://mojtermin.site/zakazi/{data.get("id")}
                        \n\nHvala što ste izabrali našu uslugu! Ovu uslugu je omogućio servis Moj Termin.
                    """,
                    subject=f"{subject} - {preduzece}",
                    html_poruka=f"""
                        <html>
                            {html_head}
                            <body>
                                <div class="content">
                                    <h2>Poštovani,</h2>
                                    <p>Vaš termin u {preduzece} za <b>{datum_i_vreme}</b> je otkazan od strane zaposlenog radnika.</p>
                                    <a href="https://mojtermin.site/zakazi/{data.get("id")}" class="btn">Ponovo zakazivanje</a>
                                    <p style="margin-top: 20px;">Hvala što ste izabrali našu uslugu! Ovu uslugu je omogućio servis <b><a href="https://mojtermin.site">Moj Termin</a></b>.</p>
                                </div>
                            </body>
                        </html>
                    """
                )
            except Exception as email_error:
                print(f"❌ Greška pri slanju emaila: {str(email_error)}")


        return jsonify({
            'status': response.status_code,
            'xano_response': response.json(),
            'app_response': 'Otkazivanje uspešno'
        })
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        print(f"❌ Neočekivana greška u /api/zakazi/otkazi: {str(e)}")
        return jsonify({'error': f'Server greška: {str(e)}'}), 500



#AI
@app.route('/api/askAI', methods=['POST'])
def askAI_route():
    """
    Ruta koja poziva askAI funkciju nakon provere validnosti tokena.
    """
    data = request.json

    # Validacija ulaznih podataka
    auth_token = data.get('authToken')
    poruke = data.get('poruke', [])
    pitanje = data.get('pitanje')
    user_id = data.get('userId')

    if not auth_token:
        return jsonify({'error': 'Nedostaje authToken'}), 400
    if not pitanje:
        return jsonify({'error': 'Nedostaje pitanje'}), 400
    if not user_id:
        return jsonify({'error': 'Nedostaje userId'}), 400

    # Dohvatanje podataka firme sa Xano - sa kešom
    try:
        # Provera keša (validnosti - nije stariji od 1h)
        if is_cache_valid(user_id):
            print(f"[Keš] Korišćenje keširanih podataka za korisnika {user_id}")
            data_firme = firm_data_cache[user_id]["data"]
        else:
            print(f"[Keš] Preuzimanje novih podataka za korisnika {user_id}")
            xano_data_url = f'https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/get-for-ai/{user_id}/'
            
            firm_response = requests.get(
                xano_data_url,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {auth_token}'
                }
            )

            if firm_response.status_code != 200:
                return jsonify({'error': 'Greška pri dohvatanju podataka firme'}), firm_response.status_code

            data_firme = firm_response.json()
            # Keširaj podatke sa timestamp-om za budućes pozive
            firm_data_cache[user_id] = {
                "data": data_firme,
                "timestamp": datetime.now()
            }

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Greška pri dohvatanju podataka: {str(e)}'}), 500

    # Pozivanje askAI funkcije
    try:
        odgovor = askAI(data_firme, poruke, pitanje)
        
        return jsonify({
            'status': 'success',
            'odgovor': odgovor,
            'poruka': 'Odgovor uspešno generisan'
        }), 200

    except Exception as e:
        return jsonify({
            'error': 'Greška pri generisanju odgovora',
            'details': str(e)
        }), 500


@app.route('/api/clearCache', methods=['POST'])
def clear_cache():
    """
    Ruta koja čisti keš podataka firme za trenutnog korisnika.
    Koristi se ako je korisnik ažurirao podatke i želi novi keš.
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'Nema JSON podataka u zahtevу'}), 400
        
        user_id = data.get('userId')
        auth_token = data.get('authToken')

        if not user_id or not auth_token:
            return jsonify({'error': 'Nedostaju userId i authToken'}), 400

        # Brisanje keša
        if user_id in firm_data_cache:
            del firm_data_cache[user_id]
            print(f"[Keš] Obrisan keš za korisnika {user_id}")
            return jsonify({'status': 'success', 'poruka': 'Keš je obrisan'}), 200
        else:
            return jsonify({'status': 'info', 'poruka': 'Keš za ovog korisnika ne postoji'}), 200

    except Exception as e:
        print(f"[ERROR] Greška u clear_cache: {str(e)}")
        return jsonify({'error': f'Server greška: {str(e)}'}), 500


# ========== CHAT RUTE ==========

@app.route('/api/chat/create', methods=['POST'])
def create_chat():
    """
    Kreira novi chat za korisnika
    """
    try:
        data = request.json
        user_id = data.get('userId')
        auth_token = data.get('authToken')
        title = data.get('title', 'Nova konverzacija')

        if not user_id or not auth_token:
            return jsonify({'error': 'Nedostaju userId i authToken'}), 400

        result = create_new_chat(user_id, title)
        return jsonify(result), 201

    except Exception as e:
        print(f"[ERROR] Greška pri kreiranju chata: {str(e)}")
        return jsonify({'error': f'Server greška: {str(e)}'}), 500


@app.route('/api/chat/<chat_id>', methods=['GET'])
def get_chat(chat_id):
    """
    Učitava specifičan chat
    Samo kreator može pristupiti
    """
    try:
        user_id = request.args.get('userId')
        auth_token = request.args.get('authToken')

        if not user_id or not auth_token:
            return jsonify({'error': 'Nedostaju userId i authToken'}), 400

        result = load_chat(user_id, chat_id)
        
        if not result.get('success'):
            return jsonify(result), 403

        return jsonify(result), 200

    except Exception as e:
        print(f"[ERROR] Greška pri učitavanju chata: {str(e)}")
        return jsonify({'error': f'Server greška: {str(e)}'}), 500


@app.route('/api/chats', methods=['GET'])
def list_chats():
    """
    Vraća sve chatove za trenutnog korisnika
    """
    try:
        user_id = request.args.get('userId')
        auth_token = request.args.get('authToken')

        if not user_id or not auth_token:
            return jsonify({'error': 'Nedostaju userId i authToken'}), 400

        chats = get_user_chats(user_id)
        return jsonify({'chats': chats}), 200

    except Exception as e:
        print(f"[ERROR] Greška pri učitavanju liste chatova: {str(e)}")
        return jsonify({'error': f'Server greška: {str(e)}'}), 500


@app.route('/api/chat/<chat_id>/message', methods=['POST'])
def add_message_to_chat(chat_id):
    """
    Dodaje poruku u chat i čuva je
    """
    try:
        data = request.json
        user_id = data.get('userId')
        auth_token = data.get('authToken')
        message_text = data.get('message')
        sender = data.get('sender', 'user')

        if not user_id or not auth_token or not message_text:
            return jsonify({'error': 'Nedostaju obavezni podaci'}), 400

        result = save_chat_message(user_id, chat_id, {
            'text': message_text,
            'sender': sender
        })

        if not result.get('success'):
            return jsonify(result), 403

        return jsonify(result), 200

    except Exception as e:
        print(f"[ERROR] Greška pri čuvanju poruke: {str(e)}")
        return jsonify({'error': f'Server greška: {str(e)}'}), 500


@app.route('/api/chat/<chat_id>', methods=['DELETE'])
def delete_chat_route(chat_id):
    """
    Briše chat (samo kreator može)
    """
    try:
        data = request.json
        user_id = data.get('userId')
        auth_token = data.get('authToken')

        if not user_id or not auth_token:
            return jsonify({'error': 'Nedostaju userId i authToken'}), 400

        result = delete_chat(user_id, chat_id)

        if not result.get('success'):
            return jsonify(result), 403

        return jsonify(result), 200

    except Exception as e:
        print(f"[ERROR] Greška pri brisanju chata: {str(e)}")
        return jsonify({'error': f'Server greška: {str(e)}'}), 500


@app.route('/api/chat/<chat_id>/rename', methods=['PATCH'])
def rename_chat_route(chat_id):
    """
    Preimenovava chat (samo kreator može)
    """
    try:
        data = request.json
        user_id = data.get('userId')
        auth_token = data.get('authToken')
        new_title = data.get('title')

        if not user_id or not auth_token or not new_title:
            return jsonify({'error': 'Nedostaju obavezni podaci'}), 400

        result = rename_chat(user_id, chat_id, new_title)

        if not result.get('success'):
            return jsonify(result), 403

        return jsonify(result), 200

    except Exception as e:
        print(f"[ERROR] Greška pri preimenovanju chata: {str(e)}")
        return jsonify({'error': f'Server greška: {str(e)}'}), 500


def proveri_istek_pretplate():
    print(f"[{time.strftime('%X')}] Izvršavam upit... PID={os.getpid()}")

    # 1. Dohvatanje podataka
    response = requests.get("https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/alati/proveri-istek-pretplata")

    if response.status_code != 200:
        print("Greška pri dohvatanju podataka:", response.status_code)
        return

    podaci = response.json()
    danas = datetime.now().date()
    lista_izmenjenih = []

    # 2. Obrada svakog korisnika
    for korisnik in podaci:
        istek = korisnik.get("istek_pretplate")
        paket = korisnik.get("paket")
        korisnik_id = korisnik.get("id")

        if istek:
            try:
                datum_isteka = datetime.strptime(istek, "%Y-%m-%d").date()
                if datum_isteka < danas and paket.lower() != "personalni":
                    print(f"Korisnik {korisnik_id} -> pretplata istekla ({istek}), menjam paket...")
                    # 3. Dodavanje u listu
                    lista_izmenjenih.append(korisnik_id)
                    
            except Exception as e:
                print(f"✘ Greška u parsiranju datuma za korisnika {korisnik_id}: {e}")
        
    
    if lista_izmenjenih:
        izmena_res = requests.patch(
            "https://x8ki-letl-twmt.n7.xano.io/api:YgSxZfYk/alati/izmeni-istek-pretplata",
            json={"lista": lista_izmenjenih}
        )
        if izmena_res.status_code == 200:
            print(f"✔ Paket je uspešno izmenjen za korisnike: {lista_izmenjenih}")
        else:
            print(f"✘ Greška pri izmeni paketa, status: {izmena_res.status_code}")
    else:
        print("Nema korisnika kojima je istekao paket za izmenu.")

# Inicijalizacija i startovanje scheduler-a
scheduler = BackgroundScheduler()






if __name__ == '__main__':
    if not app.debug or os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        scheduler.add_job(proveri_istek_pretplate, 'interval', hours=24)
        scheduler.start()
    app.run(debug=True)
