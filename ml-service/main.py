"""
main.py — TrafficSense ML Service (FastAPI)
============================================
REST API for traffic severity prediction.

Endpoints:
  GET  /health         - Service health check
  POST /predict        - Single prediction
  POST /batch-predict  - Batch predictions
"""

import os
import json
from typing import Optional, List
from contextlib import asynccontextmanager

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── Model state ──────────────────────────────────────────────
model = None
preprocessor = None
metadata = {}

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


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, preprocessor, metadata
    model_path = os.getenv('MODEL_PATH', 'models/traffic_model.pkl')
    prep_path = os.getenv('PREPROCESSOR_PATH', 'models/preprocessor.pkl')
    meta_path = 'models/model_metadata.json'

    if os.path.exists(model_path) and os.path.exists(prep_path):
        model = joblib.load(model_path)
        preprocessor = joblib.load(prep_path)
        print(f"[OK] Loaded model from {model_path}")
        if os.path.exists(meta_path):
            with open(meta_path) as f:
                metadata = json.load(f)
    else:
        print("[WARN] Model files not found - using heuristic fallback.")
        print("       Run: python train.py to train the model first.")
    yield


app = FastAPI(
    title="TrafficSense ML Service",
    description="AI-powered traffic severity prediction API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ───────────────────────────────────────────────────
class PredictionInput(BaseModel):
    hour: int = Field(default=12, ge=0, le=23)
    day_of_week: int = Field(default=1, ge=0, le=6)
    month: int = Field(default=6, ge=1, le=12)
    weekend: int = Field(default=0, ge=0, le=1)
    holiday: int = Field(default=0, ge=0, le=1)
    temperature: float = Field(default=30.0, ge=-20, le=55)
    rainfall: float = Field(default=0.0, ge=0)
    weather_condition: str = Field(default='clear')
    road_type: str = Field(default='urban')
    road_capacity: int = Field(default=1000, ge=100)
    average_speed: float = Field(default=35.0, ge=0)
    vehicle_count: int = Field(default=500, ge=0)
    historical_vehicle_count: int = Field(default=500, ge=0)
    accident: int = Field(default=0, ge=0, le=1)
    construction: int = Field(default=0, ge=0, le=1)
    event: int = Field(default=0, ge=0, le=1)
    nearby_incidents: float = Field(default=0.0, ge=0)


class PredictionOutput(BaseModel):
    traffic_level: str
    traffic_score: int
    confidence: float
    factors: List[str]
    model_version: str
    data_note: str = "Model trained on synthetic data"


class BatchInput(BaseModel):
    items: List[PredictionInput]


# ── Helpers ───────────────────────────────────────────────────
def build_factors(inp: PredictionInput, traffic_level: str) -> list:
    factors = []
    if (inp.hour >= 8 and inp.hour <= 10) or (inp.hour >= 17 and inp.hour <= 20):
        factors.append("Rush hour")
    if inp.vehicle_count > 800:
        factors.append("High vehicle density")
    if inp.accident:
        factors.append("Active accident nearby")
    if inp.construction:
        factors.append("Road construction")
    if inp.event:
        factors.append("Nearby event causing congestion")
    if inp.rainfall > 1:
        factors.append("Rainfall reducing road speed")
    if inp.average_speed < 20:
        factors.append("Below-average vehicle speed")
    if not (inp.weekend or inp.holiday):
        factors.append("Weekday traffic pattern")
    if traffic_level == 'Low':
        factors.append("Normal traffic conditions")
    if not factors:
        factors.append("No significant traffic factors")
    return factors[:6]


def heuristic_predict(inp: PredictionInput) -> dict:
    """Fallback when model is not loaded."""
    score = 20
    if (inp.hour >= 8 and inp.hour <= 10) or (inp.hour >= 17 and inp.hour <= 20):
        score += 28
    if inp.vehicle_count > 1200: score += 25
    elif inp.vehicle_count > 800: score += 15
    elif inp.vehicle_count > 500: score += 8
    if inp.accident: score += 22
    if inp.construction: score += 12
    if inp.event: score += 8
    if inp.rainfall > 5: score += 15
    elif inp.rainfall > 1: score += 7
    if inp.average_speed < 15: score += 20
    elif inp.average_speed < 25: score += 10
    if inp.weekend or inp.holiday: score -= 10
    score = max(0, min(100, score))

    if score <= 25: level = 'Low'
    elif score <= 50: level = 'Moderate'
    elif score <= 75: level = 'High'
    else: level = 'Severe'

    return {'level': level, 'score': score, 'confidence': 0.72}


def run_prediction(inp: PredictionInput) -> PredictionOutput:
    global model, preprocessor

    if model is None or preprocessor is None:
        result = heuristic_predict(inp)
        level = result['level']
        score = result['score']
        confidence = result['confidence']
    else:
        row = {f: getattr(inp, f, 0) for f in ALL_FEATURES}
        df = pd.DataFrame([row])
        X = preprocessor.transform(df)
        pred_class = int(model.predict(X)[0])
        proba = model.predict_proba(X)[0]
        confidence = float(proba[pred_class])
        level = LABEL_MAP[pred_class]
        score = SCORE_MAP[level] + int((confidence - 0.5) * 20)
        score = max(0, min(100, score))

    return PredictionOutput(
        traffic_level=level,
        traffic_score=score,
        confidence=round(confidence, 4),
        factors=build_factors(inp, level),
        model_version=metadata.get('version', 'heuristic-1.0'),
    )


# ── Endpoints ─────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "operational",
        "model_loaded": model is not None,
        "model_type": metadata.get('model_type', 'heuristic'),
        "accuracy": metadata.get('accuracy'),
        "version": metadata.get('version', '1.0'),
        "data_type": "synthetic",
    }


@app.post("/predict", response_model=PredictionOutput)
def predict(inp: PredictionInput):
    try:
        return run_prediction(inp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/batch-predict")
def batch_predict(batch: BatchInput):
    try:
        predictions = [run_prediction(item) for item in batch.items]
        return {
            "predictions": [p.model_dump() for p in predictions],
            "count": len(predictions),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
