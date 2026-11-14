"""
Pydantic API Schemas
SSIT M.Tech Academic Research
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PatientRiskInput(BaseModel):
    model_name: Optional[str] = "Logistic Regression"
    age: Optional[float] = Field(65.0, description="Age in years (18-95)")
    hr: Optional[float] = Field(88.0, description="Heart rate in beats per minute (40-180)")
    dbp: Optional[float] = Field(65.0, description="Diastolic blood pressure in mmHg (30-130)")
    rr: Optional[float] = Field(20.0, description="Respiratory rate in breaths per minute (8-50)")
    TIME_FROM_ADM: Optional[float] = Field(12.0, description="Hours elapsed since ICU admission")
    age_normalized: Optional[float] = None
    hr_normalized: Optional[float] = None
    dbp_normalized: Optional[float] = None
    rr_normalized: Optional[float] = None
    time_scaled: Optional[float] = None

class TrainRequest(BaseModel):
    target_column: Optional[str] = "ICU_MORT"
    algorithms: Optional[List[str]] = None
    dataset_name: Optional[str] = None
    random_state: Optional[int] = 42

class ECGAnalysisRequest(BaseModel):
    record_id: Optional[str] = None
    sampling_rate: Optional[int] = 360
    custom_signal: Optional[List[float]] = None
