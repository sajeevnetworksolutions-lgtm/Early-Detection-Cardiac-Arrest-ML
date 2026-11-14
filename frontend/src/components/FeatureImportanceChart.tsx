import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface FeatureImportanceChartProps {
  importance: Record<string, number>;
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ importance }) => {
  const data = Object.entries(importance || {})
    .map(([feature, score]) => ({
      feature: feature
        .replace('_normalized', '')
        .replace('_', ' ')
        .toUpperCase(),
      importance: score,
    }))
    .sort((a, b) => b.importance - a.importance);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800">Random Forest Feature Importance</h3>
        <p className="text-xs text-slate-500">Relative Gini impurity reduction across physiological parameters</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fontWeight: 500 }} />
            <Tooltip formatter={(val: any) => typeof val === 'number' ? (val * 100).toFixed(1) + '%' : val} />
            <Bar dataKey="importance" fill="#0284c7" radius={[0, 6, 6, 0]} name="Importance" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
