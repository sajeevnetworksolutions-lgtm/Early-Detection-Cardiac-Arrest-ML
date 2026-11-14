"""
Database Module using SQLite
Stores Prediction History, Training Runs, and System Metadata
SSIT M.Tech Academic Research
"""

import os
import sqlite3
import json
from typing import List, Dict, Any, Optional
from datetime import datetime

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "metadata.db"))

def get_db_connection() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Predictions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prediction_id TEXT UNIQUE NOT NULL,
        timestamp TEXT NOT NULL,
        model_name TEXT NOT NULL,
        prediction_class INTEGER NOT NULL,
        prediction_label TEXT NOT NULL,
        risk_score REAL NOT NULL,
        risk_category TEXT NOT NULL,
        alert_level TEXT NOT NULL,
        inputs_json TEXT NOT NULL,
        recommendation TEXT NOT NULL
    )
    """)

    # Model Experiments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS experiments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        experiment_id TEXT UNIQUE NOT NULL,
        timestamp TEXT NOT NULL,
        target_name TEXT NOT NULL,
        dataset_name TEXT NOT NULL,
        best_model TEXT NOT NULL,
        best_cdsi REAL NOT NULL,
        metrics_summary_json TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

def log_prediction(pred_data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO predictions (
        prediction_id, timestamp, model_name, prediction_class,
        prediction_label, risk_score, risk_category, alert_level,
        inputs_json, recommendation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        pred_data["prediction_id"],
        pred_data["timestamp"],
        pred_data["model_used"],
        pred_data["prediction_class"],
        pred_data["prediction_label"],
        pred_data["risk_score"],
        pred_data["risk_category"],
        pred_data["alert_level"],
        json.dumps(pred_data.get("feature_contributions", [])),
        pred_data.get("recommendation", "")
    ))
    conn.commit()
    conn.close()

def get_all_predictions(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        result.append({
            "id": r["id"],
            "prediction_id": r["prediction_id"],
            "timestamp": r["timestamp"],
            "model_name": r["model_name"],
            "prediction_class": r["prediction_class"],
            "prediction_label": r["prediction_label"],
            "risk_score": r["risk_score"],
            "risk_category": r["risk_category"],
            "alert_level": r["alert_level"],
            "inputs": json.loads(r["inputs_json"]) if r["inputs_json"] else [],
            "recommendation": r["recommendation"]
        })
    return result

# Initialize tables on import
init_db()
