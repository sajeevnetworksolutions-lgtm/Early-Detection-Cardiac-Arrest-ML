"""
Model Evaluation and Clinical Metrics Engine
Calculates Accuracy, Sensitivity, Specificity, PR-AUC, ROC-AUC, FPR, FNR,
Confusion Matrices, ROC/PR Curves, and Clinical Utility Index
SSIT M.Tech Academic Research
"""

import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    roc_curve, precision_recall_curve
)

class ModelEvaluator:
    """
    Computes rigorous clinical evaluation metrics with emphasis on
    sensitivity, specificity, false-negative rate, and PR-AUC.
    """

    @staticmethod
    def evaluate(
        model_name: str,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_prob: np.ndarray
    ) -> Dict[str, Any]:
        """
        Calculates all 11 mandatory clinical metrics plus ROC/PR curve data.
        """
        y_true = np.asarray(y_true, dtype=int)
        y_pred = np.asarray(y_pred, dtype=int)
        y_prob = np.asarray(y_prob, dtype=float)

        # Basic rates
        acc = float(accuracy_score(y_true, y_pred))
        prec = float(precision_score(y_true, y_pred, zero_division=0))
        rec = float(recall_score(y_true, y_pred, zero_division=0)) # Sensitivity
        f1 = float(f1_score(y_true, y_pred, zero_division=0))

        # Confusion matrix: tn, fp, fn, tp
        cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
        tn, fp, fn, tp = int(cm[0, 0]), int(cm[0, 1]), int(cm[1, 0]), int(cm[1, 1])

        # Clinical specifics
        sensitivity = rec # TP / (TP + FN)
        specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0 # TN / (TN + FP)
        fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0 # FP / (FP + TN)
        fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0 # FN / (FN + TP)

        # ROC-AUC and PR-AUC
        try:
            roc_auc = float(roc_auc_score(y_true, y_prob))
        except Exception:
            roc_auc = 0.5

        try:
            pr_auc = float(average_precision_score(y_true, y_prob))
        except Exception:
            pr_auc = float(np.mean(y_true))

        # ROC Curve points
        try:
            fpr_arr, tpr_arr, _ = roc_curve(y_true, y_prob)
            # Sample max 50 points for efficient frontend charting
            step = max(1, len(fpr_arr) // 50)
            roc_points = [
                {"fpr": round(float(f), 4), "tpr": round(float(t), 4)}
                for f, t in zip(fpr_arr[::step], tpr_arr[::step])
            ]
        except Exception:
            roc_points = [{"fpr": 0.0, "tpr": 0.0}, {"fpr": 1.0, "tpr": 1.0}]

        # PR Curve points
        try:
            p_arr, r_arr, _ = precision_recall_curve(y_true, y_prob)
            step_pr = max(1, len(p_arr) // 50)
            pr_points = [
                {"recall": round(float(r), 4), "precision": round(float(p), 4)}
                for p, r in zip(p_arr[::step_pr], r_arr[::step_pr])
            ]
        except Exception:
            pr_points = [{"recall": 0.0, "precision": 1.0}, {"recall": 1.0, "precision": 0.0}]

        # Clinical Decision Support Index (CDSI):
        # Prioritizes high Sensitivity and low False Negatives, while balancing Specificity & PR-AUC
        # CDSI = 0.40*Sensitivity + 0.25*PR_AUC + 0.20*ROC_AUC + 0.15*Specificity - 0.10*FNR
        cdsi = (
            0.40 * sensitivity +
            0.25 * pr_auc +
            0.20 * roc_auc +
            0.15 * specificity -
            0.10 * fnr
        )

        return {
            "model_name": model_name,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "sensitivity": round(sensitivity, 4),
            "specificity": round(specificity, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "confusion_matrix": {
                "tn": tn,
                "fp": fp,
                "fn": fn,
                "tp": tp,
                "matrix": [[tn, fp], [fn, tp]]
            },
            "false_positive_rate": round(fpr, 4),
            "false_negative_rate": round(fnr, 4),
            "cdsi_score": round(cdsi, 4),
            "roc_curve": roc_points,
            "pr_curve": pr_points,
            "test_sample_count": len(y_true),
            "positive_sample_count": int(np.sum(y_true == 1)),
            "negative_sample_count": int(np.sum(y_true == 0))
        }

    @staticmethod
    def select_best_model(models_metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Identifies the optimal model based on Clinical Decision Support Index (CDSI)
        which rigorously prioritizes sensitivity and minimized false negatives.
        """
        if not models_metrics:
            return {}

        sorted_models = sorted(models_metrics, key=lambda m: m["cdsi_score"], reverse=True)
        best = sorted_models[0]

        rationale = (
            f"Model '{best['model_name']}' was selected as the optimal clinical decision-support model "
            f"with a CDSI score of {best['cdsi_score']:.4f}. It achieves a Sensitivity of {best['sensitivity']*100:.1f}% "
            f"and a False Negative Rate of only {best['false_negative_rate']*100:.1f}%, while maintaining "
            f"{best['specificity']*100:.1f}% Specificity and a ROC-AUC of {best['roc_auc']:.4f}. In emergency cardiac "
            f"deterioration monitoring, failing to identify an unstable patient (False Negative) carries mortal risk, "
            f"justifying prioritization of sensitivity and PR-AUC over raw accuracy."
        )

        return {
            "best_model_name": best["model_name"],
            "best_model_metrics": best,
            "selection_criterion": "Clinical Decision Support Index (CDSI: 40% Sensitivity, 25% PR-AUC, 20% ROC-AUC, 15% Specificity, -10% FNR)",
            "selection_rationale": rationale,
            "rankings": [
                {
                    "rank": i + 1,
                    "model_name": m["model_name"],
                    "cdsi_score": m["cdsi_score"],
                    "sensitivity": m["sensitivity"],
                    "fnr": m["false_negative_rate"],
                    "accuracy": m["accuracy"],
                    "roc_auc": m["roc_auc"]
                }
                for i, m in enumerate(sorted_models)
            ]
        }
