from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
from prophet import Prophet
import pandas as pd
import joblib

app = Flask(__name__)

# Activer CORS pour toutes les routes, autorisant localhost:5173
CORS(app, resources={r"*": {"origins": "http://localhost:5173"}})

# Charger le modèle IA pré-entraîné pour l'analyse d'image
model = MobileNetV2(weights='imagenet')

# Charger les modèles Prophet pour les prévisions
model_donations = joblib.load('donation_forecast_model.pkl')
model_requests = joblib.load('request_forecast_model.pkl')

# Charger le modèle et l'encodeur pour la prédiction des durées de trajet
try:
    traffic_model = joblib.load('traffic_model.pkl')
    weather_encoder = joblib.load('weather_encoder.pkl')
except FileNotFoundError as e:
    print(f"Erreur : {e}. Assurez-vous que 'traffic_model.pkl' et 'weather_encoder.pkl' sont dans le répertoire.")
    traffic_model = None
    weather_encoder = None

# Route pour l'analyse d'image
@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier fourni'}), 400

    file = request.files['file']

    try:
        img = Image.open(file.stream).convert('RGB').resize((224, 224))
    except Exception as e:
        return jsonify({'error': f'Erreur lors de l’ouverture de l’image : {str(e)}'}), 400

    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    predictions = model.predict(img_array)
    decoded = decode_predictions(predictions, top=3)[0]

    results = [{'description': desc, 'confidence': float(prob)} for (_, desc, prob) in decoded]
    return jsonify(results)

# Route pour la prévision des dons
@app.route('/forecast/donations', methods=['GET'])
def forecast_donations():
    try:
        days = int(request.args.get('days', 30))
        future = model_donations.make_future_dataframe(periods=days)
        forecast = model_donations.predict(future)
        forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(days)
        forecast_data['ds'] = forecast_data['ds'].dt.strftime('%Y-%m-%d')
        return jsonify(forecast_data.to_dict(orient='records'))
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la prévision des dons : {str(e)}'}), 500

# Route pour la prévision des demandes
@app.route('/forecast/requests', methods=['GET'])
def forecast_requests():
    try:
        days = int(request.args.get('days', 30))
        future = model_requests.make_future_dataframe(periods=days)
        forecast = model_requests.predict(future)
        forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(days)
        forecast_data['ds'] = forecast_data['ds'].dt.strftime('%Y-%m-%d')
        return jsonify(forecast_data.to_dict(orient='records'))
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la prévision des demandes : {str(e)}'}), 500

# Route pour la prédiction des durées de trajet
@app.route('/predict_duration', methods=['POST'])
def predict_duration():
    if not traffic_model or not weather_encoder:
        return jsonify({'error': 'Modèle de prédiction des durées non chargé'}), 500

    try:
        data = request.get_json()
        print(f"Données reçues : {data}")  # Log pour déboguer les données entrantes
        distance = data['distance']
        osrm_duration = data['osrmDuration']
        hour = data['hour']
        weather = data['weather']

        # Vérifier les catégories connues par weather_encoder
        known_categories = weather_encoder.classes_
        print(f"Catégories connues par weather_encoder : {known_categories}")
        if weather not in known_categories:
            return jsonify({'error': f'Valeur de weather "{weather}" non reconnue. Catégories attendues : {list(known_categories)}'}), 400

        # Encoder la météo
        weather_encoded = weather_encoder.transform([weather])[0]
        print(f"Valeur de weather encodée : {weather_encoded}")

        # Préparer les données pour la prédiction
        features = np.array([[distance, osrm_duration, hour, weather_encoded]])
        print(f"Features pour la prédiction : {features}")

        # Faire la prédiction
        predicted_duration = traffic_model.predict(features)[0]
        print(f"Durée prédite : {predicted_duration}")

        return jsonify({'predictedDuration': float(predicted_duration)})
    except Exception as e:
        print(f"Erreur dans predict_duration : {str(e)}")  # Log pour déboguer l'erreur
        return jsonify({'error': f'Erreur lors de la prédiction de la durée : {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)