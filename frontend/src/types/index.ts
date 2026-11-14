export interface ModelMetric {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  sensitivity: number;
  specificity: number;
  f1_score: number;
  roc_auc: number;
  pr_auc: number;
  false_positive_rate: number;
  false_negative_rate: number;
  cdsi_score: number;
  confusion_matrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
    matrix: number[][];
  };
  roc_curve: { fpr: number; tpr: number }[];
  pr_curve: { recall: number; precision: number }[];
  feature_importance?: Record<string, number>;
  loss_curve?: number[];
  model_info?: {
    algorithm: string;
    hyperparameters: Record<string, string>;
  };
}

export interface BestModelSelection {
  best_model_name: string;
  best_model_metrics: ModelMetric;
  selection_criterion: string;
  selection_rationale: string;
  rankings: {
    rank: number;
    model_name: string;
    cdsi_score: number;
    sensitivity: number;
    fnr: number;
    accuracy: number;
    roc_auc: number;
  }[];
}

export interface ModelComparisonResponse {
  dataset_info: any;
  target_evaluated: string;
  train_samples: number;
  val_samples: number;
  test_samples: number;
  features_used: string[];
  feature_selection: {
    feature_names: string[];
    target_correlation: Record<string, number>;
    correlation_matrix: Record<string, Record<string, number>>;
    mutual_information: Record<string, number>;
    random_forest_importance: Record<string, number>;
    rfe_ranking: Record<string, number>;
    composite_scores: Record<string, number>;
    selected_features: string[];
    removed_features: string[];
  };
  model_comparison: ModelMetric[];
  best_model_selection: BestModelSelection;
  timestamp: string;
}

export interface PredictionResult {
  prediction_id: string;
  model_used: string;
  prediction_class: number;
  prediction_label: string;
  risk_score: number;
  risk_percentage: number;
  risk_category: string;
  alert_level: 'GREEN' | 'YELLOW' | 'RED';
  recommendation: string;
  feature_contributions: {
    feature: string;
    value: number;
    unit: string;
    status: string;
    impact: string;
  }[];
  timestamp: string;
  clinical_disclaimer: string;
}

export interface PredictionHistoryItem {
  id: number;
  prediction_id: string;
  timestamp: string;
  model_name: string;
  prediction_class: number;
  prediction_label: string;
  risk_score: number;
  risk_category: string;
  alert_level: string;
  inputs: any[];
  recommendation: string;
}

export interface ECGWaveformPoint {
  time_sec: number;
  raw_voltage: number;
  filtered_voltage: number;
  is_r_peak: number;
}

export interface ECGAnalysisResponse {
  record_id: string;
  label: string;
  condition: string;
  sampling_rate: number;
  snr_db: number;
  total_peaks_detected: number;
  sqi_assessment: {
    kurtosis_sqi: number;
    skewness_sqi: number;
    relative_power_sqi: number;
    quality_grade: string;
  };
  extracted_features: Record<string, any>;
  waveform_data: ECGWaveformPoint[];
}

export interface ECGSampleMeta {
  record_id: string;
  label: string;
  condition: string;
  sampling_rate: number;
  duration_sec: number;
  num_beats: number;
}
