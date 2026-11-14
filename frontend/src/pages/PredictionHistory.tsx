import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCw,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Clock,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { PredictionHistoryItem } from '../types';

export const PredictionHistory: React.FC = () => {
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getPredictionHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            <h2 className="text-xl font-bold text-slate-900">Patient Risk Prediction Audit Log</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Persisted SQLite clinical inference history with time-stamped risk scores and alert categories
          </p>
        </div>

        <button
          onClick={loadHistory}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Log</span>
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Prediction ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3">Alert Level</th>
                  <th className="py-2.5 px-3">Risk Category</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.prediction_id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {item.prediction_id}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {item.model_name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.alert_level === 'RED'
                            ? 'bg-rose-100 text-rose-800'
                            : item.alert_level === 'YELLOW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.alert_level === 'RED'
                              ? 'bg-rose-600'
                              : item.alert_level === 'YELLOW'
                              ? 'bg-amber-600'
                              : 'bg-emerald-600'
                          }`}
                        />
                        {item.alert_level}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {item.risk_category}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-sky-700">
                      {(item.risk_score * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                      {item.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No Predictions Logged Yet</h4>
            <p className="text-xs text-slate-400 mt-1">
              Run inference on the Patient Risk Assessment page to view logged predictions here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
