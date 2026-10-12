"""
train.py
========
Training pipeline for the TrafficSense traffic severity prediction model.
Trains on synthetic data (clearly labeled), evaluates, and saves model artifacts.

Usage:
    python train.py
    python train.py --model gradient_boosting --samples 15000
"""

import argparse
import os
import warnings
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)
import generate_dataset

warnings.filterwarnings('ignore')

LABEL_MAP = {0: 'Low', 1: 'Moderate', 2: 'High', 3: 'Severe'}
MODELS_DIR = 'models'


def load_or_generate_data(data_path: str, n_samples: int = 10000) -> pd.DataFrame:
    if os.path.exists(data_path):
        print(f"Loading existing dataset from {data_path}...")
        return pd.read_csv(data_path)
    else:
        print("Dataset not found ??? generating synthetic training data...")
        print("NOTE: This is SYNTHETIC DATA for demonstration purposes.\n")
        return generate_dataset.generate_dataset(n_samples, data_path)


def prepare_features(df: pd.DataFrame):
    """Select and prepare features for training."""
    NUMERIC_FEATURES = [
        'hour', 'day_of_week', 'month', 'weekend', 'holiday',
        'temperature', 'rainfall', 'road_capacity', 'average_speed',
        'vehicle_count', 'historical_vehicle_count',
        'accident', 'construction', 'event', 'nearby_incidents',
    ]
    CATEGORICAL_FEATURES = ['weather_condition', 'road_type']

    available_numeric = [f for f in NUMERIC_FEATURES if f in df.columns]
    available_categorical = [f for f in CATEGORICAL_FEATURES if f in df.columns]

    X = df[available_numeric + available_categorical]
    y = df['traffic_level']

    return X, y, available_numeric, available_categorical


def build_preprocessor(numeric_features, categorical_features):
    preprocessor = ColumnTransformer([
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
    ])
    return preprocessor


def train_model(X_train, y_train, X_test, y_test, model_name: str):
    models = {
        'random_forest': RandomForestClassifier(
            n_estimators=200, max_depth=15, min_samples_split=5,
            min_samples_leaf=2, n_jobs=-1, random_state=42, class_weight='balanced'
        ),
        'gradient_boosting': GradientBoostingClassifier(
            n_estimators=200, max_depth=6, learning_rate=0.1,
            min_samples_split=5, random_state=42
        ),
    }

    if model_name not in models:
        raise ValueError(f"Unknown model: {model_name}. Choose from: {list(models.keys())}")

    clf = models[model_name]
    print(f"\nTraining {model_name}...")
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test) if hasattr(clf, 'predict_proba') else None

    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred, average='weighted', zero_division=0),
        'recall': recall_score(y_test, y_pred, average='weighted', zero_division=0),
        'f1': f1_score(y_test, y_pred, average='weighted', zero_division=0),
    }

    return clf, metrics, y_pred


def main(model_name: str = 'random_forest', n_samples: int = 10000):
    print("=" * 60)
    print("  TrafficSense ML Training Pipeline")
    print("  Data Type: SYNTHETIC (not real-world traffic data)")
    print("=" * 60)

    # Load/generate data
    df = load_or_generate_data('data/traffic_dataset.csv', n_samples)
    print(f"\n???? Dataset shape: {df.shape}")
    print(f"   Target distribution:\n{df['traffic_level'].map(LABEL_MAP).value_counts()}")

    # Prepare features
    X, y, numeric_features, categorical_features = prepare_features(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"\n???? Train size: {len(X_train)}, Test size: {len(X_test)}")

    # Build pipeline
    preprocessor = build_preprocessor(numeric_features, categorical_features)
    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)

    # Train
    clf, metrics, y_pred = train_model(X_train_proc, y_train, X_test_proc, y_test, model_name)

    # Results
    print("\n" + "=" * 60)
    print("  EVALUATION RESULTS (Synthetic Test Set)")
    print("=" * 60)
    print(f"  Accuracy:  {metrics['accuracy']:.4f} ({metrics['accuracy']*100:.1f}%)")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall:    {metrics['recall']:.4f}")
    print(f"  F1 Score:  {metrics['f1']:.4f}")

    print("\nClassification Report:")
    target_names = [LABEL_MAP[i] for i in sorted(y.unique())]
    print(classification_report(y_test, y_pred, target_names=target_names))

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Feature importance
    if hasattr(clf, 'feature_importances_'):
        cat_feature_names = preprocessor.named_transformers_['cat'].get_feature_names_out(categorical_features).tolist()
        all_feature_names = numeric_features + cat_feature_names
        importances = pd.Series(clf.feature_importances_, index=all_feature_names[:len(clf.feature_importances_)])
        top_features = importances.nlargest(10)
        print("\nTop 10 Feature Importances:")
        for feat, imp in top_features.items():
            bar = '???' * int(imp * 40)
            print(f"  {feat:30s} {bar} {imp:.4f}")

    # Save model artifacts
    os.makedirs(MODELS_DIR, exist_ok=True)
    model_path = os.path.join(MODELS_DIR, 'traffic_model.pkl')
    preprocessor_path = os.path.join(MODELS_DIR, 'preprocessor.pkl')
    metadata_path = os.path.join(MODELS_DIR, 'model_metadata.json')

    joblib.dump(clf, model_path)
    joblib.dump(preprocessor, preprocessor_path)

    import json
    metadata = {
        'model_type': model_name,
        'accuracy': metrics['accuracy'],
        'f1_score': metrics['f1'],
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'features': numeric_features + categorical_features,
        'target_classes': LABEL_MAP,
        'data_type': 'synthetic',
        'trained_at': pd.Timestamp.now().isoformat(),
        'version': '1.0',
    }
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\n??? Model saved to:        {model_path}")
    print(f"??? Preprocessor saved to: {preprocessor_path}")
    print(f"??? Metadata saved to:     {metadata_path}")
    print("\n???? Training complete! Run: uvicorn main:app --reload to start the API\n")

    return clf, preprocessor, metrics


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=str, default='random_forest', choices=['random_forest', 'gradient_boosting'])
    parser.add_argument('--samples', type=int, default=10000)
    args = parser.parse_args()
    main(args.model, args.samples)
