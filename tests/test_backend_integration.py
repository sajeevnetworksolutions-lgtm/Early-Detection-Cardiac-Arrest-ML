"""
FastAPI Backend Integration Test
SSIT M.Tech Academic Research
"""

import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi.testclient import TestClient
from backend.app.main import app

def run_tests():
    print("Testing FastAPI API endpoints...")
    with TestClient(app) as client:
        # 1. Health
        res = client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.status_code}"
        print("  ✓ /api/health OK")

        # 2. Datasets
        res = client.get("/api/datasets")
        assert res.status_code == 200, f"Datasets failed: {res.status_code}"
        print("  ✓ /api/datasets OK")

        res_sum = client.get("/api/datasets/summary")
        assert res_sum.status_code == 200, f"Summary failed: {res_sum.status_code}"
        print("  ✓ /api/datasets/summary OK")

        # 3. Models
        res = client.get("/api/models")
        assert res.status_code == 200, f"Models failed: {res.status_code}"
        print("  ✓ /api/models OK")

        # 4. Predict
        payload = {
            "model_name": "Logistic Regression",
            "age": 70.0,
            "hr": 120.0,
            "dbp": 50.0,
            "rr": 28.0,
            "TIME_FROM_ADM": 16.0
        }
        res = client.post("/api/predict", json=payload)
        assert res.status_code == 200, f"Predict failed: {res.status_code}"
        pred = res.json()
        print(f"  ✓ /api/predict OK (Risk: {pred['risk_percentage']}%, Category: {pred['risk_category']})")

        # 5. ECG
        res = client.get("/api/ecg/samples")
        assert res.status_code == 200, f"ECG samples failed: {res.status_code}"
        first_rec = res.json()["records"][0]["record_id"]
        res_an = client.post("/api/ecg/analyze", json={"record_id": first_rec})
        assert res_an.status_code == 200, f"ECG analyze failed: {res_an.status_code}"
        print(f"  ✓ /api/ecg/analyze OK ({first_rec}: {res_an.json()['condition']})")

        # 6. Reports
        res_dict = client.get("/api/reports/feature-dictionary")
        assert res_dict.status_code == 200, f"Dictionary failed: {res_dict.status_code}"
        res_csv = client.get("/api/reports/csv")
        assert res_csv.status_code == 200, f"CSV failed: {res_csv.status_code}"
        print("  ✓ /api/reports/csv & dictionary OK")

    print("\nALL FASTAPI INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
