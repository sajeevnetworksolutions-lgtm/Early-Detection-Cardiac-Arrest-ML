"""
Machine Learning Training Pipeline
Trains all 6 Synopsis Algorithms + 1D-CNN, Evaluates, and Serializes Models
SSIT M.Tech Academic Research
"""

import os
import sys
import json
import joblib
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

# Enable Windows PyTorch DLL loading if available
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
TORCH_LIB = r"C:\Users\91990\AppData\Local\Programs\Python\Python311\Lib\site-packages\torch\lib"
_TORCH_DLL_COOKIE = None
if os.path.exists(TORCH_LIB):
    try:
        _TORCH_DLL_COOKIE = os.add_dll_directory(TORCH_LIB)
        os.environ["PATH"] = TORCH_LIB + ";" + os.environ["PATH"]
    except Exception:
        pass

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import TensorDataset, DataLoader
    TORCH_AVAILABLE = True
except Exception as _e:
    TORCH_AVAILABLE = False

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier

from backend.ml.data_acquisition import DatasetAcquisition
from backend.ml.preprocessing import PhysiologicalPreprocessor
from backend.ml.feature_selection import FeatureSelector
from backend.ml.evaluate import ModelEvaluator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelTrainer:
    """
    Executes reproducible, leak-free training for all 6 synopsis algorithms
    and optional PyTorch 1D-CNN.
    """

    def __init__(self, project_root: str):
        self.project_root = os.path.abspath(project_root)
        self.models_dir = os.path.join(self.project_root, "saved_models")
        self.results_dir = os.path.join(self.project_root, "results")
        self.metrics_dir = os.path.join(self.results_dir, "metrics")
        self.graphs_dir = os.path.join(self.results_dir, "graphs")
        self.reports_dir = os.path.join(self.results_dir, "reports")

        for d in [self.models_dir, self.metrics_dir, self.graphs_dir, self.reports_dir]:
            os.makedirs(d, exist_ok=True)

    def train_all_models(
        self,
        dataset_path: Optional[str] = None,
        target_column: str = "ICU_MORT",
        random_state: int = 42
    ) -> Dict[str, Any]:
        """
        Executes full training, feature selection, evaluation, and serialization cycle.
        """
        data_acq = DatasetAcquisition(data_root=os.path.join(self.project_root, "data"))

        # Step 1: Load dataset
        if dataset_path and os.path.exists(dataset_path):
            df = pd.read_csv(dataset_path)
            dataset_info = data_acq.validate_and_summarize(df, os.path.basename(dataset_path), is_demo=False)
        else:
            df, dataset_info = data_acq.load_primary_dataset(use_demo_if_missing=True)

        logger.info(f"Loaded dataset: {dataset_info['dataset_name']} with {len(df)} records.")

        # Step 2: Preprocess with strict partition isolation
        preprocessor = PhysiologicalPreprocessor(target_column=target_column)
        partitions = preprocessor.fit_transform_partitions(df, split_col="split")

        X_train, y_train = partitions["X_train"], partitions["y_train"]
        X_val, y_val = partitions["X_val"], partitions["y_val"]
        X_test, y_test = partitions["X_test"], partitions["y_test"]
        feature_names = partitions["feature_names"]

        # Save preprocessor
        prep_path = os.path.join(self.models_dir, "preprocessor.joblib")
        preprocessor.save(prep_path)

        # Step 3: Feature Selection strictly on X_train
        selector = FeatureSelector(feature_names=feature_names)
        selection_report = selector.run_comprehensive_selection(X_train, y_train, top_k=4)
        with open(os.path.join(self.metrics_dir, "feature_selection_report.json"), "w") as f:
            json.dump(selection_report, f, indent=2)

        # Step 4: Define all 6 synopsis algorithms
        algorithms = {
            "Logistic Regression": LogisticRegression(
                C=1.0, penalty="l2", solver="lbfgs", class_weight="balanced", random_state=random_state, max_iter=1000
            ),
            "Decision Tree": DecisionTreeClassifier(
                criterion="gini", max_depth=5, class_weight="balanced", random_state=random_state
            ),
            "Random Forest": RandomForestClassifier(
                n_estimators=100, max_depth=6, class_weight="balanced_subsample",
                random_state=random_state, oob_score=True, n_jobs=-1
            ),
            "Support Vector Machine": SVC(
                C=1.0, kernel="rbf", probability=True, class_weight="balanced", random_state=random_state
            ),
            "K-Nearest Neighbors": KNeighborsClassifier(
                n_neighbors=7, metric="euclidean", weights="distance"
            ),
            "Artificial Neural Network": MLPClassifier(
                hidden_layer_sizes=(64, 32), activation="relu", solver="adam",
                alpha=0.001, batch_size=64, learning_rate_init=0.002,
                max_iter=150, early_stopping=True, validation_fraction=0.15,
                n_iter_no_change=10, random_state=random_state
            )
        }

        all_metrics = []
        trained_models = {}

        # Step 5: Train and evaluate each model on test partition
        for name, model in algorithms.items():
            logger.info(f"Training {name}...")
            model.fit(X_train, y_train)

            # Predict on test set
            y_pred = model.predict(X_test)
            if hasattr(model, "predict_proba"):
                y_prob = model.predict_proba(X_test)[:, 1]
            elif hasattr(model, "decision_function"):
                df_scores = model.decision_function(X_test)
                y_prob = 1.0 / (1.0 + np.exp(-df_scores))
            else:
                y_prob = y_pred.astype(float)

            # Calculate clinical evaluation metrics
            metrics = ModelEvaluator.evaluate(
                model_name=name,
                y_true=y_test,
                y_pred=y_pred,
                y_prob=y_prob
            )

            # Add training specifics
            model_info = {
                "algorithm": name,
                "hyperparameters": {k: str(v) for k, v in model.get_params().items() if k in ["C", "kernel", "max_depth", "n_estimators", "n_neighbors", "hidden_layer_sizes", "activation", "class_weight"]}
            }
            if name == "Random Forest":
                importances = {fn: round(float(imp), 4) for fn, imp in zip(feature_names, model.feature_importances_)}
                metrics["feature_importance"] = importances
                metrics["oob_score"] = round(float(model.oob_score_), 4)
            elif name == "Decision Tree":
                metrics["tree_rules"] = export_text(model, feature_names=feature_names, max_depth=3)
            elif name == "Artificial Neural Network":
                metrics["loss_curve"] = [round(float(l), 4) for l in model.loss_curve_]
                metrics["validation_scores"] = [round(float(s), 4) for s in getattr(model, "validation_scores_", [])]

            metrics["model_info"] = model_info
            all_metrics.append(metrics)

            # Serialize model
            safe_name = name.lower().replace(" ", "_")
            model_path = os.path.join(self.models_dir, f"{safe_name}.joblib")
            joblib.dump(model, model_path)
            trained_models[name] = model_path

        # Step 6: Identify best model based on Clinical Decision Support Index
        best_selection = ModelEvaluator.select_best_model(all_metrics)

        # Step 7: Save complete experimental evaluation results
        results_package = {
            "dataset_info": dataset_info,
            "target_evaluated": target_column,
            "train_samples": len(X_train),
            "val_samples": len(X_val) if X_val is not None else 0,
            "test_samples": len(X_test),
            "features_used": feature_names,
            "feature_selection": selection_report,
            "model_comparison": all_metrics,
            "best_model_selection": best_selection,
            "timestamp": pd.Timestamp.now().isoformat()
        }

        # Save JSON
        metrics_json_path = os.path.join(self.metrics_dir, "model_comparison.json")
        with open(metrics_json_path, "w") as f:
            json.dump(results_package, f, indent=2)

        # Save CSV comparison table
        comparison_rows = []
        for m in all_metrics:
            comparison_rows.append({
                "Algorithm": m["model_name"],
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
        df_comparison = pd.DataFrame(comparison_rows)
        csv_path = os.path.join(self.metrics_dir, "model_comparison.csv")
        df_comparison.to_csv(csv_path, index=False)

        logger.info(f"Model training and experimental evaluation completed successfully!")
        logger.info(f"Best model: {best_selection['best_model_name']} (CDSI: {best_selection['best_model_metrics']['cdsi_score']})")

        return results_package

    def train_ecg_1d_cnn(self, random_state: int = 42) -> Dict[str, Any]:
        """
        Trains a 1D-Convolutional Neural Network for ECG heartbeat classification (Normal vs PVC/Arrhythmia)
        using PyTorch.
        """
        data_acq = DatasetAcquisition(data_root=os.path.join(self.project_root, "data"))
        demo_ecg_path = os.path.join(data_acq.demo_dir, "mitdb_samples.json")

        if not os.path.exists(demo_ecg_path):
            data_acq.generate_mitdb_benchmark_ecg()

        with open(demo_ecg_path, "r") as f:
            ecg_data = json.load(f)

        records = ecg_data["records"]

        # Prepare 1D ECG segments with Patient-Level Tracking
        X_beats = []
        y_beats = []
        patient_ids = []

        for rec in records:
            sig = np.array(rec["raw_signal"], dtype=np.float32)
            # Use fixed segment length: 1800 samples (5 sec)
            seg_len = 1800
            if len(sig) >= seg_len:
                sig_crop = sig[:seg_len]
                sig_norm = (sig_crop - np.mean(sig_crop)) / (np.std(sig_crop) + 1e-6)
                X_beats.append(sig_norm)
                # Label: 1 for Ventricular Ectopy (V / High Risk), 0 for Others (N / A / F)
                y_beats.append(1 if rec["label"] == "V" else 0)
                patient_ids.append(rec.get("patient_id", f"PAT_{len(patient_ids)}"))

        X = np.array(X_beats)[:, np.newaxis, :] # Shape: [N, 1, 1800]
        y = np.array(y_beats, dtype=np.int64)

        # STRICT PATIENT-LEVEL HOLDOUT SPLIT (No patient overlap between train and test)
        from sklearn.model_selection import GroupShuffleSplit
        gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=random_state)
        train_idx, test_idx = next(gss.split(X, y, groups=patient_ids))

        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]

        train_pts = len(set(patient_ids[i] for i in train_idx))
        test_pts = len(set(patient_ids[i] for i in test_idx))
        logger.info(f"ECG 1D-CNN Patient-Level Split: {train_pts} train patients ({len(y_train)} beats), {test_pts} test patients ({len(y_test)} beats). Overlap = 0.")

        try:
            if not TORCH_AVAILABLE:
                raise RuntimeError("PyTorch is not available or failed to load DLLs.")

            class ECG1DCNN(nn.Module):
                def __init__(self):
                    super().__init__()
                    self.features = nn.Sequential(
                        nn.Conv1d(1, 16, kernel_size=7, stride=2, padding=3),
                        nn.BatchNorm1d(16),
                        nn.ReLU(),
                        nn.MaxPool1d(2),
                        nn.Conv1d(16, 32, kernel_size=5, stride=2, padding=2),
                        nn.BatchNorm1d(32),
                        nn.ReLU(),
                        nn.MaxPool1d(2),
                        nn.Conv1d(32, 64, kernel_size=3, stride=1, padding=1),
                        nn.BatchNorm1d(64),
                        nn.ReLU(),
                        nn.AdaptiveAvgPool1d(8),
                        nn.Dropout(0.3)
                    )
                    self.classifier = nn.Sequential(
                        nn.Linear(64 * 8, 32),
                        nn.ReLU(),
                        nn.Linear(32, 2)
                    )

                def forward(self, x):
                    f = self.features(x)
                    f = f.view(f.size(0), -1)
                    return self.classifier(f)

            train_ds = TensorDataset(torch.tensor(X_train, dtype=torch.float32), torch.tensor(y_train, dtype=torch.long))
            test_ds = TensorDataset(torch.tensor(X_test, dtype=torch.float32), torch.tensor(y_test, dtype=torch.long))

            train_loader = DataLoader(train_ds, batch_size=16, shuffle=True)
            test_loader = DataLoader(test_ds, batch_size=16, shuffle=False)

            model = ECG1DCNN()
            criterion = nn.CrossEntropyLoss()
            optimizer = optim.Adam(model.parameters(), lr=0.003, weight_decay=1e-4)

            # Train 20 epochs
            history = {"train_loss": [], "val_loss": [], "val_acc": []}
            for epoch in range(20):
                model.train()
                epoch_loss = 0.0
                for bx, by in train_loader:
                    optimizer.zero_grad()
                    out = model(bx)
                    loss = criterion(out, by)
                    loss.backward()
                    optimizer.step()
                    epoch_loss += loss.item()
                history["train_loss"].append(round(epoch_loss / len(train_loader), 4))

            # Evaluate on test set
            model.eval()
            all_preds = []
            all_probs = []
            with torch.no_grad():
                for bx, by in test_loader:
                    out = model(bx)
                    probs = torch.softmax(out, dim=1)[:, 1].numpy()
                    preds = torch.argmax(out, dim=1).numpy()
                    all_probs.extend(probs)
                    all_preds.extend(preds)

            cnn_metrics = ModelEvaluator.evaluate(
                model_name="1D-CNN (ECG Waveform Classifier)",
                y_true=y_test,
                y_pred=np.array(all_preds),
                y_prob=np.array(all_probs)
            )
            cnn_metrics["training_history"] = history
            cnn_metrics["architecture"] = "Conv1d(1->16)->MaxPool->Conv1d(16->32)->MaxPool->Conv1d(32->64)->AdaptiveAvgPool->Dense(32)->Dense(2)"

            # Save model weights
            torch.save(model.state_dict(), os.path.join(self.models_dir, "ecg_1d_cnn.pt"))

            with open(os.path.join(self.metrics_dir, "ecg_cnn_metrics.json"), "w") as f:
                json.dump(cnn_metrics, f, indent=2)

            return cnn_metrics
        except Exception as e:
            logger.warning(f"1D-CNN execution skipped or fallback: {e}")
            return {"status": "SKIPPED", "reason": str(e)}
