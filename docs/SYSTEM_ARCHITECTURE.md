# System Architecture & Workflows
## Early Detection of Cardiac Arrest & Physiological Deterioration
### Sri Siddhartha Institute of Technology (SSIT) • M.Tech Computer Science and Engineering

---

## 1. Overall System Architecture

```mermaid
graph TD
    subgraph Data_Layer ["Data Ingestion & Benchmark Layer"]
        D1["PhysioNet eICU Cardiac Risk Dataset (CSV)"]
        D2["MIMIC-IV-Ext-MDS-ED (Multimodal ED)"]
        D3["MIT-BIH Arrhythmia Database (360 Hz ECG)"]
        D4["Benchmark Cohort Generator (Fallback/Demo)"]
    end

    subgraph Preprocessing_Layer ["Conditioning & Leak-Free Preprocessing"]
        P1["Missing Value Imputation (Train Median)"]
        P2["Outlier Winsorization (IQR Bounds)"]
        P3["StandardScaler / Normalization"]
        P4["Butterworth Bandpass Filter (0.5 - 40 Hz)"]
        P5["Notch Filter (50 Hz) & Baseline Wander Removal"]
        P6["Pan-Tompkins Adaptive QRS Detection"]
    end

    subgraph Feature_Layer ["Feature Extraction & Selection"]
        F1["HRV Features: SDNN, RMSSD, pNN50"]
        F2["Spectral HRV: LF, HF, LF/HF Ratio"]
        F3["ECG Morphology: QRS Width, Amplitude, Entropy"]
        F4["Physiological Vitals: HR, DBP, RR, Age, Adm_Time"]
        F5["Feature Selection: Mutual Info, RFE, Pearson, RF Importance"]
    end

    subgraph ML_Model_Layer ["Synopsis Machine Learning Algorithms"]
        M1["Logistic Regression (Balanced, L-BFGS)"]
        M2["Decision Tree (Gini Impurity, Depth Optimized)"]
        M3["Random Forest (100 Trees, OOB Analysis)"]
        M4["Support Vector Machine (RBF Kernel, Calibrated)"]
        M5["K-Nearest Neighbors (Euclidean Distance, k=7)"]
        M6["Artificial Neural Network (Feedforward MLP)"]
        M7["1D-CNN (PyTorch ECG Waveform Classifier)"]
    end

    subgraph Clinical_Decision_Layer ["Evaluation & Decision Support"]
        E1["Clinical Metrics: Sensitivity, Specificity, ROC-AUC, PR-AUC"]
        E2["False Negative Rate (FNR) Safety Guard"]
        E3["Clinical Decision Support Index (CDSI) Ranking"]
        E4["Risk Stratification: Low, Moderate, High Alert"]
    end

    subgraph Application_Layer ["Presentation & API Layer"]
        A1["FastAPI Backend (REST Endpoints)"]
        A2["SQLite Metadata & Prediction Audit DB"]
        A3["React 19 + TypeScript + Tailwind Web Application"]
        A4["ReportLab PDF & CSV Deliverable Generator"]
    end

    D1 --> P1
    D2 --> P1
    D3 --> P4
    D4 --> P1
    D4 --> P4

    P1 --> P2 --> P3 --> F4
    P4 --> P5 --> P6 --> F1 & F2 & F3

    F1 & F2 & F3 & F4 --> F5
    F5 --> M1 & M2 & M3 & M4 & M5 & M6
    P6 --> M7

    M1 & M2 & M3 & M4 & M5 & M6 & M7 --> E1 --> E2 --> E3 --> E4
    E4 --> A1
    A1 <--> A2
    A1 <--> A3
    A1 --> A4
```

---

## 2. Data Acquisition & Validation Flowchart

```mermaid
flowchart TD
    Start(["Start Dataset Ingestion"]) --> CheckRaw{"Check data/raw/ Files"}
    CheckRaw -->|Found Genuine PhysioNet File| ReadRaw["Read eICU_cardiacArrest_physionet.csv"]
    CheckRaw -->|Missing / DUA Restricted| PromptDUA["Display Credentialing & DUA Instructions"]
    PromptDUA --> LoadBench["Load Verified Clinical Benchmark Cohort"]
    ReadRaw --> ValidateSchema["Validate Column Schemas & Missingness"]
    LoadBench --> ValidateSchema
    ValidateSchema --> CheckPartitions{"Verify Train/Val/Test Splits"}
    CheckPartitions -->|80/10/10 Isolated| StoreMeta["Record Dataset Quality Metadata"]
    CheckPartitions -->|Mixed / Unsplit| StratifySplit["Apply Patient-Level Stratified Partitioning"]
    StratifySplit --> StoreMeta
    StoreMeta --> End(["Dataset Ready for Preprocessing"])
```

---

## 3. ECG Signal Processing Workflow

```mermaid
flowchart LR
    RawECG["Raw ECG Signal (360 Hz)"] --> Notch["50 Hz IIR Notch Filter<br/>(Powerline Removal)"]
    Notch --> Bandpass["Butterworth Bandpass<br/>(0.5 - 40 Hz, Order 3)"]
    Bandpass --> Baseline["Two-Stage Median Filter<br/>(Baseline Wander Suppression)"]
    Baseline --> PanTompkins["Adaptive QRS Detection<br/>(Derivative + Squaring + Window)"]
    PanTompkins --> RPeaks["Refined R-Peak Coordinates"]
    RPeaks --> BeatSeg["Beat Segmentation<br/>(-250ms to +400ms Window)"]
    RPeaks --> HRV["Time & Frequency HRV Extraction<br/>(SDNN, RMSSD, LF/HF)"]
    Baseline --> SQI["Signal Quality Index Assessment<br/>(kSQI, sSQI, pSQI)"]
```

---

## 4. Feature Selection Protocol (Leak-Free)

```mermaid
flowchart TD
    TrainSplit["X_train, y_train Only (8,000 Patients)"] --> Corr["Pearson Correlation Matrix<br/>with Target Outcome"]
    TrainSplit --> MI["Mutual Information Scoring<br/>(Nonlinear Dependency)"]
    TrainSplit --> RFE["Recursive Feature Elimination<br/>(RFE via Estimator)"]
    TrainSplit --> RF["Random Forest Gini Impurity<br/>(Feature Importance)"]
    Corr & MI & RFE & RF --> Composite["Composite Ranking Formulation<br/>Score = 0.25*Corr + 0.25*MI + 0.25*RF + 0.25*(1/RFE)"]
    Composite --> Select["Select Top Informative Features"]
    Select --> ValTest["Apply Identical Subsets to Val & Test Partitions"]
```

---

## 5. Model Evaluation and Clinical Decision Support Index (CDSI)

```mermaid
flowchart TD
    Predictions["Model Test Predictions & Probabilities"] --> Metrics["Compute Basic Rates:<br/>Accuracy, Precision, Recall, Specificity"]
    Predictions --> Curves["Compute Curves:<br/>ROC-AUC, Precision-Recall AUC"]
    Metrics & Curves --> Errors["Error Breakdown:<br/>False Positive Rate (FPR), False Negative Rate (FNR)"]
    Errors --> CDSI_Calc["Calculate Clinical Decision Support Index (CDSI):<br/>CDSI = 0.40*Sensitivity + 0.25*PR_AUC + 0.20*ROC_AUC + 0.15*Specificity - 0.10*FNR"]
    CDSI_Calc --> Rank["Rank Algorithms & Select Optimal Early Warning Model"]
    Rank --> Alert["Assign Calibrated Risk Categories:<br/>Low Risk (&lt;30%), Moderate Risk (30-65%), High Risk (&gt;=65%)"]
```
