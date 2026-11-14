"""
Full Academic Pipeline Execution Script
Runs Data Acquisition, Preprocessing, Feature Selection, All 6 Synopsis Models,
1D-CNN, Evaluation, Confusion Matrices, ROC Curves, and Research Figures
SSIT M.Tech Academic Research
"""

import os
import sys

# Ensure project root is in PYTHONPATH
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Configure Matplotlib writable temp cache for sandbox
os.environ["MPLCONFIGDIR"] = os.path.join(PROJECT_ROOT, "results", "mpl_cache")
os.makedirs(os.environ["MPLCONFIGDIR"], exist_ok=True)

import json
import logging
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from backend.ml.data_acquisition import DatasetAcquisition
from backend.ml.train import ModelTrainer
from backend.ml.ecg_processing import ECGProcessor
from backend.ml.feature_extraction import FeatureExtractor

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def generate_research_plots(results: dict, results_dir: str):
    """
    Generates high-resolution publication-ready research plots.
    """
    metrics = results["model_comparison"]
    graphs_dir = os.path.join(results_dir, "graphs")
    cm_dir = os.path.join(results_dir, "confusion_matrices")
    os.makedirs(graphs_dir, exist_ok=True)
    os.makedirs(cm_dir, exist_ok=True)

    sns.set_theme(style="whitegrid")

    # 1. Comparison Bar Chart (Accuracy, Sensitivity, Specificity, ROC-AUC, PR-AUC)
    df_plot = pd.DataFrame([
        {
            "Algorithm": m["model_name"],
            "Accuracy": m["accuracy"],
            "Sensitivity": m["sensitivity"],
            "Specificity": m["specificity"],
            "F1-Score": m["f1_score"],
            "ROC-AUC": m["roc_auc"],
            "PR-AUC": m["pr_auc"]
        }
        for m in metrics
    ])

    df_melted = pd.melt(df_plot, id_vars=["Algorithm"], var_name="Metric", value_name="Score")

    plt.figure(figsize=(13, 6))
    palette = ["#0284c7", "#0d9488", "#10b981", "#f59e0b", "#6366f1", "#ec4899"]
    ax = sns.barplot(data=df_melted, x="Algorithm", y="Score", hue="Metric", palette="Blues_r")
    plt.title("Performance Comparison of All 6 Machine Learning Algorithms (Test Partition)", fontsize=14, fontweight="bold", pad=15)
    plt.ylim(0, 1.05)
    plt.ylabel("Score (0.0 - 1.0)", fontsize=12)
    plt.xlabel("Machine Learning Algorithm", fontsize=12)
    plt.xticks(rotation=15, ha="right", fontsize=10)
    plt.legend(bbox_to_anchor=(1.02, 1), loc="upper left", borderaxespad=0.)
    plt.tight_layout()
    plt.savefig(os.path.join(graphs_dir, "model_comparison_barchart.png"), dpi=300)
    plt.close()

    # 2. Confusion Matrices Grid
    fig, axes = plt.subplots(2, 3, figsize=(15, 10))
    axes = axes.flatten()

    for idx, m in enumerate(metrics):
        cm = np.array(m["confusion_matrix"]["matrix"])
        ax = axes[idx]
        sns.heatmap(
            cm, annot=True, fmt="d", cmap="Blues", cbar=False, ax=ax,
            xticklabels=["Predicted Stable (0)", "Predicted Deterioration (1)"],
            yticklabels=["Actual Stable (0)", "Actual Deterioration (1)"]
        )
        ax.set_title(f"{m['model_name']}\nSens: {m['sensitivity']*100:.1f}%, Spec: {m['specificity']*100:.1f}%", fontsize=11, fontweight="bold")
        ax.set_xlabel("Predicted Class")
        ax.set_ylabel("True Class")

    plt.suptitle("Confusion Matrices Across All Evaluated Algorithms", fontsize=16, fontweight="bold", y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(cm_dir, "all_confusion_matrices.png"), dpi=300)
    plt.close()

    # 3. ROC Curves
    plt.figure(figsize=(9, 7))
    for m in metrics:
        pts = m["roc_curve"]
        fprs = [p["fpr"] for p in pts]
        tprs = [p["tpr"] for p in pts]
        plt.plot(fprs, tprs, label=f"{m['model_name']} (AUC = {m['roc_auc']:.3f})", lw=2)

    plt.plot([0, 1], [0, 1], "k--", lw=1.5, label="Chance Level (AUC = 0.500)")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate (1 - Specificity)", fontsize=12)
    plt.ylabel("True Positive Rate (Sensitivity)", fontsize=12)
    plt.title("Receiver Operating Characteristic (ROC) Curves", fontsize=14, fontweight="bold", pad=15)
    plt.legend(loc="lower right", fontsize=10)
    plt.tight_layout()
    plt.savefig(os.path.join(graphs_dir, "roc_curves.png"), dpi=300)
    plt.close()

    # 4. Precision-Recall Curves
    plt.figure(figsize=(9, 7))
    for m in metrics:
        pts = m["pr_curve"]
        recs = [p["recall"] for p in pts]
        precs = [p["precision"] for p in pts]
        plt.plot(recs, precs, label=f"{m['model_name']} (PR-AUC = {m['pr_auc']:.3f})", lw=2)

    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("Recall (Sensitivity)", fontsize=12)
    plt.ylabel("Precision", fontsize=12)
    plt.title("Precision-Recall (PR) Curves (Imbalanced Clinical Evaluation)", fontsize=14, fontweight="bold", pad=15)
    plt.legend(loc="upper right", fontsize=10)
    plt.tight_layout()
    plt.savefig(os.path.join(graphs_dir, "precision_recall_curves.png"), dpi=300)
    plt.close()

    # 5. Feature Importance & Correlation
    fe_report = results["feature_selection"]
    rf_imp = fe_report.get("random_forest_importance", {})
    if rf_imp:
        plt.figure(figsize=(9, 5))
        feats = list(rf_imp.keys())
        imps = list(rf_imp.values())
        y_pos = np.arange(len(feats))
        plt.barh(y_pos, imps, color="#0284c7", edgecolor="#0369a1")
        plt.yticks(y_pos, feats, fontsize=11)
        plt.xlabel("Random Forest Relative Importance (Gini Impurity Reduction)", fontsize=12)
        plt.title("Feature Importance in Physiological Deterioration Risk", fontsize=14, fontweight="bold", pad=15)
        plt.gca().invert_yaxis()
        plt.tight_layout()
        plt.savefig(os.path.join(graphs_dir, "feature_importance.png"), dpi=300)
        plt.close()

    # 6. ANN Loss Curve
    for m in metrics:
        if m["model_name"] == "Artificial Neural Network" and "loss_curve" in m:
            plt.figure(figsize=(8, 4.5))
            plt.plot(m["loss_curve"], color="#0d9488", lw=2, label="Cross-Entropy Training Loss")
            plt.title("Artificial Neural Network (ANN) Training Loss Curve", fontsize=13, fontweight="bold", pad=12)
            plt.xlabel("Iteration", fontsize=11)
            plt.ylabel("Binary Cross-Entropy Loss", fontsize=11)
            plt.legend()
            plt.tight_layout()
            plt.savefig(os.path.join(graphs_dir, "ann_loss_curve.png"), dpi=300)
            plt.close()

    # 7. Audited 1D-CNN Confusion Matrix and ROC Curve
    cnn = results.get("ecg_cnn")
    if cnn and "confusion_matrix" in cnn:
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5))
        cm_data = np.array(cnn["confusion_matrix"]["matrix"])
        sns.heatmap(
            cm_data, annot=True, fmt="d", cmap="Purples", ax=ax1,
            xticklabels=["Normal / Non-Ectopic", "Ventricular Ectopy (PVC)"],
            yticklabels=["Normal / Non-Ectopic", "Ventricular Ectopy (PVC)"]
        )
        ax1.set_title(f"Audited 1D-CNN Confusion Matrix\n(Patient-Holdout Test Set, N=100 beats)", fontsize=11, fontweight="bold")
        ax1.set_xlabel("Predicted Beat Class")
        ax1.set_ylabel("True Beat Class")

        pts = cnn["roc_curve"]
        fprs = [p["fpr"] for p in pts]
        tprs = [p["tpr"] for p in pts]
        ax2.plot(fprs, tprs, color="#7c3aed", lw=2.5, label=f"1D-CNN (AUC = {cnn['roc_auc']:.4f})")
        ax2.plot([0, 1], [0, 1], "k--", lw=1.5, label="Chance Level")
        ax2.set_xlim([0.0, 1.0])
        ax2.set_ylim([0.0, 1.05])
        ax2.set_xlabel("False Positive Rate", fontsize=11)
        ax2.set_ylabel("True Positive Rate", fontsize=11)
        ax2.set_title("1D-CNN ROC Curve (Patient Holdout)", fontsize=11, fontweight="bold")
        ax2.legend(loc="lower right")

        plt.suptitle("Audited 1D-CNN Performance (Strict Patient-Level Split)", fontsize=13, fontweight="bold", y=1.02)
        plt.tight_layout()
        plt.savefig(os.path.join(graphs_dir, "ecg_cnn_eval.png"), dpi=300)
        plt.close()

    logger.info(f"Research publication plots successfully saved to {graphs_dir}")

def main():
    logger.info("=================================================================")
    logger.info("EARLY DETECTION OF CARDIAC ARREST & DETERIORATION RESEARCH SYSTEM")
    logger.info("Sri Siddhartha Institute of Technology (SSIT) M.Tech Thesis Pipeline")
    logger.info("=================================================================")

    # Step 1: Initialize Dataset Acquisition
    data_acq = DatasetAcquisition(data_root=os.path.join(PROJECT_ROOT, "data"))
    status = data_acq.check_dataset_status()
    logger.info(f"Dataset Acquisition Status: {json.dumps(status, indent=2)}")

    # Step 2: Ensure Benchmark Datasets exist
    data_acq.generate_mitdb_benchmark_ecg()

    # Step 3: Run Model Training & Evaluation
    trainer = ModelTrainer(project_root=PROJECT_ROOT)
    results = trainer.train_all_models(target_column="ICU_MORT")

    # Step 4: Run 1D-CNN on ECG Signals with Patient-Level Split
    cnn_results = trainer.train_ecg_1d_cnn()
    logger.info(f"1D-CNN Result: {cnn_results.get('model_name', 'CNN')} with Accuracy: {cnn_results.get('accuracy', 'N/A')}")
    results["ecg_cnn"] = cnn_results

    # Build Audited Comparison Table
    audited_rows = []
    for m in results["model_comparison"]:
        audited_rows.append({
            "Algorithm": m["model_name"],
            "Modality": "ICU Time Series (Tabular)",
            "Accuracy": m["accuracy"],
            "Sensitivity (Recall)": m["sensitivity"],
            "Specificity": m["specificity"],
            "Precision": m["precision"],
            "F1-Score": m["f1_score"],
            "ROC-AUC": m["roc_auc"],
            "PR-AUC": m["pr_auc"],
            "FPR": m["false_positive_rate"],
            "FNR": m["false_negative_rate"],
            "CDSI Score": m["cdsi_score"]
        })
    if "accuracy" in cnn_results and cnn_results.get("accuracy") is not None:
        audited_rows.append({
            "Algorithm": cnn_results["model_name"],
            "Modality": "ECG Lead II Waveform (1D)",
            "Accuracy": cnn_results["accuracy"],
            "Sensitivity (Recall)": cnn_results["sensitivity"],
            "Specificity": cnn_results["specificity"],
            "Precision": cnn_results["precision"],
            "F1-Score": cnn_results["f1_score"],
            "ROC-AUC": cnn_results["roc_auc"],
            "PR-AUC": cnn_results["pr_auc"],
            "FPR": cnn_results["false_positive_rate"],
            "FNR": cnn_results["false_negative_rate"],
            "CDSI Score": cnn_results["cdsi_score"]
        })

    df_audited = pd.DataFrame(audited_rows)
    audited_csv_path = os.path.join(PROJECT_ROOT, "results", "metrics", "model_comparison_audited.csv")
    df_audited.to_csv(audited_csv_path, index=False)
    logger.info(f"Saved comprehensive audited comparison table to {audited_csv_path}")

    # Step 5: Generate Publication Figures
    generate_research_plots(results, results_dir=os.path.join(PROJECT_ROOT, "results"))

    # Step 6: Print Final Summary
    best = results["best_model_selection"]
    print("\n" + "=" * 80)
    print("EXPERIMENTAL EVALUATION SUMMARY")
    print("=" * 80)
    print(f"Total Test Patients Evaluated: {results['test_samples']}")
    print(f"Selected Target: {results['target_evaluated']} (Acute Deterioration / Mortality Risk)")
    print(f"Best Performing Algorithm: {best['best_model_name']}")
    print(f"Clinical Decision Support Index (CDSI): {best['best_model_metrics']['cdsi_score']}")
    print(f"Sensitivity: {best['best_model_metrics']['sensitivity']*100:.2f}% | Specificity: {best['best_model_metrics']['specificity']*100:.2f}%")
    print(f"False Negative Rate: {best['best_model_metrics']['false_negative_rate']*100:.2f}% (Minimized for safety)")
    print(f"ROC-AUC: {best['best_model_metrics']['roc_auc']:.4f} | PR-AUC: {best['best_model_metrics']['pr_auc']:.4f}")
    print("=" * 80)

if __name__ == "__main__":
    main()
