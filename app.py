import requests
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, get_jwt, jwt_required, get_jwt_identity
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Zdravo iz Flask API-ja!"})

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

        return jsonify({
            'status': response.status_code,
            'xano_response': response.json()
        }), response.status_code

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
