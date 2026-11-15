"""
FastAPI Backend Application
Early Detection of Cardiac Arrest Using Machine Learning
Sri Siddhartha Institute of Technology (SSIT) M.Tech Thesis System
"""

import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.api.datasets import router as datasets_router
from backend.app.api.models import router as models_router
from backend.app.api.predict import router as predict_router
from backend.app.api.ecg import router as ecg_router
from backend.app.api.reports import router as reports_router
from backend.app.database.db import init_db

app = FastAPI(
    title="Early Cardiac Arrest & Deterioration Detection API",
    description="Clinical Decision Support & Biomedical ML Research Backend (SSIT M.Tech CSE)",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(datasets_router)
app.include_router(models_router)
app.include_router(predict_router)
app.include_router(ecg_router)
app.include_router(reports_router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Cardiac Arrest & Deterioration Early Warning Backend",
        "institution": "Sri Siddhartha Institute of Technology (SSIT)",
        "department": "Computer Science & Engineering",
        "candidate": "DEEPTHI R L (25CSE06)",
        "models_ready": os.path.exists(os.path.join(PROJECT_ROOT, "saved_models", "preprocessor.joblib")),
        "database": "SQLite (data/metadata.db)"
    }

# Mount static directories for research figures
graphs_dir = os.path.join(PROJECT_ROOT, "results", "graphs")
os.makedirs(graphs_dir, exist_ok=True)
app.mount("/static/graphs", StaticFiles(directory=graphs_dir), name="graphs")

cm_dir = os.path.join(PROJECT_ROOT, "results", "confusion_matrices")
os.makedirs(cm_dir, exist_ok=True)
app.mount("/static/confusion_matrices", StaticFiles(directory=cm_dir), name="confusion_matrices")

# Mount frontend production build assets
frontend_dist = os.path.join(PROJECT_ROOT, "frontend", "dist")
assets_dir = os.path.join(frontend_dist, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# SPA Fallback Route for client-side React routing
@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    candidate = os.path.join(frontend_dist, full_path)
    if full_path and os.path.isfile(candidate):
        return FileResponse(candidate)
    index_file = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Frontend build not found. Visit /docs for API."}
