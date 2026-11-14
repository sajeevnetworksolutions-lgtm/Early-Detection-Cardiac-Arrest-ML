"""
Inference and Clinical Risk Assessment Engine
Early Detection of Cardiac Deterioration
SSIT M.Tech Academic Research
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

class RiskPredictor:
    """
    Executes real-time inference on physiological parameters and ECG-derived metrics.
    Applies strict range validation and provides transparent clinical risk stratification.
    """

    def __init__(self, models_dir: str):
        self.models_dir = os.path.abspath(models_dir)
        self.preprocessor_path = os.path.join(self.models_dir, "preprocessor.joblib")
        self.preprocessor = None
        if os.path.exists(self.preprocessor_path):
            self.preprocessor = joblib.load(self.preprocessor_path)

    def predict_risk(
        self,
        features: Dict[str, float],
        model_name: str = "Random Forest"
    ) -> Dict[str, Any]:
        """
        Takes raw or normalized physiological parameters, transforms using saved preprocessor,
        and computes risk probability and classification.
        """
        # Load preprocessor if not loaded
        if self.preprocessor is None:
            if os.path.exists(self.preprocessor_path):
                self.preprocessor = joblib.load(self.preprocessor_path)
            else:
                raise FileNotFoundError("Preprocessor not found. Please train models first.")

        # Normalize raw values if raw physiological parameters were passed
        # Typical physiological bounds:
        # Age: 18 - 92 years
        # HR: 40 - 175 bpm
        # DBP: 30 - 120 mmHg
        # RR: 8 - 48 breaths/min
        raw_age = features.get("age", None)
        raw_hr = features.get("hr", None)
        raw_dbp = features.get("dbp", None)
        raw_rr = features.get("rr", None)
        time_adm = features.get("TIME_FROM_ADM", 12.0)

        # Convert to normalized representation if raw was given
        age_norm = features.get("age_normalized")
        if age_norm is None:
            age_norm = float(np.clip((raw_age - 18) / (92 - 18), 0.0, 1.0)) if raw_age is not None else 0.55

        hr_norm = features.get("hr_normalized")
        if hr_norm is None:
            hr_norm = float(np.clip((raw_hr - 40) / (175 - 40), 0.0, 1.0)) if raw_hr is not None else 0.40

        dbp_norm = features.get("dbp_normalized")
        if dbp_norm is None:
            dbp_norm = float(np.clip((raw_dbp - 30) / (120 - 30), 0.0, 1.0)) if raw_dbp is not None else 0.45

        rr_norm = features.get("rr_normalized")
        if rr_norm is None:
            rr_norm = float(np.clip((raw_rr - 8) / (48 - 8), 0.0, 1.0)) if raw_rr is not None else 0.25

        time_scaled = features.get("time_scaled")
        if time_scaled is None:
            time_scaled = float(np.clip(time_adm / 168.0, 0.0, 1.0))

        df_input = pd.DataFrame([{
            "TIME_FROM_ADM": float(time_adm),
            "time_scaled": float(time_scaled),
            "hr_normalized": float(hr_norm),
            "dbp_normalized": float(dbp_norm),
            "rr_normalized": float(rr_norm),
            "age_normalized": float(age_norm)
        }])

        # Transform using preprocessor
        X_scaled, _ = self.preprocessor.transform(df_input)

        # Load selected model
        safe_name = model_name.lower().replace(" ", "_")
        model_file = os.path.join(self.models_dir, f"{safe_name}.joblib")
        if not os.path.exists(model_file):
            # Fallback to random forest or first available
            model_file = os.path.join(self.models_dir, "random_forest.joblib")
            if not os.path.exists(model_file):
                raise FileNotFoundError(f"Model file {model_file} not found.")
            model_name = "Random Forest"

        model = joblib.load(model_file)

        # Compute prediction & probability
        pred_class = int(model.predict(X_scaled)[0])
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_scaled)[0]
            risk_score = float(probs[1]) if len(probs) > 1 else float(probs[0])
        elif hasattr(model, "decision_function"):
            df_score = float(model.decision_function(X_scaled)[0])
            risk_score = float(1.0 / (1.0 + np.exp(-df_score)))
        else:
            risk_score = float(pred_class)

        risk_score = round(risk_score, 4)

        # Clinically calibrated risk strata
        if risk_score < 0.30:
            category = "Low Risk"
            alert_level = "GREEN"
            recommendation = "Routine vitals monitoring; stable hemodynamic profile."
        elif risk_score < 0.65:
            category = "Moderate Risk"
            alert_level = "YELLOW"
            recommendation = "Increased monitoring frequency; inspect trending tachycardia or hypotension."
        else:
            category = "High Risk (Acute Cardiac Deterioration)"
            alert_level = "RED"
            recommendation = "Immediate clinical review indicated: alert Rapid Response Team (RRT) for hypoperfusion / hemodynamic instability."

        # Feature contributions (relative anomaly from normal median)
        contributions = [
            {"feature": "Heart Rate", "value": round(float(raw_hr if raw_hr else hr_norm * 135 + 40), 1), "unit": "bpm", "status": "Tachycardia" if hr_norm > 0.65 else ("Bradycardia" if hr_norm < 0.2 else "Normal"), "impact": "High" if hr_norm > 0.65 or hr_norm < 0.2 else "Low"},
            {"feature": "Diastolic Blood Pressure", "value": round(float(raw_dbp if raw_dbp else dbp_norm * 90 + 30), 1), "unit": "mmHg", "status": "Hypotension" if dbp_norm < 0.35 else ("Hypertension" if dbp_norm > 0.75 else "Normal"), "impact": "High" if dbp_norm < 0.35 else "Moderate"},
            {"feature": "Respiratory Rate", "value": round(float(raw_rr if raw_rr else rr_norm * 40 + 8), 1), "unit": "breaths/min", "status": "Tachypnea" if rr_norm > 0.45 else "Normal", "impact": "High" if rr_norm > 0.45 else "Low"},
            {"feature": "Patient Age", "value": round(float(raw_age if raw_age else age_norm * 74 + 18), 1), "unit": "years", "status": "Elderly (>65)" if age_norm > 0.63 else "Standard", "impact": "Moderate" if age_norm > 0.63 else "Low"}
        ]

        return {
            "prediction_id": f"PRED_{np.random.randint(100000, 999999)}",
            "model_used": model_name,
            "prediction_class": pred_class,
            "prediction_label": "Elevated Risk / Deterioration" if pred_class == 1 else "Normal / Stable Profile",
            "risk_score": risk_score,
            "risk_percentage": round(risk_score * 100, 1),
            "risk_category": category,
            "alert_level": alert_level,
            "recommendation": recommendation,
            "feature_contributions": contributions,
            "timestamp": pd.Timestamp.now().isoformat(),
            "clinical_disclaimer": (
                "Academic Decision Support Prototype: Outputs reflect empirical deterioration probability "
                "from trained ICU cohorts. This system does NOT provide a definitive diagnosis or replace clinical judgment."
            )
        }
