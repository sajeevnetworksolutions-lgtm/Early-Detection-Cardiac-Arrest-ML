"""
Direct FastAPI Router Functions Integration Test
SSIT M.Tech Academic Research
"""

import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import unittest
from backend.app.main import health_check
from backend.app.api.datasets import list_datasets, get_primary_summary
from backend.app.api.models import get_all_models_summary
from backend.app.api.predict import predict_patient_risk, list_prediction_history
from backend.app.api.ecg import list_ecg_samples, analyze_ecg_signal
from backend.app.api.reports import get_features_catalog
from backend.app.schemas.schemas import PatientRiskInput, ECGAnalysisRequest

class TestDirectEndpoints(unittest.TestCase):

    def test_01_health_check(self):
        res = health_check()
        self.assertEqual(res["status"], "healthy")
        self.assertTrue(res["models_ready"])

    def test_02_datasets_endpoints(self):
        datasets = list_datasets()
        self.assertIn("primary_dataset", datasets)
        summary = get_primary_summary()
        self.assertGreater(summary["total_records"], 0)
        self.assertIn("preview", summary)

    def test_03_models_summary(self):
        models = get_all_models_summary()
        self.assertIn("model_comparison", models)
        self.assertEqual(len(models["model_comparison"]), 6)
        self.assertIn("best_model_selection", models)

    def test_04_predict_and_history(self):
        inp = PatientRiskInput(
            model_name="Logistic Regression",
            age=72.0,
            hr=125.0,
            dbp=52.0,
            rr=28.0,
            TIME_FROM_ADM=18.0
        )
        pred = predict_patient_risk(inp)
        self.assertIn("risk_score", pred)
        self.assertIn("risk_category", pred)
        self.assertIn("alert_level", pred)
        self.assertEqual(pred["alert_level"], "RED") # Tachycardia + Severe Hypotension -> RED alert

        # Verify SQLite audit log
        history = list_prediction_history(limit=5)
        self.assertGreater(len(history), 0)
        self.assertEqual(history[0]["prediction_id"], pred["prediction_id"])

    def test_05_ecg_analysis(self):
        samples = list_ecg_samples()
        self.assertGreater(samples["total_records"], 0)
        first_id = samples["records"][0]["record_id"]

        req = ECGAnalysisRequest(record_id=first_id)
        an = analyze_ecg_signal(req)
        self.assertIn("waveform_data", an)
        self.assertIn("extracted_features", an)
        self.assertIn("sqi_assessment", an)

    def test_06_reports_catalog(self):
        catalog = get_features_catalog()
        self.assertGreater(len(catalog), 5)

if __name__ == "__main__":
    unittest.main()
