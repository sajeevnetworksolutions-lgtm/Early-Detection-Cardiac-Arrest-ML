import React from 'react';

interface ConfusionMatrixChartProps {
  modelName: string;
  matrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
  sensitivity: number;
  specificity: number;
}

export const ConfusionMatrixChart: React.FC<ConfusionMatrixChartProps> = ({
  modelName,
  matrix,
  sensitivity,
  specificity,
}) => {
  const total = matrix.tn + matrix.fp + matrix.fn + matrix.tp;
  const tnPct = ((matrix.tn / total) * 100).toFixed(1);
  const fpPct = ((matrix.fp / total) * 100).toFixed(1);
  const fnPct = ((matrix.fn / total) * 100).toFixed(1);
  const tpPct = ((matrix.tp / total) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <h4 className="font-bold text-slate-800 text-sm">{modelName}</h4>
        <div className="flex gap-2 text-[11px]">
          <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200 font-medium">
            Sens: {(sensitivity * 100).toFixed(1)}%
          </span>
          <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md border border-teal-200 font-medium">
            Spec: {(specificity * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        {/* TN */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div className="text-[10px] uppercase font-bold text-emerald-800 mb-0.5">True Negative (TN)</div>
          <div className="text-xl font-extrabold text-emerald-900">{matrix.tn}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">{tnPct}% of cohort</div>
          <div className="text-[9.5px] text-emerald-600 mt-1">Correctly identified stable</div>
        </div>

        {/* FP */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="text-[10px] uppercase font-bold text-amber-800 mb-0.5">False Positive (FP)</div>
          <div className="text-xl font-extrabold text-amber-900">{matrix.fp}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">{fpPct}% of cohort</div>
          <div className="text-[9.5px] text-amber-600 mt-1">False alarm (non-critical)</div>
        </div>

        {/* FN */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
          <div className="text-[10px] uppercase font-bold text-rose-800 mb-0.5">False Negative (FN)</div>
          <div className="text-xl font-extrabold text-rose-900">{matrix.fn}</div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">{fnPct}% of cohort</div>
          <div className="text-[9.5px] text-rose-600 font-semibold mt-1">CRITICAL RISK: Missed deterioration</div>
        </div>

        {/* TP */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
          <div className="text-[10px] uppercase font-bold text-sky-800 mb-0.5">True Positive (TP)</div>
          <div className="text-xl font-extrabold text-sky-900">{matrix.tp}</div>
          <div className="text-[11px] text-sky-700 font-medium mt-0.5">{tpPct}% of cohort</div>
          <div className="text-[9.5px] text-sky-600 mt-1">Correct early warning alert</div>
        </div>
      </div>
    </div>
  );
};
