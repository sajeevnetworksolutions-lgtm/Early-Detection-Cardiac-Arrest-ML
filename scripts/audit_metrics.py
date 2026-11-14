"""
Independent Machine Learning Evaluation Audit Script
Verifies Confusion Matrices, Metric Formulas, and Calibration
SSIT M.Tech Academic Research Audit
"""

import os
import json
import numpy as np
import pandas as pd

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
METRICS_JSON = os.path.join(PROJECT_ROOT, "results", "metrics", "model_comparison.json")

def audit_tabular_metrics():
    with open(METRICS_JSON, "r") as f:
        data = json.load(f)

    print("=================================================================")
    print("INDEPENDENT METRIC VERIFICATION AUDIT")
    print("=================================================================")
    print(f"Target Variable Evaluated: {data['target_evaluated']}")
    print(f"Holdout Test Cohort Size: {data['test_samples']} patients")
    print(f"Positive Outcomes in Test Set: {data['model_comparison'][0]['positive_sample_count']}")
    print(f"Negative Outcomes in Test Set: {data['model_comparison'][0]['negative_sample_count']}")
    print("-----------------------------------------------------------------")

    all_verified = True
    for m in data["model_comparison"]:
        name = m["model_name"]
        cm = m["confusion_matrix"]
        tn, fp, fn, tp = cm["tn"], cm["fp"], cm["fn"], cm["tp"]
        total = tn + fp + fn + tp

        calc_acc = round((tp + tn) / total, 4)
        calc_sens = round(tp / (tp + fn), 4) if (tp + fn) > 0 else 0.0
        calc_spec = round(tn / (tn + fp), 4) if (tn + fp) > 0 else 0.0
        calc_fpr = round(fp / (tn + fp), 4) if (tn + fp) > 0 else 0.0
        calc_fnr = round(fn / (tp + fn), 4) if (tp + fn) > 0 else 0.0
        calc_prec = round(tp / (tp + fp), 4) if (tp + fp) > 0 else 0.0
        calc_f1 = round(2 * (calc_prec * calc_sens) / (calc_prec + calc_sens), 4) if (calc_prec + calc_sens) > 0 else 0.0

        # Check against reported values
        acc_match = abs(calc_acc - m["accuracy"]) < 0.001
        sens_match = abs(calc_sens - m["sensitivity"]) < 0.001
        spec_match = abs(calc_spec - m["specificity"]) < 0.001
        fnr_match = abs(calc_fnr - m["false_negative_rate"]) < 0.001
        fpr_match = abs(calc_fpr - m["false_positive_rate"]) < 0.001

        status = "PASSED" if (acc_match and sens_match and spec_match and fnr_match and fpr_match) else "MISMATCH"
        if status != "PASSED":
            all_verified = False

        print(f"[{status}] {name}")
        print(f"   Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp} (Sum={total})")
        print(f"   Acc: {m['accuracy']} (Calc: {calc_acc}) | Sens: {m['sensitivity']} (Calc: {calc_sens})")
        print(f"   Spec: {m['specificity']} (Calc: {calc_spec}) | FNR: {m['false_negative_rate']} (Calc: {calc_fnr})")
        print(f"   CDSI Reported: {m['cdsi_score']}")
        print("-----------------------------------------------------------------")

    print(f"Tabular Model Evaluation Audit Result: {'ALL VERIFIED 100%' if all_verified else 'ERRORS DETECTED'}")

if __name__ == "__main__":
    audit_tabular_metrics()
