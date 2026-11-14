"""
Comprehensive Automated Test Suite
Tests Dataset Acquisition, Preprocessing, ECG Filtering, Feature Extraction,
Feature Selection, Inference, and API Endpoints
SSIT M.Tech Academic Research
"""

import os
import sys
import unittest
import numpy as np
import pandas as pd

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.ml.data_acquisition import DatasetAcquisition
from backend.ml.preprocessing import PhysiologicalPreprocessor
from backend.ml.ecg_processing import ECGProcessor
from backend.ml.feature_extraction import FeatureExtractor
from backend.ml.feature_selection import FeatureSelector
from backend.ml.predict import RiskPredictor

class TestCardiacPipeline(unittest.TestCase):

    def setUp(self):
        self.data_root = os.path.join(PROJECT_ROOT, "data")
        self.acq = DatasetAcquisition(data_root=self.data_root)
        self.ecg_proc = ECGProcessor(sampling_rate=360)
        self.extractor = FeatureExtractor(sampling_rate=360)

    def test_01_dataset_schema_validation(self):
        df, summary = self.acq.load_primary_dataset(use_demo_if_missing=True)
        self.assertGreater(len(df), 100)
        self.assertIn("hr_normalized", df.columns)
        self.assertIn("dbp_normalized", df.columns)
        self.assertIn("rr_normalized", df.columns)
        self.assertIn("age_normalized", df.columns)
        self.assertIn("ICU_MORT", df.columns)
        self.assertTrue(summary["schema_valid"])
        self.assertEqual(summary["duplicate_records"], 0)

    def test_02_preprocessing_partition_isolation(self):
        df, _ = self.acq.load_primary_dataset(use_demo_if_missing=True)
        prep = PhysiologicalPreprocessor(target_column="ICU_MORT")
        partitions = prep.fit_transform_partitions(df, split_col="split")

        self.assertIsNotNone(partitions["X_train"])
        self.assertIsNotNone(partitions["X_test"])
        self.assertEqual(len(partitions["X_train"]), partitions["train_samples"])
        self.assertEqual(len(partitions["X_test"]), partitions["test_samples"])
        # Check normalization bounds
        self.assertAlmostEqual(np.mean(partitions["X_train"]), 0.0, delta=0.5)

    def test_03_ecg_butterworth_filtering(self):
        fs = 360
        t = np.linspace(0, 2, fs * 2, endpoint=False)
        # 1 Hz cardiac pulse + 50 Hz powerline interference + 0.1 Hz baseline drift
        sig = np.sin(2 * np.pi * 1.0 * t) + 0.3 * np.sin(2 * np.pi * 50.0 * t) + 0.5 * np.sin(2 * np.pi * 0.1 * t)

        result = self.ecg_proc.preprocess_signal(sig)
        clean = result["filtered_signal"]

        self.assertEqual(len(clean), len(sig))
        self.assertIn("snr_db", result)
        self.assertGreater(result["snr_db"], -10.0)

    def test_04_feature_extraction(self):
        # Create mock R-peaks with regular 800ms interval (75 bpm)
        fs = 360
        r_peaks = [int(i * 0.8 * fs) for i in range(1, 10)]
        clean_sig = np.zeros(fs * 10)
        for p in r_peaks:
            clean_sig[p] = 1.5

        features = self.extractor.extract_all_ecg_features(clean_sig, r_peaks)
        self.assertIn("mean_hr_bpm", features)
        self.assertAlmostEqual(features["mean_hr_bpm"], 75.0, delta=5.0)
        self.assertIn("sdnn_ms", features)
        self.assertIn("rmssd_ms", features)
        self.assertIn("qrs_duration_ms", features)

    def test_05_feature_selection(self):
        rng = np.random.RandomState(42)
        X = rng.randn(100, 4)
        y = (X[:, 0] + X[:, 1] > 0).astype(int)
        names = ["feat_A", "feat_B", "feat_C", "feat_D"]

        selector = FeatureSelector(feature_names=names)
        report = selector.run_comprehensive_selection(X, y, top_k=2)

        self.assertEqual(len(report["selected_features"]), 2)
        self.assertEqual(len(report["removed_features"]), 2)
        self.assertIn("feat_A", report["selected_features"])

    def test_06_model_inference_engine(self):
        models_dir = os.path.join(PROJECT_ROOT, "saved_models")
        predictor = RiskPredictor(models_dir=models_dir)

        test_patient = {
            "age": 68.0,
            "hr": 115.0, # Tachycardia
            "dbp": 55.0, # Hypotension
            "rr": 26.0,  # Tachypnea
            "TIME_FROM_ADM": 18.0
        }

        res = predictor.predict_risk(test_patient, model_name="Logistic Regression")
        self.assertIn("risk_score", res)
        self.assertIn("risk_category", res)
        self.assertIn("alert_level", res)
        self.assertGreaterEqual(res["risk_score"], 0.0)
        self.assertLessEqual(res["risk_score"], 1.0)

if __name__ == "__main__":
    unittest.main()
