"""
ECG Signal Processing & Waveform Analysis API
SSIT M.Tech Academic Research
"""

import os
import json
import numpy as np
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from backend.app.schemas.schemas import ECGAnalysisRequest
from backend.ml.ecg_processing import ECGProcessor
from backend.ml.feature_extraction import FeatureExtractor

router = APIRouter(prefix="/api/ecg", tags=["ecg"])

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DEMO_ECG_FILE = os.path.join(PROJECT_ROOT, "data", "demo", "mitdb_samples.json")

processor = ECGProcessor(sampling_rate=360)
extractor = FeatureExtractor(sampling_rate=360)

@router.get("/samples")
def list_ecg_samples() -> Dict[str, Any]:
    """
    Returns available MIT-BIH benchmark recordings with expert annotations.
    """
    if not os.path.exists(DEMO_ECG_FILE):
        raise HTTPException(status_code=404, detail="ECG benchmark dataset not found.")

    with open(DEMO_ECG_FILE, "r") as f:
        data = json.load(f)

    # Return metadata without full raw signals for lightweight listing
    samples = []
    for rec in data["records"]:
        samples.append({
            "record_id": rec["record_id"],
            "label": rec["label"],
            "condition": rec["condition"],
            "sampling_rate": rec["sampling_rate"],
            "duration_sec": rec["duration_sec"],
            "num_beats": len(rec["r_peaks"])
        })
    return {"total_records": len(samples), "records": samples}

@router.post("/analyze")
def analyze_ecg_signal(req: ECGAnalysisRequest) -> Dict[str, Any]:
    """
    Processes an ECG recording or custom signal:
    Performs filtering, R-peak detection, HRV extraction, and SQI scoring.
    """
    signal_data = None
    label = "Custom"
    condition = "User Uploaded Signal"
    fs = req.sampling_rate or 360

    if req.record_id:
        if not os.path.exists(DEMO_ECG_FILE):
            raise HTTPException(status_code=404, detail="ECG benchmark not found.")
        with open(DEMO_ECG_FILE, "r") as f:
            data = json.load(f)
        for rec in data["records"]:
            if rec["record_id"] == req.record_id:
                signal_data = np.array(rec["raw_signal"], dtype=float)
                label = rec["label"]
                condition = rec["condition"]
                fs = rec["sampling_rate"]
                break
        if signal_data is None:
            raise HTTPException(status_code=404, detail=f"Record '{req.record_id}' not found.")
    elif req.custom_signal:
        signal_data = np.array(req.custom_signal, dtype=float)
    else:
        raise HTTPException(status_code=400, detail="Provide either record_id or custom_signal.")

    # 1. Conditioning
    proc = ECGProcessor(sampling_rate=fs)
    cond_result = proc.preprocess_signal(signal_data)

    clean_sig = cond_result["filtered_signal"]
    r_peaks = cond_result["detected_r_peaks"]

    # 2. Extract HRV and morphology features
    ext = FeatureExtractor(sampling_rate=fs)
    features = ext.extract_all_ecg_features(clean_sig, r_peaks)

    # 3. SQI Score
    sqi = proc.calculate_sqi(clean_sig)

    # Subsample waveforms for frontend JSON charting (first 1,000 points ~ 2.8 sec)
    max_pts = min(1200, len(signal_data))
    time_pts = [round(float(t), 4) for t in np.linspace(0, max_pts / fs, max_pts, endpoint=False)]
    raw_sub = [round(float(v), 4) for v in signal_data[:max_pts]]
    clean_sub = [round(float(v), 4) for v in clean_sig[:max_pts]]
    peaks_sub = [p for p in r_peaks if p < max_pts]

    waveform_chart = []
    for i in range(max_pts):
        pt = {
            "time_sec": time_pts[i],
            "raw_voltage": raw_sub[i],
            "filtered_voltage": clean_sub[i],
            "is_r_peak": 1 if i in peaks_sub else 0
        }
        waveform_chart.append(pt)

    return {
        "record_id": req.record_id or "Custom",
        "label": label,
        "condition": condition,
        "sampling_rate": fs,
        "snr_db": cond_result["snr_db"],
        "total_peaks_detected": len(r_peaks),
        "sqi_assessment": sqi,
        "extracted_features": features,
        "waveform_data": waveform_chart
    }
