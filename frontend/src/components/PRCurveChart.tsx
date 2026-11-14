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

interface PRCurveChartProps {
  models: ModelMetric[];
}

export const PRCurveChart: React.FC<PRCurveChartProps> = ({ models }) => {
  const colorsList = ['#0284c7', '#0d9488', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

  const gridRecall = Array.from({ length: 41 }, (_, i) => +(i * 0.025).toFixed(3));

  const chartData = gridRecall.map((rec) => {
    const row: Record<string, number> = { recall: rec };
    models.forEach((m) => {
      const pts = m.pr_curve;
      let closestPrec = 0;
      let minDiff = 999;
      for (const p of pts) {
        const diff = Math.abs(p.recall - rec);
        if (diff < minDiff) {
          minDiff = diff;
          closestPrec = p.precision;
        }
      }
      row[m.model_name] = closestPrec;
    });
    return row;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800">Precision-Recall (PR) Curves</h3>
        <p className="text-xs text-slate-500">Crucial for highly imbalanced clinical cardiac deterioration datasets</p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="recall"
              label={{ value: 'Recall (Sensitivity)', position: 'insideBottom', offset: -10, fontSize: 11 }}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              domain={[0, 1]}
              label={{ value: 'Precision', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11 }}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(val: any) => typeof val === 'number' ? val.toFixed(3) : val}
              labelFormatter={(l) => `Recall: ${l}`}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
            {models.map((m, idx) => (
              <Line
                key={m.model_name}
                type="monotone"
                dataKey={m.model_name}
                stroke={colorsList[idx % colorsList.length]}
                strokeWidth={2}
                dot={false}
                name={`${m.model_name} (PR-AUC: ${m.pr_auc.toFixed(3)})`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
