"""
Datasets API Endpoints
SSIT M.Tech Academic Research
"""

import os
import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Dict, Any

from backend.ml.data_acquisition import DatasetAcquisition

router = APIRouter(prefix="/api/datasets", tags=["datasets"])

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DATA_ROOT = os.path.join(PROJECT_ROOT, "data")
acq = DatasetAcquisition(data_root=DATA_ROOT)

@router.get("")
def list_datasets() -> Dict[str, Any]:
    """
    Returns acquisition status, schemas, and clinical access requirements for all 3 datasets.
    """
    return acq.check_dataset_status()

@router.get("/summary")
def get_primary_summary() -> Dict[str, Any]:
    """
    Returns data distribution, column statistics, missingness, and partitions.
    """
    try:
        df, summary = acq.load_primary_dataset(use_demo_if_missing=True)
        # Add head preview (first 10 rows)
        summary["preview"] = df.head(10).to_dict(orient="records")
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Allows researcher to upload custom or real PhysioNet eICU CSV files.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV datasets are supported.")

    dest_path = os.path.join(acq.raw_dir, file.filename)
    content = await file.read()
    with open(dest_path, "wb") as f:
        f.write(content)

    try:
        df = pd.read_csv(dest_path)
        summary = acq.validate_and_summarize(df, file.filename, is_demo=False)
        return {
            "message": f"Successfully uploaded and validated {file.filename}",
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse uploaded dataset: {e}")
