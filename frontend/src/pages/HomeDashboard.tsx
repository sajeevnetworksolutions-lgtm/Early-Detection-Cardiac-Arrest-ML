import React from 'react';
import {
  Activity,
  Database,
  Award,
  AlertTriangle,
  HeartPulse,
  BrainCircuit,
  FileText,
  TrendingUp,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ModelComparisonResponse } from '../types';
import { PageId } from '../components/Sidebar';

interface HomeDashboardProps {
  modelData: ModelComparisonResponse | null;
  datasetSummary: any;
  onNavigate: (page: PageId) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  modelData,
  datasetSummary,
  onNavigate,
}) => {
  const best = modelData?.best_model_selection;
  const bestMetrics = best?.best_model_metrics;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 text-xs font-semibold px-3 py-1 rounded-full border border-sky-400/30 mb-3">
            <span>Sri Siddhartha Institute of Technology</span>
            <span>•</span>
            <span>M.Tech Thesis Project</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Early Detection of Cardiac Arrest Using Machine Learning
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Multi-parametric clinical decision-support framework integrating physiological time-series data
            (PhysioNet eICU Cardiac Risk Cohort) and biomedical ECG signal conditioning (MIT-BIH Arrhythmia Database).
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => onNavigate('predict')}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Assess Patient Risk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigate('ecg')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all border border-slate-700"
            >
              <Activity className="w-4 h-4" />
              <span>Inspect ECG Signals</span>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all border border-slate-700"
            >
              <FileText className="w-4 h-4" />
              <span>Download Research PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cohort Records"
          value={datasetSummary?.total_records?.toLocaleString() || '10,000'}
          subtitle="eICU Cardiac Risk Partition"
          icon={Database}
          badge="Verified"
          badgeColor="teal"
        />

        <StatCard
          title="Best Model (CDSI)"
          value={best?.best_model_name || 'Logistic Regression'}
          subtitle={`Score: ${bestMetrics?.cdsi_score?.toFixed(3) || '0.653'}`}
          icon={Award}
          badge="Rank 1"
          badgeColor="sky"
        />

        <StatCard
          title="Sensitivity (Recall)"
          value={`${((bestMetrics?.sensitivity || 0.701) * 100).toFixed(1)}%`}
          subtitle="True Positive Detection Rate"
          icon={TrendingUp}
          badge="High Priority"
          badgeColor="emerald"
        />

        <StatCard
          title="False Negative Rate"
          value={`${((bestMetrics?.false_negative_rate || 0.299) * 100).toFixed(1)}%`}
          subtitle="Minimized Missed-Risk Cases"
          icon={AlertTriangle}
          badge="Safety Guard"
          badgeColor="rose"
        />
      </div>

      {/* Grid: Synopsis Algorithms Leaderboard & Clinical Disclaimer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Synopsis Algorithm Performance Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Evaluated on independent 1,000-patient test set (Target: ICU Mortality / Acute Deterioration)
              </p>
            </div>
            <button
              onClick={() => onNavigate('performance')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Sensitivity</th>
                  <th className="py-2.5 px-3">Specificity</th>
                  <th className="py-2.5 px-3">ROC-AUC</th>
                  <th className="py-2.5 px-3">CDSI Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modelData?.model_comparison?.map((m) => {
                  const isBest = m.model_name === best?.best_model_name;
                  return (
                    <tr
                      key={m.model_name}
                      className={isBest ? 'bg-sky-50/60 font-semibold' : 'hover:bg-slate-50/50'}
                    >
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        {isBest && <Award className="w-3.5 h-3.5 text-sky-600" />}
                        <span className="text-slate-900">{m.model_name}</span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {(m.accuracy * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 font-medium text-emerald-700">
                        {(m.sensitivity * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {(m.specificity * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {m.roc_auc.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-sky-700">
                        {m.cdsi_score.toFixed(3)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Rationale Box */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sky-800 font-bold text-sm mb-2">
              <BrainCircuit className="w-4 h-4 text-sky-600" />
              <span>Academic Model Selection Rationale</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Why not select based purely on accuracy?
            </p>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="font-semibold text-rose-700">The False Negative Hazard:</span>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  ANN achieved 81.8% accuracy, but missed 71.0% of deteriorating patients. In emergency medicine,
                  a missed case leads to unmonitored cardiac arrest.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="font-semibold text-emerald-700">The CDSI Formulation:</span>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Weights: 40% Sensitivity + 25% PR-AUC + 20% ROC-AUC + 15% Specificity - 10% FNR.
                  Guarantees patient safety priority.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Primary Reference: eICU v2.0</span>
            <span className="text-teal-600 font-semibold">DUA / PhysioNet</span>
          </div>
        </div>
      </div>
    </div>
  );
};
