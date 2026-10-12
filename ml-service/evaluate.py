"""
evaluate.py — Model evaluation script
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)
from generate_dataset import generate_dataset

LABEL_MAP = {0: 'Low', 1: 'Moderate', 2: 'High', 3: 'Severe'}


def evaluate():
    model_path = 'models/traffic_model.pkl'
    prep_path = 'models/preprocessor.pkl'

    if not os.path.exists(model_path):
        print("❌ Model not found. Run: python train.py first.")
        return

    print("Loading model and test data...")
    model = joblib.load(model_path)
    preprocessor = joblib.load(prep_path)

    # Load or generate test data
    if os.path.exists('data/traffic_dataset.csv'):
        df = pd.read_csv('data/traffic_dataset.csv')
    else:
        df = generate_dataset(5000, 'data/eval_dataset.csv')

    # Use last 20% as test set
    test_df = df.tail(int(len(df) * 0.2))

    NUMERIC = ['hour', 'day_of_week', 'month', 'weekend', 'holiday',
               'temperature', 'rainfall', 'road_capacity', 'average_speed',
               'vehicle_count', 'historical_vehicle_count', 'accident',
               'construction', 'event', 'nearby_incidents']
    CATEGORICAL = ['weather_condition', 'road_type']

    available_num = [f for f in NUMERIC if f in test_df.columns]
    available_cat = [f for f in CATEGORICAL if f in test_df.columns]
    X_test = test_df[available_num + available_cat]
    y_test = test_df['traffic_level']

    X_proc = preprocessor.transform(X_test)
    y_pred = model.predict(X_proc)

    print("\n" + "=" * 55)
    print("  TrafficSense Model Evaluation Report")
    print("  Data: SYNTHETIC TEST SET")
    print("=" * 55)
    print(f"  Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
    print(f"  Precision: {precision_score(y_test, y_pred, average='weighted', zero_division=0):.4f}")
    print(f"  Recall:    {recall_score(y_test, y_pred, average='weighted', zero_division=0):.4f}")
    print(f"  F1 Score:  {f1_score(y_test, y_pred, average='weighted', zero_division=0):.4f}")

    target_names = [LABEL_MAP[i] for i in sorted(y_test.unique())]
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=target_names))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))


if __name__ == '__main__':
    evaluate()
