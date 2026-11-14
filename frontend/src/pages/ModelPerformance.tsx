import React, { useState } from 'react';
import {
  BarChart3,
  Award,
  Layers,
  LineChart as LineChartIcon,
  HelpCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { ModelComparisonResponse, ModelMetric } from '../types';
import { ROCCurveChart } from '../components/ROCCurveChart';
import { PRCurveChart } from '../components/PRCurveChart';
import { ConfusionMatrixChart } from '../components/ConfusionMatrixChart';
import { FeatureImportanceChart } from '../components/FeatureImportanceChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ModelPerformanceProps {
  modelData: ModelComparisonResponse | null;
}

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({ modelData }) => {
  const [selectedConfusionModel, setSelectedConfusionModel] = useState<string>('Logistic Regression');

  const models = modelData?.model_comparison || [];
  const best = modelData?.best_model_selection;
  const currentModelForCM = models.find((m) => m.model_name === selectedConfusionModel) || models[0];

  // Grouped comparison data for chart
  const groupedData = models.map((m) => ({
    name: m.model_name,
    Accuracy: +(m.accuracy * 100).toFixed(1),
    Sensitivity: +(m.sensitivity * 100).toFixed(1),
    Specificity: +(m.specificity * 100).toFixed(1),
    F1: +(m.f1_score * 100).toFixed(1),
  }));

  // ANN Loss curve data
  const annModel = models.find((m) => m.model_name === 'Artificial Neural Network');
  const lossData = (annModel?.loss_curve || []).map((loss, idx) => ({
    iteration: idx + 1,
    loss: loss,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-bold text-slate-900">Comprehensive Model Performance & Diagnostics</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Test-partition evaluation across all 6 synopsis algorithms: ROC-AUC, PR-AUC, Confusion Matrices, and Error Analysis
            </p>
          </div>

          <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-800">
            <Award className="w-4 h-4 text-sky-600" />
            <span>Optimal: {best?.best_model_name} (CDSI: {best?.best_model_metrics?.cdsi_score})</span>
          </div>
        </div>
      </div>

      {/* Comprehensive Metric Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800">Complete Clinical Evaluation Table (11 Metrics)</h3>
          <p className="text-xs text-slate-500">Evaluated on 1,000 holdout test patients (eICU cohort)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Sensitivity</th>
                <th className="py-2.5 px-3">Specificity</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3">ROC-AUC</th>
                <th className="py-2.5 px-3">PR-AUC</th>
                <th className="py-2.5 px-3 text-amber-700">FPR</th>
                <th className="py-2.5 px-3 text-rose-700">FNR</th>
                <th className="py-2.5 px-3 font-bold text-sky-700">CDSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {models.map((m) => {
                const isBest = m.model_name === best?.best_model_name;
                return (
                  <tr
                    key={m.model_name}
                    className={isBest ? 'bg-sky-50/70 font-semibold' : 'hover:bg-slate-50/50'}
                  >
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      {isBest && <Award className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                      <span className="text-slate-900">{m.model_name}</span>
                    </td>
                    <td className="py-2.5 px-3">{(m.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-semibold">{(m.sensitivity * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-slate-700">{(m.specificity * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3">{(m.precision * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3">{m.f1_score.toFixed(3)}</td>
                    <td className="py-2.5 px-3">{m.roc_auc.toFixed(3)}</td>
                    <td className="py-2.5 px-3">{m.pr_auc.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-amber-700">{(m.false_positive_rate * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-rose-700 font-semibold">{(m.false_negative_rate * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 font-extrabold text-sky-700">{m.cdsi_score.toFixed(3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grouped Comparison Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800">Grouped Metrics Comparison (%)</h3>
          <p className="text-xs text-slate-500">Cross-algorithm comparison of Accuracy, Sensitivity, Specificity, and F1</p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupedData} margin={{ top: 10, right: 30, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11 }} />
              <Tooltip formatter={(val) => `${val}%`} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Accuracy" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Sensitivity" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Specificity" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Curves: ROC and PR Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ROCCurveChart models={models} />
        <PRCurveChart models={models} />
      </div>

      {/* Confusion Matrix Viewer & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Confusion Matrix Inspector</h3>
            <select
              value={selectedConfusionModel}
              onChange={(e) => setSelectedConfusionModel(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              {models.map((m) => (
                <option key={m.model_name} value={m.model_name}>
                  {m.model_name}
                </option>
              ))}
            </select>
          </div>

          {currentModelForCM && (
            <ConfusionMatrixChart
              modelName={currentModelForCM.model_name}
              matrix={currentModelForCM.confusion_matrix}
              sensitivity={currentModelForCM.sensitivity}
              specificity={currentModelForCM.specificity}
            />
          )}
        </div>

        {/* Feature Importance */}
        <FeatureImportanceChart
          importance={modelData?.feature_selection?.random_forest_importance || {}}
        />
      </div>
    </div>
  );
};
