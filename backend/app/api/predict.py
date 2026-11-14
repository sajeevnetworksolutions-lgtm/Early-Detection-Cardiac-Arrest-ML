"""
Prediction and Risk Assessment API Endpoints
SSIT M.Tech Academic Research
"""

import os
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from backend.app.schemas.schemas import PatientRiskInput
from backend.ml.predict import RiskPredictor
from backend.app.database.db import log_prediction, get_all_predictions

router = APIRouter(prefix="/api", tags=["predictions"])

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MODELS_DIR = os.path.join(PROJECT_ROOT, "saved_models")
predictor = RiskPredictor(models_dir=MODELS_DIR)

@router.post("/predict")
def predict_patient_risk(input_data: PatientRiskInput) -> Dict[str, Any]:
    """
    Submits patient vitals to trained ML model and returns clinical deterioration risk score.
    """
    try:
        features = input_data.model_dump()
        model_name = features.pop("model_name", "Logistic Regression")

        result = predictor.predict_risk(features=features, model_name=model_name)

        # Log prediction to SQLite for audit trail & clinical history
        log_prediction(result)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")

@router.get("/predictions")
def list_prediction_history(limit: int = 50) -> List[Dict[str, Any]]:
    """
    Returns previous predictions audit log from SQLite.
    """
    return get_all_predictions(limit=limit)
