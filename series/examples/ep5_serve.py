"""Serve the pipeline with FastAPI.

TestClient sends real HTTP requests to the app inside this process: no server, no network.
To run it as a real service, put the app in a file and start it with:  fastapi run ep5_serve.py
"""
import json
import tempfile
import warnings
from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")


def make_orders(n, rng, dist_scale=1.2):
    """Synthetic food deliveries: distance (km), kitchen queue (orders) -> late (1) or on time (0)."""
    dist = rng.gamma(3.0, dist_scale, n)
    queue = rng.poisson(6.0, n).astype(float)
    travel = np.where(dist <= 6, 4.0 * dist, 6.0 + 1.2 * dist)   # bike up to 6 km, then a car
    minutes = 8 + 1.2 * queue + travel + rng.normal(0, 4, n)
    return np.c_[dist, queue], (minutes > 35).astype(int)


# --- offline: train and save the model file (normally a separate training job) ---
rng = np.random.default_rng(5)
X, y = make_orders(2000, rng)
pipe = make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(16,), max_iter=2000, random_state=0)).fit(X, y)
model_dir = tempfile.TemporaryDirectory()
MODEL_FILE = Path(model_dir.name) / "late_model_v1.joblib"
joblib.dump(pipe, MODEL_FILE)

# --- the service ---
MODEL_VERSION = "late-v1"
model = joblib.load(MODEL_FILE)          # load once, when the service starts; not once per request


class Order(BaseModel):                  # FastAPI checks every request against this schema
    distance_km: float = Field(ge=0, le=50)
    queue: int = Field(ge=0, le=200)


class Prediction(BaseModel):
    late_probability: float
    late: bool
    model_version: str


app = FastAPI(title="Late delivery predictor")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model_version": MODEL_VERSION}


@app.post("/predict")
def predict(order: Order) -> Prediction:
    p = float(model.predict_proba([[order.distance_km, order.queue]])[0, 1])
    return Prediction(late_probability=round(p, 3), late=p >= 0.5, model_version=MODEL_VERSION)


# --- online prediction: one request, one answer ---
client = TestClient(app)
r = client.get("/health")
print("GET  /health ->", r.status_code, json.dumps(r.json()))
for body in ({"distance_km": 3.5, "queue": 4}, {"distance_km": 5.5, "queue": 9}):
    r = client.post("/predict", json=body)
    print("POST /predict", json.dumps(body), "->", r.status_code, json.dumps(r.json()))

bad = {"distance_km": 3.5}                # "queue" is not in the request
r = client.post("/predict", json=bad)
err = r.json()["detail"][0]
print("POST /predict", json.dumps(bad), "->", r.status_code, err["type"], err["loc"])

# --- batch prediction: no web request; a job predicts many rows in one call, e.g. each night ---
X_night, _ = make_orders(1000, rng)
p_night = model.predict_proba(X_night)[:, 1]
print(f"batch job: {len(X_night)} orders, {int((p_night >= 0.5).sum())} predicted late")
model_dir.cleanup()
