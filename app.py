import requests
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, get_jwt, jwt_required, get_jwt_identity
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Zdravo iz Flask API-ja!"})


def send_confirmation_email(to_email, ime, vreme):
    subject = "Potvrda termina"
    body = f"Poštovani, vaš termin za {ime} u {vreme} je potvrđen."
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = "nemanja@nemanja.website"
    msg["To"] = to_email

    smtp_server = "smtp.zoho.eu"
    smtp_port = 587
    smtp_user = "nemanja@nemanja.website"
    smtp_password = "n3m4nj41M4K4*"

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)

@app.route('/api/potvrdi_termin', methods=['POST'])
def post_data():
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

        # Pošalji email samo ako je potvrda uspešna
        if response.status_code == 200:
            try:
                send_confirmation_email(
                    termin.get('email'),
                    termin.get('ime'),
                    termin.get('vreme_rezervacije')
                )
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

        return jsonify({
            'status': response.status_code,
            'xano_response': response.json()
        }), response.status_code

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500


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

if __name__ == '__main__':
    app.run(debug=True)
