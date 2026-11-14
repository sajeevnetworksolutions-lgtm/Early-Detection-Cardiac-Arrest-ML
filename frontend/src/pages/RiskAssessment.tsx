import React, { useState } from 'react';
import {
  HeartPulse,
  Send,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Activity,
  User,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { PredictionResult } from '../types';

export const RiskAssessment: React.FC = () => {
  const [modelName, setModelName] = useState<string>('Logistic Regression');
  const [age, setAge] = useState<number>(68);
  const [hr, setHr] = useState<number>(118);
  const [dbp, setDbp] = useState<number>(54);
  const [rr, setRr] = useState<number>(26);
  const [admHours, setAdmHours] = useState<number>(14);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preset clinical scenarios
  const applyPreset = (preset: 'stable' | 'deteriorating' | 'elderly') => {
    if (preset === 'stable') {
      setAge(52);
      setHr(72);
      setDbp(76);
      setRr(16);
      setAdmHours(8);
    } else if (preset === 'deteriorating') {
      setAge(71);
      setHr(128); // Tachycardia
      setDbp(48);  // Severe Hypotension
      setRr(32);  // Tachypnea
      setAdmHours(22);
    } else if (preset === 'elderly') {
      setAge(84);
      setHr(92);
      setDbp(62);
      setRr(22);
      setAdmHours(48);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.predictRisk({
        model_name: modelName,
        age: Number(age),
        hr: Number(hr),
        dbp: Number(dbp),
        rr: Number(rr),
        TIME_FROM_ADM: Number(admHours),
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-bold text-slate-900">Patient Deterioration Risk Assessment</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time inference using trained ICU models calibrated for acute physiological decompensation
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Scenarios:</span>
            <button
              onClick={() => applyPreset('stable')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
            >
              Normal Vitals
            </button>
            <button
              onClick={() => applyPreset('deteriorating')}
              className="bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors"
            >
              Acute Deterioration
            </button>
            <button
              onClick={() => applyPreset('elderly')}
              className="bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold px-2.5 py-1.5 rounded-lg border border-sky-200 transition-colors"
            >
              Elderly Patient
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
            Physiological Parameters Input
          </h3>

          <form onSubmit={handlePredict} className="space-y-4">
            {/* Algorithm Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Machine Learning Algorithm
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                <option value="Logistic Regression">Logistic Regression (Optimal CDSI)</option>
                <option value="Random Forest">Random Forest Classifier</option>
                <option value="Support Vector Machine">Support Vector Machine (RBF Kernel)</option>
                <option value="Decision Tree">Decision Tree Classifier</option>
                <option value="Artificial Neural Network">Artificial Neural Network (MLP)</option>
                <option value="K-Nearest Neighbors">K-Nearest Neighbors</option>
              </select>
            </div>

            {/* Heart Rate */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Heart Rate (bpm)</span>
                <span className="text-sky-600 font-mono font-bold">{hr} bpm</span>
              </div>
              <input
                type="range"
                min="40"
                max="180"
                value={hr}
                onChange={(e) => setHr(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>40 (Bradycardia)</span>
                <span>Normal: 60-100</span>
                <span>180 (Severe Tachycardia)</span>
              </div>
            </div>

            {/* Diastolic Blood Pressure */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Diastolic Blood Pressure (mmHg)</span>
                <span className="text-sky-600 font-mono font-bold">{dbp} mmHg</span>
              </div>
              <input
                type="range"
                min="30"
                max="130"
                value={dbp}
                onChange={(e) => setDbp(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>30 (Shock / Collapse)</span>
                <span>Normal: 60-90</span>
                <span>130 (Hypertensive Crisis)</span>
              </div>
            </div>

            {/* Respiratory Rate */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Respiratory Rate (breaths/min)</span>
                <span className="text-sky-600 font-mono font-bold">{rr} bpm</span>
              </div>
              <input
                type="range"
                min="8"
                max="50"
                value={rr}
                onChange={(e) => setRr(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>8 (Hypoventilation)</span>
                <span>Normal: 12-20</span>
                <span>50 (Tachypnea)</span>
              </div>
            </div>

            {/* Age & Admission hours */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="18"
                  max="95"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ICU Stay (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={admHours}
                  onChange={(e) => setAdmHours(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-3 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Evaluating Model...' : 'Calculate Deterioration Risk'}</span>
            </button>
          </form>
        </div>

        {/* Prediction Results Display (7 cols) */}
        <div className="lg:col-span-7">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Risk Banner */}
              <div
                className={`p-5 rounded-2xl border ${
                  result.alert_level === 'RED'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : result.alert_level === 'YELLOW'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.alert_level === 'RED' ? (
                      <ShieldAlert className="w-6 h-6 text-rose-600" />
                    ) : result.alert_level === 'YELLOW' ? (
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    )}
                    <div>
                      <div className="text-xs uppercase font-extrabold tracking-wider">
                        {result.risk_category}
                      </div>
                      <div className="text-lg font-bold mt-0.5">{result.prediction_label}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-extrabold">{result.risk_percentage}%</div>
                    <div className="text-[10px] font-semibold opacity-75">Deterioration Score</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-black/10 text-xs">
                  <span className="font-semibold">Clinical Action: </span>
                  <span>{result.recommendation}</span>
                </div>
              </div>

              {/* Contributing Features Table */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2.5">
                  Physiological Feature Anomaly Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {result.feature_contributions?.map((fc) => (
                    <div key={fc.feature} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">{fc.feature}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            fc.impact === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : fc.impact === 'Moderate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {fc.status}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-slate-900 mt-1">
                        {fc.value} <span className="text-xs font-normal text-slate-500">{fc.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Metadata & Disclaimer */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold">Model:</span> {result.model_used} •{' '}
                  <span className="font-semibold">ID:</span> {result.prediction_id}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{result.clinical_disclaimer}</span>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[350px] bg-white rounded-2xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center">
              <Activity className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">No Assessment Executed Yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Adjust physiological vitals on the left panel or click a Quick Scenario preset, then click Calculate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
