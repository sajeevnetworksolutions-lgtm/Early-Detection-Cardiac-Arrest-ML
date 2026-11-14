import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ModelMetric } from '../types';

interface ROCCurveChartProps {
  models: ModelMetric[];
}

export const ROCCurveChart: React.FC<ROCCurveChartProps> = ({ models }) => {
  const colorsList = ['#0284c7', '#0d9488', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

  // Resample points on common FPR grid (0.0 to 1.0)
  const gridFpr = Array.from({ length: 41 }, (_, i) => +(i * 0.025).toFixed(3));

  const chartData = gridFpr.map((fpr) => {
    const row: Record<string, number> = { fpr, chance: fpr };
    models.forEach((m) => {
      // Find nearest TPR for this FPR in model's roc_curve
      const pts = m.roc_curve;
      let closestTpr = 0;
      let minDiff = 999;
      for (const p of pts) {
        const diff = Math.abs(p.fpr - fpr);
        if (diff < minDiff) {
          minDiff = diff;
          closestTpr = p.tpr;
        }
      }
      row[m.model_name] = closestTpr;
    });
    return row;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800">Receiver Operating Characteristic (ROC)</h3>
        <p className="text-xs text-slate-500">Discrimination curve across varying decision thresholds</p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="fpr"
              label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -10, fontSize: 11 }}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              domain={[0, 1]}
              label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11 }}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(val: any) => typeof val === 'number' ? val.toFixed(3) : val}
              labelFormatter={(l) => `FPR: ${l}`}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
            <Line
              type="monotone"
              dataKey="chance"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              dot={false}
              name="Chance (AUC=0.5)"
            />
            {models.map((m, idx) => (
              <Line
                key={m.model_name}
                type="monotone"
                dataKey={m.model_name}
                stroke={colorsList[idx % colorsList.length]}
                strokeWidth={2}
                dot={false}
                name={`${m.model_name} (AUC: ${m.roc_auc.toFixed(3)})`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
