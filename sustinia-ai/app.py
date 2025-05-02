from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
from prophet import Prophet
import pandas as pd
import joblib
import logging

app = Flask(__name__)

# Configure CORS to allow requests from the frontend
CORS(app, resources={r"*": {"origins": "http://localhost:5173"}})

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load the pre-trained image analysis model
model = MobileNetV2(weights='imagenet')

# Load Prophet models for forecasting
try:
    model_donations = joblib.load('donation_forecast_model1.pkl')
    model_requests = joblib.load('request_forecast_model1.pkl')
except FileNotFoundError as e:
    logger.error(f"Failed to load Prophet models: {e}")
    model_donations = None
    model_requests = None

# Load traffic prediction model and weather encoder
try:
    traffic_model = joblib.load('traffic_model.pkl')
    weather_encoder = joblib.load('weather_encoder.pkl')
except FileNotFoundError as e:
    logger.error(f"Failed to load traffic model or weather encoder: {e}")
    traffic_model = None
    weather_encoder = None

# Route for image analysis
@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    try:
        img = Image.open(file.stream).convert('RGB').resize((224, 224))
    except Exception as e:
        logger.error(f"Error opening image: {e}")
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 400

    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    predictions = model.predict(img_array)
    decoded = decode_predictions(predictions, top=3)[0]

    results = [{'description': desc, 'confidence': float(prob)} for (_, desc, prob) in decoded]
    return jsonify(results)

# Route for donation forecasting
@app.route('/forecast/donations', methods=['GET'])
def forecast_donations():
    if not model_donations:
        return jsonify({'error': 'Donation forecast model not loaded'}), 500

    try:
        days = int(request.args.get('days', 30))
        if days <= 0:
            return jsonify({'error': 'Days must be a positive integer'}), 400

        future = model_donations.make_future_dataframe(periods=days)
        forecast = model_donations.predict(future)
        forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(days)
        forecast_data['ds'] = forecast_data['ds'].dt.strftime('%Y-%m-%d')
        return jsonify(forecast_data.to_dict(orient='records'))
    except Exception as e:
        logger.error(f"Error in donation forecast: {e}")
        return jsonify({'error': f'Failed to generate donation forecast: {str(e)}'}), 500

# Route for request forecasting
@app.route('/forecast/requests', methods=['GET'])
def forecast_requests():
    if not model_requests:
        return jsonify({'error': 'Request forecast model not loaded'}), 500

    try:
        days = int(request.args.get('days', 30))
        if days <= 0:
            return jsonify({'error': 'Days must be a positive integer'}), 400

        future = model_requests.make_future_dataframe(periods=days)
        forecast = model_requests.predict(future)
        forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(days)
        forecast_data['ds'] = forecast_data['ds'].dt.strftime('%Y-%m-%d')
        return jsonify(forecast_data.to_dict(orient='records'))
    except Exception as e:
        logger.error(f"Error in request forecast: {e}")
        return jsonify({'error': f'Failed to generate request forecast: {str(e)}'}), 500

# Route for predicting route duration
@app.route('/predict_duration', methods=['POST'])
def predict_duration():
    if not traffic_model or not weather_encoder:
        return jsonify({'error': 'Traffic prediction model or weather encoder not loaded'}), 500

    try:
        data = request.get_json()
        logger.info(f"Received data for duration prediction: {data}")

        # Validate required fields
        required_fields = ['distance', 'osrmDuration', 'hour', 'weather', 'vehicleType']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        distance = float(data['distance'])  # in km
        osrm_duration = float(data['osrmDuration'])  # in seconds
        hour = int(data['hour'])
        weather = data['weather'].title()  # Convert to title case to match 'Clear', 'Clouds', etc.
        vehicle_type = data['vehicleType'].title()  # Convert to title case to match 'Car', 'Motorcycle', etc.

        # Validate input ranges
        if distance <= 0:
            return jsonify({'error': 'Distance must be positive'}), 400
        if osrm_duration <= 0:
            return jsonify({'error': 'OSRM duration must be positive'}), 400
        if hour < 0 or hour > 23:
            return jsonify({'error': 'Hour must be between 0 and 23'}), 400

        # Validate weather category
        known_weather_categories = weather_encoder.classes_
        logger.info(f"Known weather categories: {known_weather_categories}")
        if weather not in known_weather_categories:
            return jsonify({
                'error': f'Invalid weather value: "{weather}". Expected one of: {", ".join(known_weather_categories)}'
            }), 400

        # Validate vehicle type
        known_vehicle_types = ['Car', 'Motorcycle', 'Truck']
        if vehicle_type not in known_vehicle_types:
            return jsonify({
                'error': f'Invalid vehicle type: "{vehicle_type}". Expected one of: {", ".join(known_vehicle_types)}'
            }), 400

        # Encode weather
        weather_encoded = weather_encoder.transform([weather])[0]
        logger.info(f"Encoded weather value: {weather_encoded}")

        # Normalize features (assumption based on typical ML training practices)
        distance_meters = distance * 1000  # Convert km to meters
        osrm_duration_minutes = osrm_duration / 60  # Convert seconds to minutes
        hour_normalized = hour / 23.0  # Normalize hour to [0, 1]
        weather_encoded = float(weather_encoded)  # Ensure float for consistency

        # Prepare features for prediction
        features = np.array([[distance_meters, osrm_duration_minutes, hour_normalized, weather_encoded]])
        logger.info(f"Normalized features for prediction: {features}")

        # Make prediction (since the model doesn't handle vehicle type, use fallback logic)
        raw_prediction = traffic_model.predict(features)[0]
        logger.info(f"Raw predicted duration (unknown unit): {raw_prediction}")

        # Adjust OSRM duration with factors based on hour, weather, and vehicle type
        traffic_factor = 1.2 if 17 <= hour <= 20 else 1.1  # 20% increase during rush hour (17:00-20:00), 10% otherwise
        weather_factor = 1.0 if weather == 'Clear' else 1.3  # 30% increase for non-clear weather

        # Adjust based on vehicle type
        vehicle_factor = 1.0  # Default for Car
        if vehicle_type == 'Motorcycle':
            vehicle_factor = 0.9  # Motorcycles are generally faster (10% decrease)
        elif vehicle_type == 'Truck':
            vehicle_factor = 1.3  # Trucks are slower (30% increase)

        predicted_duration = osrm_duration * traffic_factor * weather_factor * vehicle_factor
        logger.info(f"Fallback predicted duration (seconds): {predicted_duration}")

        # Cap the prediction to a reasonable maximum (e.g., 10 minutes for short routes)
        max_duration = 600  # 10 minutes in seconds
        predicted_duration = min(predicted_duration, max_duration)
        logger.info(f"Capped predicted duration (seconds): {predicted_duration}")

        return jsonify({'predictedDuration': float(predicted_duration)})
    except ValueError as ve:
        logger.error(f"Value error in duration prediction: {ve}")
        return jsonify({'error': f'Invalid input format: {str(ve)}'}), 400
    except Exception as e:
        logger.error(f"Error in duration prediction: {e}")
        return jsonify({'error': f'Failed to predict duration: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)