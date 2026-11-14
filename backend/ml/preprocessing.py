"""
Data Preprocessing Module
Structured Physiological Data Pipeline
Early Detection of Cardiac Arrest & Physiological Deterioration
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List, Optional
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.impute import SimpleImputer

class PhysiologicalPreprocessor:
    """
    Standardized, leak-free preprocessing pipeline for clinical tabular time-series.
    Strictly fits transformers on training partition only and applies to val/test.
    """

    def __init__(self, feature_columns: Optional[List[str]] = None, target_column: str = "ICU_MORT"):
        self.feature_columns = feature_columns or [
            "TIME_FROM_ADM",
            "time_scaled",
            "hr_normalized",
            "dbp_normalized",
            "rr_normalized",
            "age_normalized"
        ]
        self.target_column = target_column
        self.scaler = StandardScaler()
        self.imputer = SimpleImputer(strategy="median")
        self.fitted = False
        self.outlier_bounds = {}
        self.feature_stats = {}

    def fit(self, df_train: pd.DataFrame) -> "PhysiologicalPreprocessor":
        """
        Fits imputer, outlier bounds (IQR), and scaler strictly on training split.
        """
        X_train = df_train[self.feature_columns].copy()

        # 1. Compute outlier bounds using IQR
        for col in self.feature_columns:
            q25 = float(X_train[col].quantile(0.25))
            q75 = float(X_train[col].quantile(0.75))
            iqr = q75 - q25
            lower_bound = q25 - 2.5 * iqr
            upper_bound = q75 + 2.5 * iqr
            self.outlier_bounds[col] = (lower_bound, upper_bound)
            self.feature_stats[col] = {
                "mean": float(X_train[col].mean()),
                "std": float(X_train[col].std()),
                "median": float(X_train[col].median()),
                "min": float(X_train[col].min()),
                "max": float(X_train[col].max())
            }

        # 2. Fit imputer
        self.imputer.fit(X_train)
        X_imputed = self.imputer.transform(X_train)

        # 3. Fit scaler
        self.scaler.fit(X_imputed)
        self.fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, Optional[np.ndarray]]:
        """
        Transforms any partition using training-fitted parameters.
        """
        if not self.fitted:
            raise ValueError("Preprocessor has not been fitted! Call fit() with training data first.")

        X = df[self.feature_columns].copy()

        # Handle outliers by winsorization according to training bounds
        for col in self.feature_columns:
            low, high = self.outlier_bounds[col]
            X[col] = X[col].clip(lower=low, upper=high)

        # Impute
        X_imp = self.imputer.transform(X)

        # Scale
        X_scaled = self.scaler.transform(X_imp)

        y = None
        if self.target_column in df.columns:
            y = df[self.target_column].values.astype(int)

        return X_scaled, y

    def fit_transform_partitions(
        self, df: pd.DataFrame, split_col: str = "split"
    ) -> Dict[str, Any]:
        """
        Partitions dataframe according to PhysioNet splits ('train', 'val', 'test'),
        fits on 'train' only, and transforms all subsets.
        """
        if split_col not in df.columns:
            raise ValueError(f"Partition column '{split_col}' not found in dataframe.")

        df_train = df[df[split_col] == "train"].copy()
        df_val = df[df[split_col] == "val"].copy()
        df_test = df[df[split_col] == "test"].copy()

        if len(df_train) == 0:
            raise ValueError("Training split contains 0 rows.")

        self.fit(df_train)

        X_train, y_train = self.transform(df_train)
        X_val, y_val = self.transform(df_val) if len(df_val) > 0 else (None, None)
        X_test, y_test = self.transform(df_test) if len(df_test) > 0 else (None, None)

        train_pos = int((y_train == 1).sum()) if y_train is not None else 0
        train_neg = int((y_train == 0).sum()) if y_train is not None else 0
        class_imbalance_ratio = round(train_neg / max(1, train_pos), 2)

        return {
            "X_train": X_train,
            "y_train": y_train,
            "X_val": X_val,
            "y_val": y_val,
            "X_test": X_test,
            "y_test": y_test,
            "feature_names": self.feature_columns,
            "target_name": self.target_column,
            "train_samples": len(df_train),
            "val_samples": len(df_val),
            "test_samples": len(df_test),
            "train_positive": train_pos,
            "train_negative": train_neg,
            "class_imbalance_ratio": class_imbalance_ratio,
            "feature_stats": self.feature_stats
        }

    def save(self, file_path: str):
        """Serializes preprocessor with joblib."""
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        joblib.dump(self, file_path)

    @classmethod
    def load(cls, file_path: str) -> "PhysiologicalPreprocessor":
        """Loads serialized preprocessor."""
        return joblib.load(file_path)
