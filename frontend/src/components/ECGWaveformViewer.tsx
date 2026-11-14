import React, { useState } from 'react';
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
import { ECGWaveformPoint } from '../types';
import { Activity, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ECGWaveformViewerProps {
  waveform: ECGWaveformPoint[];
  recordId: string;
  condition: string;
  snrDb: number;
  sqi: {
    kurtosis_sqi: number;
    skewness_sqi: number;
    relative_power_sqi: number;
    quality_grade: string;
  };
}

export const ECGWaveformViewer: React.FC<ECGWaveformViewerProps> = ({
  waveform,
  recordId,
  condition,
  snrDb,
  sqi,
}) => {
  const [showRaw, setShowRaw] = useState(true);
  const [showFiltered, setShowFiltered] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">{recordId} Waveform Lead II</h3>
            <span className="text-xs font-semibold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
              {condition}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Butterworth 0.5 - 40 Hz Bandpass • 50 Hz Notch Filter • Adaptive Pan-Tompkins Peak Detection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs">
            <span className="text-slate-500">SNR:</span>
            <span className="font-bold text-slate-800">{snrDb} dB</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-medium text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>SQI: {sqi.quality_grade} (pSQI: {sqi.relative_power_sqi})</span>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showRaw}
                onChange={(e) => setShowRaw(e.target.checked)}
                className="rounded text-amber-500"
              />
              <span className="text-slate-600">Raw Signal</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showFiltered}
                onChange={(e) => setShowFiltered(e.target.checked)}
                className="rounded text-sky-600"
              />
              <span className="text-slate-600">Filtered</span>
            </label>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={waveform} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time_sec"
              label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -10, fontSize: 11 }}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              domain={[-2, 2.5]}
              label={{ value: 'Voltage (mV)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11 }}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(val: any) => typeof val === 'number' ? val.toFixed(3) + ' mV' : val}
              labelFormatter={(l) => `${l} s`}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
            {showRaw && (
              <Line
                type="monotone"
                dataKey="raw_voltage"
                stroke="#cbd5e1"
                strokeWidth={1}
                dot={false}
                name="Raw Signal (with Baseline Drift & Powerline)"
              />
            )}
            {showFiltered && (
              <Line
                type="monotone"
                dataKey="filtered_voltage"
                stroke="#0284c7"
                strokeWidth={1.8}
                dot={false}
                name="Conditioned Clean ECG (Butterworth Filtered)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
