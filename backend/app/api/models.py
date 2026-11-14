"""
Model Training & Evaluation API Endpoints
SSIT M.Tech Academic Research
"""

import os
import json
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from backend.app.schemas.schemas import TrainRequest
from backend.ml.train import ModelTrainer

router = APIRouter(prefix="/api/models", tags=["models"])

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
METRICS_JSON = os.path.join(PROJECT_ROOT, "results", "metrics", "model_comparison.json")

@router.get("")
def get_all_models_summary() -> Dict[str, Any]:
    """
    Returns full model comparison, best model selection, and CDSI scores.
    """
    if not os.path.exists(METRICS_JSON):
        # Trigger training if not yet run
        trainer = ModelTrainer(project_root=PROJECT_ROOT)
        trainer.train_all_models()

    try:
        with open(METRICS_JSON, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read evaluation results: {e}")

@router.get("/{model_name}/metrics")
def get_single_model_metrics(model_name: str) -> Dict[str, Any]:
    """
    Returns granular metrics, confusion matrix, and curves for a single algorithm.
    """
    if not os.path.exists(METRICS_JSON):
        raise HTTPException(status_code=404, detail="Model metrics not yet generated.")

    with open(METRICS_JSON, "r") as f:
        data = json.load(f)

    for m in data.get("model_comparison", []):
        if m["model_name"].lower().replace(" ", "") == model_name.lower().replace(" ", ""):
            return m

    raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found.")

@router.post("/train")
def train_models_endpoint(req: TrainRequest) -> Dict[str, Any]:
    """
    Executes actual backend training with selected target and parameters.
    """
    try:
        trainer = ModelTrainer(project_root=PROJECT_ROOT)
        target = req.target_column or "ICU_MORT"
        results = trainer.train_all_models(target_column=target, random_state=req.random_state or 42)
        return {
            "message": "Model training completed successfully.",
            "target": target,
            "best_model": results["best_model_selection"]["best_model_name"],
            "best_cdsi": results["best_model_selection"]["best_model_metrics"]["cdsi_score"],
            "model_comparison": results["model_comparison"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {e}")
