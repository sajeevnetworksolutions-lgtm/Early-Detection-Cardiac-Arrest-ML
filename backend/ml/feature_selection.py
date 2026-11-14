"""
Feature Selection Module
Correlation Analysis, Mutual Information, RFE, and Tree-Based Importance
SSIT M.Tech Academic Research
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.feature_selection import mutual_info_classif, RFE
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

class FeatureSelector:
    """
    Evaluates, ranks, and selects features strictly using training data partitions
    to preserve mathematical validity and avoid data leakage.
    """

    def __init__(self, feature_names: List[str]):
        self.feature_names = feature_names

    def analyze_correlation(self, X_train: np.ndarray, y_train: np.ndarray) -> Dict[str, Any]:
        """
        Computes Pearson correlation coefficients with the target outcome
        and pairwise collinearity matrix across features.
        """
        df = pd.DataFrame(X_train, columns=self.feature_names)
        df["target"] = y_train

        corr_matrix = df.corr()
        target_corr = corr_matrix["target"].drop("target").to_dict()

        # Pairwise feature correlation matrix without target
        feature_corr = df[self.feature_names].corr().round(4).to_dict()

        return {
            "target_correlation": {k: round(float(v), 4) for k, v in target_corr.items()},
            "feature_correlation_matrix": feature_corr
        }

    def compute_mutual_information(self, X_train: np.ndarray, y_train: np.ndarray, random_state: int = 42) -> Dict[str, float]:
        """
        Calculates non-linear dependency via Mutual Information score.
        """
        mi_scores = mutual_info_classif(X_train, y_train, random_state=random_state)
        return {name: round(float(score), 4) for name, score in zip(self.feature_names, mi_scores)}

    def compute_rf_importance(self, X_train: np.ndarray, y_train: np.ndarray, random_state: int = 42) -> Dict[str, float]:
        """
        Estimates Gini impurity reduction via Random Forest.
        """
        rf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=random_state, class_weight="balanced")
        rf.fit(X_train, y_train)
        importances = rf.feature_importances_
        return {name: round(float(imp), 4) for name, imp in zip(self.feature_names, importances)}

    def compute_rfe_ranking(self, X_train: np.ndarray, y_train: np.ndarray, n_features_to_select: int = 4) -> Dict[str, Any]:
        """
        Performs Recursive Feature Elimination using Logistic Regression as baseline estimator.
        """
        estimator = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)
        rfe = RFE(estimator=estimator, n_features_to_select=min(n_features_to_select, len(self.feature_names)))
        rfe.fit(X_train, y_train)

        rankings = {name: int(rank) for name, rank in zip(self.feature_names, rfe.ranking_)}
        selected = [name for name, support in zip(self.feature_names, rfe.support_) if support]
        removed = [name for name in self.feature_names if name not in selected]

        return {
            "rankings": rankings,
            "selected_features": selected,
            "removed_features": removed
        }

    def run_comprehensive_selection(
        self, X_train: np.ndarray, y_train: np.ndarray, top_k: int = 4
    ) -> Dict[str, Any]:
        """
        Runs all four feature selection methods, aggregates the rankings into a composite consensus score,
        and returns the complete report.
        """
        corr_res = self.analyze_correlation(X_train, y_train)
        mi_res = self.compute_mutual_information(X_train, y_train)
        rf_res = self.compute_rf_importance(X_train, y_train)
        rfe_res = self.compute_rfe_ranking(X_train, y_train, n_features_to_select=top_k)

        # Composite score: Normalized rank combination
        composite_ranks = {}
        for f in self.feature_names:
            score = (
                abs(corr_res["target_correlation"].get(f, 0.0)) * 0.25 +
                mi_res.get(f, 0.0) * 0.25 +
                rf_res.get(f, 0.0) * 0.25 +
                (1.0 / max(1, rfe_res["rankings"].get(f, 1))) * 0.25
            )
            composite_ranks[f] = round(float(score), 4)

        ranked_features = sorted(composite_ranks.items(), key=lambda x: x[1], reverse=True)
        selected_features = [f[0] for f in ranked_features[:top_k]]
        removed_features = [f[0] for f in ranked_features[top_k:]]

        return {
            "feature_names": self.feature_names,
            "target_correlation": corr_res["target_correlation"],
            "correlation_matrix": corr_res["feature_correlation_matrix"],
            "mutual_information": mi_res,
            "random_forest_importance": rf_res,
            "rfe_ranking": rfe_res["rankings"],
            "composite_scores": composite_ranks,
            "ranked_features": [f[0] for f in ranked_features],
            "selected_features": selected_features,
            "removed_features": removed_features
        }
