# Early Detection of Cardiac Arrest Using Machine Learning


---

## 1. Project Overview & Medical Restriction Notice

This repository provides an end-to-end, reproducible machine learning system and full-stack clinical decision-support web application designed to detect patterns associated with acute cardiac deterioration and elevated clinical risk.

> [!IMPORTANT]
> **MANDATORY CLINICAL SAFETY & DATASET DECLARATION:**  
> In accordance with medical ethics and PhysioNet dataset documentation, the primary eICU cohort represents intensive care unit (ICU) patients at risk for cardiac arrest, with documented outcomes of **ICU Mortality (`ICU_MORT`)**, **In-Hospital Mortality (`HOSP_MORT`)**, and **Acute Myocardial Infarction (`MI`)**.  
> The dataset does **not** provide an isolated timestamped cardiac arrest event label. Therefore, all models are explicitly evaluated and presented as **Cardiac Risk & Physiological Deterioration Early-Warning Systems**.  
> This system is an academic research prototype and is **not intended to replace formal physician diagnosis or emergency medical intervention**.

---

## 2. Key Features

1. **Biomedical Signal Processing:**
   - Zero-phase Butterworth bandpass filter (0.5 – 40 Hz, Order 3) for baseline and high-frequency noise removal.
   - 50 Hz IIR notch filter for powerline hum elimination.
   - Two-stage median filtering for respiratory baseline wander suppression.
   - Adaptive Pan-Tompkins QRS and R-peak detection.
   - Time-domain and Frequency-domain HRV extraction (SDNN, RMSSD, pNN50, LF, HF, LF/HF ratio).
   - Signal Quality Index (kSQI, sSQI, pSQI) assessment.

2. **Leak-Free Preprocessing & Feature Selection:**
   - 2.5× IQR outlier winsorization and median imputation fit **strictly on training partitions**.
   - Multi-method consensus feature selection combining Pearson correlation, Mutual Information, Recursive Feature Elimination (RFE), and Random Forest Gini impurity.

3. **All Six Synopsis Machine Learning Algorithms:**
   - Logistic Regression (Balanced class weights, L-BFGS solver)
   - Decision Tree (Gini impurity, optimized depth)
   - Random Forest (100 estimators, out-of-bag scoring)
   - Support Vector Machine (RBF kernel, Platt probability calibration)
   - K-Nearest Neighbors (Euclidean metric, $k=7$)
   - Artificial Neural Network (Feedforward MLP with early stopping)
   - **Plus 1D-CNN (PyTorch):** Deep convolutional neural network for ECG heartbeat classification.

4. **Clinical Decision Support Index (CDSI):**
   - Implements a safety-prioritized evaluation index:
     $$\text{CDSI} = 0.40 \times \text{Sensitivity} + 0.25 \times \text{PR-AUC} + 0.20 \times \text{ROC-AUC} + 0.15 \times \text{Specificity} - 0.10 \times \text{FNR}$$
   - Penalizes False Negatives (missed dying patients) over raw accuracy.

5. **Full-Stack Healthcare Dashboard (React + TypeScript + Tailwind):**
   - **Page 1: Home Dashboard:** KPI cards, optimal model banner, risk distributions.
   - **Page 2: Dataset Explorer:** Partition preview, missing-value profile, DUA credential guidelines.
   - **Page 3: ECG Signal Analysis:** Interactive dual-waveform viewer (raw vs Butterworth filtered) with R-peak markers and SQI grade.
   - **Page 4: Patient Risk Assessment:** Real-time risk calculator with quick clinical scenario presets (Stable, Septic Shock, Elderly).
   - **Page 5: Model Training:** Live training interface with target selection and real-time backend execution.
   - **Page 6: Model Performance:** Full 11-metric comparison table, interactive ROC/PR curves, and confusion matrix inspector.
   - **Page 7: Prediction History:** SQLite audit log with timestamps and alert levels.
   - **Page 8: Reports & Downloads:** Downloadable 1.33 MB publication-ready PDF research report, CSV evaluation tables, and academic references.

---

## 3. Actual Experimental Evaluation Results

Evaluated on an independent, holdout test partition of **1,000 patients** (Target: `ICU_MORT`):

| Algorithm | Accuracy | Sensitivity (Recall) | Specificity | Precision | F1-Score | ROC-AUC | PR-AUC | False Neg. Rate | CDSI Score | Rank |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | **0.713** | **0.701 (70.1%)** | **0.716** | 0.402 | **0.511** | **0.796** | **0.543** | **0.299 (29.9%)** | **0.653** | **1** |
| **Support Vector Machine** | 0.718 | 0.701 (70.1%) | 0.723 | 0.408 | 0.516 | 0.790 | 0.463 | 0.299 (29.9%) | 0.633 | 2 |
| **Random Forest** | 0.716 | 0.636 (63.6%) | 0.738 | 0.398 | 0.489 | 0.791 | 0.541 | 0.365 (36.5%) | 0.622 | 3 |
| **Decision Tree** | 0.735 | 0.608 (60.8%) | 0.770 | 0.418 | 0.495 | 0.770 | 0.484 | 0.393 (39.3%) | 0.594 | 4 |
| **Artificial Neural Network** | **0.818** | 0.290 (29.0%) | 0.962 | 0.674 | 0.405 | 0.799 | 0.543 | **0.710 (71.0%)** | 0.485 | 5 |
| **K-Nearest Neighbors** | 0.785 | 0.299 (29.9%) | 0.917 | 0.496 | 0.373 | 0.720 | 0.433 | 0.701 (70.1%) | 0.439 | 6 |
| **1D-CNN (ECG Waveform)** | **0.950** | **0.722 (72.2%)** | **1.000** | **1.000** | **0.839** | **0.990** | **0.959** | **0.278 (27.8%)** | **0.849** | Patient Holdout |

*Key Clinical Insight:* While the ANN achieved the highest raw accuracy (81.8%), its 71.0% False Negative Rate missed 76 dying patients. Balanced Logistic Regression is selected as the safest clinical early-warning model under CDSI.

---

## 4. Project Structure

```
cardiac-arrest-detection/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entry point
│   │   ├── api/                        # REST endpoints (datasets, models, predict, ecg, reports)
│   │   ├── database/db.py              # SQLite audit and metadata engine
│   │   ├── schemas/schemas.py          # Pydantic input/output schemas
│   │   └── services/report_service.py  # ReportLab PDF generator
│   ├── ml/
│   │   ├── data_acquisition.py         # PhysioNet DUA & cohort generator
│   │   ├── preprocessing.py            # Leak-free scaler & winsorization
│   │   ├── ecg_processing.py           # Butterworth, Notch & Pan-Tompkins QRS
│   │   ├── feature_extraction.py       # Time & Frequency domain HRV, QRS morphology
│   │   ├── feature_selection.py        # Pearson, Mutual Info, RFE, RF Gini
│   │   ├── train.py                    # All 6 synopsis models + 1D-CNN
│   │   ├── evaluate.py                 # 11 clinical metrics & CDSI calculator
│   │   └── predict.py                  # Real-time risk scoring engine
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/                 # Navbar, Sidebar, StatCard, Recharts curves
│   │   ├── pages/                      # 8 full dashboard pages
│   │   ├── services/api.ts             # Backend REST client
│   │   ├── types/index.ts              # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── data/
│   ├── raw/                            # Place genuine PhysioNet eICU/MIMIC files here
│   ├── demo/                           # Benchmark clinical cohorts (10,000 patients)
│   └── metadata.db                     # SQLite prediction audit database
├── saved_models/                       # Trained .joblib and PyTorch .pt weights
├── results/
│   ├── metrics/                        # model_comparison.csv & .json
│   ├── graphs/                         # High-res publication plots (ROC, PR, bar charts)
│   ├── confusion_matrices/             # Multi-model confusion matrix heatmaps
│   └── reports/                        # Early_Cardiac_Arrest_Detection_Research_Report.pdf
├── docs/
│   ├── RESEARCH_REPORT.md              # 23-section comprehensive thesis paper
│   ├── SYSTEM_ARCHITECTURE.md          # 5 Mermaid workflow diagrams
│   └── CLINICAL_SAFETY_DECLARATION.md  # Medical boundary declarations
├── tests/
│   └── test_pipeline.py                # Automated unit & integration tests
└── scripts/
    ├── run_full_pipeline.py            # End-to-end ML training & figure generation
    ├── generate_research_pdf.py        # ReportLab PDF compiler
    └── start_backend.py                # Uvicorn FastAPI launcher
```

---

## 5. Installation & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Clone / Navigate to Workspace
```bash
cd C:\Users\91990\.gemini\antigravity\scratch\cardiac-arrest-detection
```

### Step 2: Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 3: Run the Machine Learning Pipeline (Generates Models & Plots)
```bash
python scripts/run_full_pipeline.py
```

### Step 4: Run Automated Tests
```bash
python tests/test_pipeline.py
```

### Step 5: Start the Backend Server (FastAPI)
```bash
python scripts/start_backend.py
```
*Backend runs on:* `http://127.0.0.1:8000`  
*Interactive Swagger API Documentation:* `http://127.0.0.1:8000/docs`

### Step 6: Start the Frontend Application (React + Vite)
In a separate terminal:
```bash
cd frontend
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 6. Academic References (SSIT Synopsis)
1. Parameswari S., Jeevitha S. et al., *Technology and Health Care*, 2025.
2. Shah A., Ahirrao S., Pandya S. et al., *Frontiers in Public Health*, 2021.
3. Cheni S., Pottendla J., *IJSRCSEIT*, 2025.
4. Kumar Narayanan et al., *European Heart Journal / Times of India*, 2025.
5. J. Sivaraman et al., *Times of India*, 2025.
6. Jaslok & KEM Hospital Research Team, *Times of India*, 2025.
7. G. Divya, M. Naga Sravan Kumar et al., *arXiv*, 2024.
8. Mehroush Banday, Sherin Zafar et al., *arXiv*, 2024.
9. Atit Pokharel, Shashank Dahal et al., *arXiv*, 2024.
10. M. Khurram Umair et al., *Scientific Reports*, 2026.
