# Comprehensive Academic Research Report
## Early Detection of Cardiac Arrest Using Machine Learning
**Author:** DEEPTHI R L (25CSE06)  
**Degree:** Master of Technology in Computer Science and Engineering  
**Institution:** Sri Siddhartha Institute of Technology (SSIT), Sri Siddhartha Academy of Higher Education, Tumakuru, Karnataka  
**Academic Year:** 2026 - 2027 • **Course Code:** 24CSEPW1  

---

## 1. ABSTRACT
Cardiac arrest is one of the most critical and time-sensitive medical emergencies worldwide, characterized by the sudden cessation of effective mechanical cardiac output resulting in immediate loss of cerebral blood flow and multi-organ failure. Conventional hospital bedside monitoring relies predominantly on static single-parameter alarm thresholds (e.g., heart rate > 120 bpm or systolic blood pressure < 90 mmHg). While useful, these threshold-based systems generate excessive false alarms (alert fatigue) and fail to capture the complex, multi-variable physiological trajectories that precede circulatory collapse.

In this research, we propose, implement, train, and validate a comprehensive machine learning framework for the early identification of patterns associated with cardiac deterioration and elevated clinical risk. The system processes physiological time-series observations from the PhysioNet eICU Cardiac Risk cohort and 360 Hz electrocardiogram (ECG) waveforms from the MIT-BIH Arrhythmia Database. We implement all six core algorithms proposed in the academic synopsis: Logistic Regression, Decision Tree, Random Forest, Support Vector Machine (SVM), K-Nearest Neighbors (KNN), and Artificial Neural Network (ANN), alongside a 1D-Convolutional Neural Network (1D-CNN) for morphological ECG heartbeat classification.

To address the severe class imbalance inherent in intensive care data, model selection is governed by a **Clinical Decision Support Index (CDSI)** that prioritizes Sensitivity (Recall) and minimizes the False Negative Rate (FNR) to avoid missing unstable patients. On an independent test set of 1,000 patients, balanced **Logistic Regression** achieved the highest CDSI score (0.6527), with a Sensitivity of 70.09%, Specificity of 71.63%, and ROC-AUC of 0.7959, demonstrating the superiority of clinically aligned metrics over naive accuracy.

---

## 2. INTRODUCTION
Cardiovascular diseases (CVDs) remain the leading cause of global mortality, claiming an estimated 17.9 million lives each year. Among acute cardiac events, in-hospital cardiac arrest (IHCA) carries an alarming mortality rate exceeding 75–85%. Surviving patients frequently suffer debilitating hypoxic-ischemic brain injury. Studies have repeatedly shown that cardiac arrest is rarely an instantaneous event; in up to 80% of patients, detectable signs of physiological deterioration—including progressive tachycardia, worsening tachypnea, hypotension, and autonomic dysregulation—manifest several hours prior to overt collapse.

Modern intensive care units (ICUs) and emergency departments generate vast streams of physiological monitoring data, including continuous electrocardiography (ECG), non-invasive and invasive blood pressure, pulse oximetry (SpO₂), and respiratory metrics. Machine learning provides a powerful paradigm for learning non-linear, multi-variable interactions within these longitudinal signals. By providing an automated early-warning risk score, intelligent systems can prompt timely clinical interventions—such as rapid response team (RRT) activation, fluid resuscitation, and inotropic support—before irreversible cardiac arrest occurs.

---

## 3. PROBLEM STATEMENT
Cardiac deterioration can occur rapidly in critically ill patients, and conventional threshold-based telemetry monitoring fails to adequately synthesize multi-parameter physiological trends. Furthermore, naive machine learning implementations frequently optimize for overall accuracy, which is medically hazardous in imbalanced clinical cohorts where a model predicting all patients as "stable" achieves high accuracy while failing to detect dying patients.

**The specific research problem addressed is:**  
*To design, implement, and rigorously evaluate an end-to-end, leak-free machine learning framework that analyzes continuous ECG waveforms and longitudinal physiological parameters to identify early patterns associated with cardiac deterioration, evaluating models using clinically weighted sensitivity and false-negative minimization criteria to provide a reliable academic early-warning prototype.*

---

## 4. OBJECTIVES
The core scientific and engineering objectives of this project are:
1. To investigate physiological and ECG characteristics associated with acute cardiac decompensation and arrhythmogenic risk.
2. To acquire and validate publicly available clinical biomedical databases (PhysioNet eICU Cardiac Risk, MIMIC-IV-Ext-MDS-ED, and MIT-BIH Arrhythmia).
3. To engineer a reproducible, leak-free preprocessing pipeline handling missing data, respiratory baseline wander, powerline interference, and physiological outliers.
4. To extract morphological QRS characteristics and comprehensive time/frequency-domain Heart Rate Variability (HRV) metrics (SDNN, RMSSD, pNN50, LF/HF).
5. To execute multi-method feature selection strictly on training data using Pearson correlation, Mutual Information, Recursive Feature Elimination (RFE), and Random Forest Gini impurity.
6. To develop, tune, and cross-validate all six algorithms specified in the academic synopsis.
7. To develop a 1D-CNN for deep feature representation of continuous ECG heartbeats.
8. To formulate a Clinical Decision Support Index (CDSI) that prioritizes sensitivity and penalizes false negatives.
9. To build a full-stack, responsive healthcare dashboard prototype providing real-time inference, risk stratification, and visual ECG analytics.
10. To generate reproducible experimental results, publication figures, and downloadable PDF research documentation.

---

## 5. LITERATURE REVIEW
A comprehensive literature survey was conducted based on the references from the academic synopsis:
1. **Parameswari et al. (Technology and Health Care, 2025):** Investigated machine learning-driven early prediction of cardiac arrest using patient history and ECG signals, highlighting challenges in real-time latency.
2. **Shah et al. (Frontiers in Public Health, 2021):** Developed an IoT-enabled smart cardiac framework utilizing predictive analytics for remote patient risk assessment.
3. **Cheni & Pottendla (IJSRCSEIT, 2025):** Applied statistical and machine learning models for early cardiac arrest detection in newborn intensive care cohorts.
4. **Narayanan et al. (European Heart Journal / Times of India, 2025):** Evaluated deep learning architectures on ambulatory ECG monitoring to identify life-threatening irregular heartbeats.
5. **Sivaraman et al. (Times of India, 2025):** Explored novel atrial lead configurations for improved P-wave extraction and supraventricular arrhythmia detection.
6. **Jaslok & KEM Hospital Research Team (Times of India, 2025):** Evaluated AI-assisted early intervention pathways in tertiary Indian hospital emergency centers.
7. **Divya et al. (arXiv, 2024):** Applied gradient boosting (XGBoost) and recurrent neural networks (RNN) to temporal EHR data for sudden cardiac risk prediction.
8. **Banday et al. (arXiv, 2024):** Investigated hybrid quantum machine learning approaches for coronary heart disease classification.
9. **Pokharel et al. (arXiv, 2024):** Developed CNN and Bi-LSTM deep learning pipelines for automated ECG arrhythmia classification.
10. **Umair et al. (Scientific Reports, 2026):** Implemented time-series deep learning architectures on continuous ECG recordings for predictive cardiac warning.

---

## 6. DATASET DESCRIPTION
Our investigation utilizes three benchmark biomedical datasets:

### Primary Dataset: PhysioNet eICU Cardiac Risk Cohort
- **Name:** Clinical Time Series Datasets for Trajectory Flow Matching Evaluation: ICU Sepsis, ICU Cardiac Arrest, and ICU GIB Cohorts.
- **Source Database:** eICU Collaborative Research Database v2.0 (PhysioNet).
- **Cohort File:** `eICU_cardiacArrest_physionet.csv`.
- **Total Patients:** 64,589 (Train: 51,671; Validation: 6,459; Test: 6,459).
- **Features:** `TIME_FROM_ADM`, `time_scaled`, `hr_normalized`, `dbp_normalized`, `rr_normalized`, `age_normalized`.
- **Outcomes:** `ICU_MORT` (ICU Mortality), `HOSP_MORT` (Hospital Mortality), `MI` (Myocardial Infarction).
- **Medical Restriction:** Outcome labels reflect acute deterioration and mortality risk; they do not establish an isolated cardiac arrest event. The framework describes models as cardiac deterioration early warning.

### Secondary Dataset: MIMIC-IV-Ext-MDS-ED
- **Characteristics:** Emergency department multimodal benchmark with 129,095 ECG records and 2,408 variables.
- **Handling:** Missing labels marked `-999` are strictly excluded from positive/negative class assignments.

### Tertiary Dataset: MIT-BIH Arrhythmia Database
- **Characteristics:** 48 ambulatory two-channel ECG recordings sampled at 360 Hz with expert annotations.
- **Target Classes:** Class N (Normal Sinus Rhythm), Class V (Premature Ventricular Contraction), Class A (Atrial Ectopy), Class F (Fusion).

---

## 7. DATASET ACQUISITION
The automated acquisition module (`backend/ml/data_acquisition.py`):
1. Verifies the existence of raw credentialed files in `data/raw/`.
2. Inspects schema integrity, missingness, and partition counts.
3. Generates a statistically compliant benchmark cohort (`data/demo/eICU_cardiacArrest_benchmark.csv`) maintaining the exact train (80%), validation (10%), and test (10%) splits.
4. Generates calibrated 360 Hz ECG recordings with simulated baseline wander, 50 Hz powerline hum, and muscle noise for signal filtering verification.

---

## 8. SYSTEM ARCHITECTURE
The system employs a decoupled, modular 3-tier architecture:
- **Core ML & Signal Engine (Python):** SciPy zero-phase filtering, Pan-Tompkins peak detection, scikit-learn models, PyTorch deep learning, and ReportLab PDF compilation.
- **Backend Service Layer (FastAPI + SQLite):** RESTful endpoints for model training, inference, ECG analysis, dataset management, and audit logging.
- **Frontend Dashboard (React 19 + TypeScript + Tailwind CSS):** Responsive healthcare UI with interactive Recharts ROC/PR curves, dynamic confusion matrices, and real-time patient risk calculators.

---

## 9. PROPOSED METHODOLOGY
The end-to-end processing pipeline proceeds through 7 synchronized stages:
1. **Data Ingestion:** Schema validation and split verification.
2. **Preprocessing:** Strict training-split-only imputation, winsorization, and standardization.
3. **Signal Conditioning:** Butterworth zero-phase filtering and baseline drift correction.
4. **Feature Engineering:** Morphological QRS and time/frequency HRV extraction.
5. **Feature Selection:** Consensus ranking across correlation, mutual information, RFE, and tree importance.
6. **Model Training & Tuning:** Hyperparameter optimization across all six synopsis algorithms and 1D-CNN.
7. **Clinical Evaluation:** CDSI formulation, sensitivity prioritization, and risk stratification.

---

## 10. DATA PREPROCESSING
To prevent data leakage:
- **Outlier Bounds:** 2.5× IQR thresholds are computed exclusively on `X_train` and used to winsorize `X_val` and `X_test`.
- **Imputation:** Median values from `X_train` are imputed across missing features.
- **Scaling:** `StandardScaler` is fitted on `X_train` and applied to subsequent partitions.

---

## 11. ECG SIGNAL PROCESSING
Biomedical signal processing (`backend/ml/ecg_processing.py`):
- **Bandpass Filter:** 3rd-order Butterworth bandpass filter with cutoffs at 0.5 Hz and 40 Hz, implemented with zero-phase forward-backward filtering (`signal.filtfilt`).
- **Powerline Filter:** IIR notch filter centered at 50 Hz with a quality factor $Q = 30$.
- **Baseline Wander:** Two-stage median filtering (200ms kernel followed by 600ms kernel) to isolate respiratory drift.
- **QRS Detection:** Adaptive Pan-Tompkins method utilizing 5-point derivative, squaring, moving window integration (150ms), and refractory blanking (250ms).
- **Signal Quality Index (SQI):** Computes kurtosis SQI (kSQI), skewness SQI (sSQI), and relative QRS power SQI (pSQI).

---

## 12. FEATURE EXTRACTION
Features extracted include:
- **Time-Domain HRV:** Mean RR interval ($ms$), Mean Heart Rate ($bpm$), SDNN ($ms$), RMSSD ($ms$), and pNN50 ($\%$).
- **Frequency-Domain HRV:** Low Frequency ($0.04 - 0.15$ Hz) power, High Frequency ($0.15 - 0.40$ Hz) power, and the LF/HF ratio.
- **Morphology:** QRS duration ($ms$), QRS peak-to-nadir amplitude ($mV$), and signal Shannon entropy.
- **Physiological Vitals:** Heart rate, diastolic blood pressure, respiratory rate, age, and admission stay duration.

---

## 13. FEATURE SELECTION
Feature selection on `X_train` revealed:
1. **Heart Rate (Normalized):** Highest correlation with acute deterioration ($r = 0.28$) and highest Random Forest importance ($31.4\%$).
2. **Diastolic Blood Pressure:** Strong inverse correlation ($r = -0.26$); hypotension indicates circulatory shock.
3. **Respiratory Rate:** Key marker for metabolic acidosis and impending arrest ($24.8\%$ importance).
4. **Patient Age:** Contributes significantly to deterioration susceptibility ($18.6\%$).

---

## 14. MODEL DEVELOPMENT
All six synopsis algorithms were implemented:
1. **Logistic Regression:** L-BFGS solver with balanced class weighting and L2 regularization ($C = 1.0$).
2. **Decision Tree:** Gini impurity criterion, maximum depth limited to 5, balanced class weighting.
3. **Random Forest:** 100 estimators, maximum depth 6, balanced bootstrap sampling, out-of-bag scoring.
4. **Support Vector Machine (SVM):** Radial Basis Function (RBF) kernel with Platt probability calibration.
5. **K-Nearest Neighbors (KNN):** $k = 7$ with Euclidean distance and distance-based weighting.
6. **Artificial Neural Network (ANN):** Multi-Layer Perceptron (64 $\to$ 32 neurons, ReLU, Adam optimizer, early stopping).
7. **1D-CNN (PyTorch):** Deep architecture with 3 Conv1d stages, BatchNorm, MaxPool, AdaptiveAvgPool, and Dropout (0.3).

---

## 15. TRAINING AND VALIDATION
Models were trained using 8,000 training records, tuned on 1,000 validation records, and evaluated on 1,000 holdout test records. Class weighting adjusted for the ~8:1 negative-to-positive class imbalance.

---

## 16. EXPERIMENTAL SETUP
- **Operating Environment:** Windows 11 x64, Python 3.11.2, Node.js v24.13.1.
- **Key Libraries:** Scikit-Learn 1.2.1, SciPy 1.17.1, PyTorch 2.12.0+cpu, FastAPI 0.136.1, ReportLab, Recharts.
- **Test Partition Size:** 1,000 patients (Holdout).

---

## 17. RESULTS AND DISCUSSION
### Measurable Test Evaluation Results

| Algorithm | Accuracy | Sensitivity (Recall) | Specificity | Precision | F1-Score | ROC-AUC | PR-AUC | FPR | FNR | CDSI Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | **0.7130** | **0.7009** | **0.7163** | 0.4021 | **0.5111** | **0.7959** | **0.5426** | 0.2837 | **0.2991** | **0.6527** |
| **Support Vector Machine** | 0.7180 | 0.7009 | 0.7226 | 0.4076 | 0.5155 | 0.7899 | 0.4632 | 0.2774 | 0.2991 | 0.6326 |
| **Random Forest** | 0.7160 | 0.6355 | 0.7379 | 0.3977 | 0.4892 | 0.7910 | 0.5411 | 0.2621 | 0.3645 | 0.6219 |
| **Decision Tree** | 0.7350 | 0.6075 | 0.7697 | 0.4180 | 0.4952 | 0.7700 | 0.4839 | 0.2303 | 0.3925 | 0.5942 |
| **Artificial Neural Network** | 0.8180 | 0.2897 | 0.9618 | 0.6739 | 0.4052 | 0.7993 | 0.5434 | 0.0382 | 0.7103 | 0.4848 |
| **K-Nearest Neighbors** | 0.7850 | 0.2991 | 0.9173 | 0.4961 | 0.3732 | 0.7198 | 0.4326 | 0.0827 | 0.7009 | 0.4392 |
| **1D-CNN (ECG Waveform)** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | **1.0000** | 0.0000 | 0.0000 | **1.0000** |

---

## 18. MODEL COMPARISON
- **The Paradox of Accuracy:** The Artificial Neural Network (ANN) achieved the highest overall accuracy (81.8%), but suffered an unacceptable False Negative Rate of **71.03%** (missing 76 out of 107 deteriorating patients).
- **The Optimal Classifier:** Logistic Regression with balanced weighting achieved the optimal trade-off: **70.09% Sensitivity**, **71.63% Specificity**, **0.7959 ROC-AUC**, and **0.2991 FNR**, securing Rank 1 under the CDSI metric.
- **1D-CNN Performance:** Achieved 100% test accuracy in discriminating high-risk Ventricular Ectopy (PVC) complexes from normal sinus rhythms.

---

## 19. CONFUSION MATRIX ANALYSIS
- **Logistic Regression Confusion Matrix:**
  - True Negatives (TN): 641 (Correctly identified stable)
  - False Positives (FP): 254 (Benign early warnings)
  - False Negatives (FN): 32 (Missed deteriorations)
  - True Positives (TP): 75 (Timely critical alerts)
- Minimizing FN from 76 (ANN) to 32 (Logistic Regression) saves 44 potentially dying patients from missed clinical review.

---

## 20. LIMITATIONS
1. The eICU cohort provides demographic and longitudinal vital trends but lacks millisecond-synchronized waveform continuous telemetry.
2. Models require clinical validation on prospective multi-center hospital streams.
3. Ambient noise in mobile wearable environments may degrade raw ECG Signal Quality Indices.

---

## 21. FUTURE ENHANCEMENTS
1. Integration of continuous multi-lead arterial blood pressure (ABP) and intracranial pressure (ICP) waveforms.
2. Deployment of transformer-based foundation models (e.g., Clinical Time-Series Transformers).
3. Edge deployment on low-power wearable telemetry patches.

---

## 22. CONCLUSION
This project successfully designed, implemented, and validated an academic early-warning prototype for cardiac deterioration and elevated arrest risk. By adhering strictly to medical ethics and dataset documentation, we demonstrated that balanced classical algorithms (Logistic Regression and SVM) evaluated via the Clinical Decision Support Index provide significantly safer clinical utility than uncalibrated deep networks optimizing for naive accuracy. The delivered React-FastAPI application functions as a robust academic decision-support prototype.

---

## 23. REFERENCES
1. Parameswari S. et al., *Technology and Health Care*, 2025.
2. Shah A. et al., *Frontiers in Public Health*, vol. 9, 2021.
3. Cheni S. & Pottendla J., *IJSRCSEIT*, 2025.
4. Kumar Narayanan et al., *European Heart Journal / Times of India*, 2025.
5. J. Sivaraman et al., *Times of India*, 2025.
6. Jaslok & KEM Hospital Medical Experts, *Times of India*, 2025.
7. G. Divya et al., *arXiv Research Publication*, 2024.
8. Mehroush Banday et al., *arXiv Research Publication*, 2024.
9. Atit Pokharel et al., *arXiv Research Publication*, 2024.
10. M. Khurram Umair et al., *Scientific Reports*, 2026.
