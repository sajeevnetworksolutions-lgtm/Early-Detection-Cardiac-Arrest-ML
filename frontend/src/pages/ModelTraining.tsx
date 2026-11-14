import React, { useState } from 'react';
import {
  BrainCircuit,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export const ModelTraining: React.FC = () => {
  const [targetColumn, setTargetColumn] = useState('ICU_MORT');
  const [training, setTraining] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartTraining = async () => {
    setTraining(true);
    setError(null);
    try {
      const res = await api.trainModels(targetColumn);
      setResults(res);
    } catch (err: any) {
      setError(err.message || 'Training failed');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-sky-600" />
          <h2 className="text-xl font-bold text-slate-900">Machine Learning Training & Cross-Validation Hub</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Executes real backend training across all 6 synopsis algorithms with strict partition isolation and CDSI model ranking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configuration Panel (4 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Training Configuration</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Prediction Target
            </label>
            <select
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <option value="ICU_MORT">ICU Mortality (Acute Deterioration Outcome)</option>
              <option value="HOSP_MORT">In-Hospital Mortality Outcome</option>
              <option value="MI">Acute Myocardial Infarction</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              PhysioNet cohort documented outcome field. Preserves clinical validity.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Implemented Synopsis Algorithms (All 6 Included)
            </label>
            <div className="space-y-2 text-xs text-slate-600">
              {[
                'Logistic Regression (L-BFGS, Balanced Class Weight)',
                'Decision Tree (Gini Impurity, Depth Optimized)',
                'Random Forest (100 Trees, Out-of-Bag Analysis)',
                'Support Vector Machine (RBF Kernel, Calibrated)',
                'K-Nearest Neighbors (Euclidean Distance, k=7)',
                'Artificial Neural Network (MLP, Early Stopping)',
              ].map((algo) => (
                <div key={algo} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="text-[11px] font-medium">{algo}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900">
            <div className="font-semibold mb-0.5">Partition Isolation Protocol</div>
            <p className="text-[11px] text-sky-700">
              Transformers (imputation, scaling) and feature selection are fit strictly on training patients. Zero data leakage.
            </p>
          </div>

          <button
            onClick={handleStartTraining}
            disabled={training}
            className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-3 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {training ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Training Models on Backend...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Complete Training Pipeline</span>
              </>
            )}
          </button>
        </div>

        {/* Live Training Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {results ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Training Run Completed Successfully</h4>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                  Target: {results.target}
                </span>
              </div>

              {/* Best Model Banner */}
              <div className="p-4 bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-6 h-6 text-teal-600" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-teal-800">Selected Optimal Classifier</div>
                      <div className="text-base font-bold text-slate-900">{results.best_model}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-teal-700">{results.best_cdsi?.toFixed(3)}</div>
                    <div className="text-[10px] text-teal-600 font-semibold">CDSI Score</div>
                  </div>
                </div>
              </div>

              {/* Trained Models Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-100">
                    <tr>
                      <th className="py-2 px-3">Algorithm</th>
                      <th className="py-2 px-3">Accuracy</th>
                      <th className="py-2 px-3">Sensitivity</th>
                      <th className="py-2 px-3">Specificity</th>
                      <th className="py-2 px-3">ROC-AUC</th>
                      <th className="py-2 px-3">CDSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.model_comparison?.map((m: any) => (
                      <tr key={m.model_name} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-900">{m.model_name}</td>
                        <td className="py-2 px-3">{(m.accuracy * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3 text-emerald-700 font-medium">{(m.sensitivity * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3">{(m.specificity * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3">{m.roc_auc.toFixed(3)}</td>
                        <td className="py-2 px-3 font-bold text-sky-700">{m.cdsi_score.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
                <span>Models saved to: <code>saved_models/</code></span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified & Ready for Inference
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              <Layers className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">Ready to Train</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Select target on the left panel and click Execute to start training all 6 synopsis algorithms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
