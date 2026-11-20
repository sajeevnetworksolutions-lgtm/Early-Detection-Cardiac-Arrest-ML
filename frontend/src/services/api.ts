import {
  ModelComparisonResponse,
  PredictionResult,
  PredictionHistoryItem,
  ECGAnalysisResponse,
  ECGSampleMeta
} from '../types';

const BASE_URL = '/api';

export const api = {
  // Datasets
  async getDatasetStatus(): Promise<any> {
    const res = await fetch(`${BASE_URL}/datasets`);
    if (!res.ok) throw new Error('Failed to fetch dataset status');
    return res.json();
  },

  async getDatasetSummary(): Promise<any> {
    const res = await fetch(`${BASE_URL}/datasets/summary`);
    if (!res.ok) throw new Error('Failed to fetch dataset summary');
    return res.json();
  },

  async uploadDataset(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Dataset upload failed');
    return res.json();
  },

  // Models & Performance
  async getModelComparison(): Promise<ModelComparisonResponse> {
    const res = await fetch(`${BASE_URL}/models`);
    if (!res.ok) throw new Error('Failed to fetch model comparison');
    return res.json();
  },

  async trainModels(targetColumn: string = 'ICU_MORT'): Promise<any> {
    const res = await fetch(`${BASE_URL}/models/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_column: targetColumn }),
    });
    if (!res.ok) throw new Error('Training request failed');
    return res.json();
  },

  // Prediction & Risk Assessment
  async predictRisk(input: {
    model_name: string;
    age: number;
    hr: number;
    dbp: number;
    rr: number;
    TIME_FROM_ADM: number;
  }): Promise<PredictionResult> {
    const res = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Inference request failed');
    return res.json();
  },

  async getPredictionHistory(): Promise<PredictionHistoryItem[]> {
    const res = await fetch(`${BASE_URL}/predictions`);
    if (!res.ok) throw new Error('Failed to fetch prediction history');
    return res.json();
  },

  // ECG Processing
  async getECGSamples(): Promise<{ total_records: number; records: ECGSampleMeta[] }> {
    const res = await fetch(`${BASE_URL}/ecg/samples`);
    if (!res.ok) throw new Error('Failed to fetch ECG samples');
    return res.json();
  },

  async analyzeECG(recordId: string): Promise<ECGAnalysisResponse> {
    const res = await fetch(`${BASE_URL}/ecg/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record_id: recordId }),
    });
    if (!res.ok) throw new Error('ECG signal analysis failed');
    return res.json();
  },

  // Reports
  async getFeatureDictionary(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/reports/feature-dictionary`);
    if (!res.ok) throw new Error('Failed to fetch feature dictionary');
    return res.json();
  },

  getReportPdfUrl(): string {
    return `${BASE_URL}/reports/pdf`;
  },

  getPresentationPptxUrl(): string {
    return `${BASE_URL}/reports/pptx`;
  },

  getComparisonCsvUrl(): string {
    return `${BASE_URL}/reports/csv`;
  },

  async checkHealth(): Promise<any> {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  }
};
