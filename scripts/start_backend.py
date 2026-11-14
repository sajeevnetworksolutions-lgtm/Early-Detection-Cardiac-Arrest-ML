"""
Backend Server Startup Script
Runs FastAPI application using Uvicorn
SSIT M.Tech Academic Research
"""

import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import uvicorn

def main():
    print("=" * 70)
    print("Starting Early Cardiac Arrest & Deterioration Detection Backend")
    print("Sri Siddhartha Institute of Technology (SSIT) M.Tech Thesis")
    print("FastAPI listening on http://127.0.0.1:8000")
    print("API Documentation: http://127.0.0.1:8000/docs")
    print("=" * 70)
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    main()
