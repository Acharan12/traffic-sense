"""
generate_dataset.py
====================
Generates synthetic traffic training data for TrafficSense.
This is clearly labeled SYNTHETIC DATA — not real-world traffic measurements.
It uses realistic distributions and domain knowledge to create plausible training examples.

Usage:
    python generate_dataset.py
    python generate_dataset.py --samples 20000 --output data/traffic_dataset.csv
"""

import argparse
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

np.random.seed(42)


def generate_dataset(n_samples: int = 10000, output_path: str = "data/traffic_dataset.csv") -> pd.DataFrame:
    """Generate synthetic traffic dataset with realistic distributions."""

    print(f"Generating {n_samples} synthetic traffic samples...")
    print("NOTE: This is SYNTHETIC TRAINING DATA, not real-world traffic measurements.\n")

    # Time features
    start_date = datetime(2023, 1, 1)
    timestamps = [start_date + timedelta(hours=i * (8760 / n_samples)) for i in range(n_samples)]
    hours = np.array([t.hour for t in timestamps])
    days_of_week = np.array([t.weekday() for t in timestamps])
    months = np.array([t.month for t in timestamps])
    weekends = ((days_of_week >= 5)).astype(int)

    # Indian public holidays (approximate)
    holidays = np.zeros(n_samples)
    for i, t in enumerate(timestamps):
        if (t.month == 1 and t.day == 26) or \
           (t.month == 8 and t.day == 15) or \
           (t.month == 10 and t.day == 2):
            holidays[i] = 1

    # Weather features (seasonal patterns for Gujarat)
    temperature = np.where(
        (months >= 3) & (months <= 6),
        np.random.normal(38, 4, n_samples),  # Summer hot
        np.where(
            (months >= 7) & (months <= 9),
            np.random.normal(30, 3, n_samples),  # Monsoon
            np.random.normal(22, 4, n_samples)   # Winter
        )
    ).clip(10, 45)

    # Rainfall (higher in monsoon months)
    monsoon_mask = (months >= 6) & (months <= 9)
    rainfall = np.where(
        monsoon_mask,
        np.random.exponential(3, n_samples),
        np.random.exponential(0.2, n_samples)
    ).clip(0, 50)

    weather_condition = np.where(
        rainfall > 5, 'heavy_rain',
        np.where(rainfall > 1, 'light_rain',
        np.where(temperature > 38, 'hot_clear', 'clear'))
    )

    # Road features
    road_types = np.random.choice(['urban', 'highway', 'arterial', 'residential'], n_samples,
                                   p=[0.45, 0.25, 0.20, 0.10])
    road_capacity = np.where(
        road_types == 'highway', np.random.randint(2000, 4000, n_samples),
        np.where(road_types == 'arterial', np.random.randint(1000, 2000, n_samples),
        np.where(road_types == 'urban', np.random.randint(600, 1200, n_samples),
        np.random.randint(200, 600, n_samples)))
    )

    # Rush hour vehicle count
    rush_morning = ((hours >= 8) & (hours <= 10)).astype(float)
    rush_evening = ((hours >= 17) & (hours <= 20)).astype(float)
    rush_factor = 1 + 0.8 * rush_morning + 0.9 * rush_evening - 0.3 * weekends

    vehicle_count = (road_capacity * 0.4 * rush_factor * np.random.uniform(0.7, 1.3, n_samples)).astype(int)
    vehicle_count = vehicle_count.clip(50, 4000)

    # Average speed (inverse correlation with congestion)
    base_speed = np.where(road_types == 'highway', 70, np.where(road_types == 'arterial', 45, 30))
    congestion_factor = (vehicle_count / road_capacity).clip(0, 1)
    average_speed = (base_speed * (1 - 0.7 * congestion_factor) + np.random.normal(0, 3, n_samples)).clip(5, 90)

    # Incident flags
    accident = (np.random.random(n_samples) < 0.05).astype(int)
    construction = (np.random.random(n_samples) < 0.12).astype(int)
    event = (np.random.random(n_samples) < 0.08).astype(int)
    nearby_incidents = accident + construction * 0.5 + event * 0.3

    # Historical vehicle count (3-day moving avg approximation)
    historical_vehicle_count = vehicle_count * np.random.uniform(0.85, 1.15, n_samples)

    # ==== TARGET VARIABLE: Traffic Level ====
    # Score-based labeling with domain knowledge
    score = np.zeros(n_samples)

    # Rush hour contribution
    score += 25 * rush_morning + 30 * rush_evening

    # Congestion ratio
    score += 30 * congestion_factor

    # Incidents
    score += 20 * accident + 12 * construction + 8 * event

    # Weather
    score += np.where(rainfall > 5, 15, np.where(rainfall > 1, 8, 0))

    # Speed (inverse)
    score += np.where(average_speed < 15, 20, np.where(average_speed < 25, 10, 0))

    # Weekend effect
    score -= 10 * weekends

    # Holiday effect
    score -= 15 * holidays

    # Add noise
    score += np.random.normal(0, 5, n_samples)
    score = score.clip(0, 100)

    # Map to 4-class label
    traffic_level = np.where(
        score <= 25, 0,          # Low
        np.where(score <= 50, 1,  # Moderate
        np.where(score <= 75, 2,  # High
        3))                       # Severe
    )

    df = pd.DataFrame({
        'timestamp': timestamps,
        'hour': hours,
        'day_of_week': days_of_week,
        'month': months,
        'weekend': weekends,
        'holiday': holidays,
        'temperature': temperature.round(1),
        'rainfall': rainfall.round(2),
        'weather_condition': weather_condition,
        'road_type': road_types,
        'road_capacity': road_capacity,
        'average_speed': average_speed.round(1),
        'historical_vehicle_count': historical_vehicle_count.round(0).astype(int),
        'vehicle_count': vehicle_count,
        'accident': accident,
        'construction': construction,
        'event': event,
        'nearby_incidents': nearby_incidents.round(1),
        'congestion_ratio': congestion_factor.round(3),
        'traffic_level': traffic_level,
    })

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)

    # Print class distribution
    counts = df['traffic_level'].value_counts().sort_index()
    label_map = {0: 'Low', 1: 'Moderate', 2: 'High', 3: 'Severe'}
    print("Class distribution (synthetic data):")
    for k, v in counts.items():
        print(f"  {label_map[k]}: {v} ({v/n_samples*100:.1f}%)")
    print(f"\n[OK] Dataset saved to: {output_path}")
    return df


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate synthetic traffic training data')
    parser.add_argument('--samples', type=int, default=10000)
    parser.add_argument('--output', type=str, default='data/traffic_dataset.csv')
    args = parser.parse_args()

    generate_dataset(args.samples, args.output)
