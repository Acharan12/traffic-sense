"""
predict.py — TrafficSense Standalone Prediction CLI
====================================================
CLI script to test ML model predictions on single inputs.
"""

import sys
import json
import os
import joblib
import pandas as pd
import numpy as np

LABEL_MAP = {0: 'Low', 1: 'Moderate', 2: 'High', 3: 'Severe'}
SCORE_MAP = {'Low': 18, 'Moderate': 42, 'High': 67, 'Severe': 88}

NUMERIC_FEATURES = [
    'hour', 'day_of_week', 'month', 'weekend', 'holiday',
    'temperature', 'rainfall', 'road_capacity', 'average_speed',
    'vehicle_count', 'historical_vehicle_count',
    'accident', 'construction', 'event', 'nearby_incidents',
]
CATEGORICAL_FEATURES = ['weather_condition', 'road_type']
ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def load_model(model_dir='models'):
    model_path = os.path.join(model_dir, 'traffic_model.pkl')
    prep_path = os.path.join(model_dir, 'preprocessor.pkl')

    if not (os.path.exists(model_path) and os.path.exists(prep_path)):
        return None, None

    model = joblib.load(model_path)
    preprocessor = joblib.load(prep_path)
    return model, preprocessor


def predict_single(features: dict, model_dir='models') -> dict:
    model, preprocessor = load_model(model_dir)

    if model is None or preprocessor is None:
        # Heuristic fallback
        score = 30
        if (features.get('hour', 12) in [8, 9, 10, 17, 18, 19]):
            score += 30
        if features.get('vehicle_count', 500) > 800:
            score += 20
        score = min(100, score)
        level = 'Low' if score < 25 else 'Moderate' if score < 50 else 'High' if score < 75 else 'Severe'
        return {'traffic_level': level, 'traffic_score': score, 'confidence': 0.70, 'source': 'heuristic'}

    row = {f: features.get(f, 0) for f in ALL_FEATURES}
    df = pd.DataFrame([row])
    X = preprocessor.transform(df)

    pred_class = int(model.predict(X)[0])
    proba = model.predict_proba(X)[0]
    confidence = float(proba[pred_class])
    level = LABEL_MAP[pred_class]
    score = SCORE_MAP[level] + int((confidence - 0.5) * 20)
    score = max(0, min(100, score))

    return {
        'traffic_level': level,
        'traffic_score': score,
        'confidence': round(confidence, 4),
        'source': 'model',
    }


if __name__ == '__main__':
    sample = {
        'hour': 9,
        'day_of_week': 1,
        'month': 6,
        'weekend': 0,
        'holiday': 0,
        'temperature': 32.0,
        'rainfall': 0.0,
        'weather_condition': 'clear',
        'road_type': 'urban',
        'road_capacity': 1000,
        'average_speed': 18.0,
        'vehicle_count': 1100,
        'historical_vehicle_count': 1050,
        'accident': 0,
        'construction': 0,
        'event': 0,
        'nearby_incidents': 1.0,
    }
    result = predict_single(sample)
    print("Sample Prediction Result:")
    print(json.dumps(result, indent=2))
