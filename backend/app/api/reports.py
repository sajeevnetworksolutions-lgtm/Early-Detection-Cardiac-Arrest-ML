"""
Reports & Artifact Downloads API
SSIT M.Tech Academic Research
"""

import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import Dict, Any, List

from backend.ml.feature_extraction import FeatureExtractor
from backend.app.services.report_service import ResearchReportGenerator

router = APIRouter(prefix="/api/reports", tags=["reports"])

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
REPORTS_DIR = os.path.join(PROJECT_ROOT, "results", "reports")
METRICS_DIR = os.path.join(PROJECT_ROOT, "results", "metrics")
GRAPHS_DIR = os.path.join(PROJECT_ROOT, "results", "graphs")

@router.get("/pdf")
def download_research_pdf():
    """
    Returns the comprehensive PDF academic research report.
    """
    pdf_path = os.path.join(REPORTS_DIR, "Early_Cardiac_Arrest_Detection_Research_Report.pdf")
    if not os.path.exists(pdf_path):
        gen = ResearchReportGenerator(project_root=PROJECT_ROOT)
        pdf_path = gen.generate_pdf_report()

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename="Early_Cardiac_Arrest_Detection_Research_Report.pdf"
    )

@router.get("/csv")
def download_comparison_csv():
    """
    Returns the model evaluation comparison CSV table.
    """
    csv_path = os.path.join(METRICS_DIR, "model_comparison.csv")
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="Comparison CSV not found.")

    return FileResponse(
        path=csv_path,
        media_type="text/csv",
        filename="model_comparison.csv"
    )

@router.get("/feature-dictionary")
def get_features_catalog() -> List[Dict[str, str]]:
    """
    Returns academic explanation and clinical utility of all features.
    """
    return FeatureExtractor.get_feature_dictionary()
