import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Zap,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { ECGAnalysisResponse, ECGSampleMeta } from '../types';
import { ECGWaveformViewer } from '../components/ECGWaveformViewer';

export const ECGAnalysis: React.FC = () => {
  const [samples, setSamples] = useState<ECGSampleMeta[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<string>('REC_N_100');
  const [analysis, setAnalysis] = useState<ECGAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterClass, setFilterClass] = useState<string>('ALL');

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      const data = await api.getECGSamples();
      setSamples(data.records);
      if (data.records.length > 0) {
        // default select first PVC or normal
        const defaultRec = data.records.find((r) => r.label === 'V') || data.records[0];
        setSelectedRecord(defaultRec.record_id);
        analyzeRecord(defaultRec.record_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const analyzeRecord = async (recordId: string) => {
    setLoading(true);
    try {
      const res = await api.analyzeECG(recordId);
      setAnalysis(res);
      setSelectedRecord(recordId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSamples = samples.filter((s) => {
    if (filterClass === 'ALL') return true;
    return s.label === filterClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-bold text-slate-900">Biomedical ECG Signal Conditioning & Morphology</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Butterworth filtering (0.5 - 40 Hz), 50Hz notch filter, adaptive Pan-Tompkins QRS detection, and HRV calculation
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'N', 'V', 'A', 'F'].map((cls) => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterClass === cls
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cls === 'ALL' ? 'All Classes' : `Class ${cls}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Record Selector Grid */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="text-xs font-semibold uppercase text-slate-500 mb-2">Select ECG Strip (MIT-BIH):</div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {filteredSamples.slice(0, 15).map((s) => {
            const isSelected = s.record_id === selectedRecord;
            return (
              <button
                key={s.record_id}
                onClick={() => analyzeRecord(s.record_id)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${s.label === 'V' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                  <span>{s.record_id}</span>
                </div>
                <div className={`text-[10px] truncate max-w-[140px] mt-0.5 ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                  {s.condition}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Waveform Viewer */}
      {analysis && (
        <ECGWaveformViewer
          waveform={analysis.waveform_data}
          recordId={analysis.record_id}
          condition={analysis.condition}
          snrDb={analysis.snr_db}
          sqi={analysis.sqi_assessment}
        />
      )}

      {/* Extracted Clinical Feature Cards */}
      {analysis && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Extracted Physiological & HRV Features ({analysis.record_id})
              </h3>
              <p className="text-xs text-slate-500">
                Computed via Pan-Tompkins R-peak intervals and Welch power spectral density
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Heart Rate</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {analysis.extracted_features.mean_hr_bpm} <span className="text-xs font-normal text-slate-500">bpm</span>
              </div>
              <span className="text-[10px] text-slate-500">Mean cycle: {analysis.extracted_features.mean_rr_ms} ms</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">SDNN (Total HRV)</span>
              <div className="text-xl font-bold text-sky-700 mt-1">
                {analysis.extracted_features.sdnn_ms} <span className="text-xs font-normal text-slate-500">ms</span>
              </div>
              <span className="text-[10px] text-slate-500">Values &lt;50ms = High Risk</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">RMSSD (Vagal Tone)</span>
              <div className="text-xl font-bold text-teal-700 mt-1">
                {analysis.extracted_features.rmssd_ms} <span className="text-xs font-normal text-slate-500">ms</span>
              </div>
              <span className="text-[10px] text-slate-500">pNN50: {analysis.extracted_features.pnn50_pct}%</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">LF/HF Ratio</span>
              <div className="text-xl font-bold text-amber-700 mt-1">
                {analysis.extracted_features.lf_hf_ratio}
              </div>
              <span className="text-[10px] text-slate-500">Sympathovagal Balance</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">QRS Duration</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {analysis.extracted_features.qrs_duration_ms} <span className="text-xs font-normal text-slate-500">ms</span>
              </div>
              <span className="text-[10px] text-slate-500">&gt;120ms = Ventricular Ectopy</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">QRS Amplitude</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {analysis.extracted_features.qrs_amplitude_mv} <span className="text-xs font-normal text-slate-500">mV</span>
              </div>
              <span className="text-[10px] text-slate-500">Peak-to-Nadir potential</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Shannon Entropy</span>
              <div className="text-xl font-bold text-purple-700 mt-1">
                {analysis.extracted_features.shannon_entropy}
              </div>
              <span className="text-[10px] text-slate-500">Nonlinear signal complexity</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Signal SNR</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">
                {analysis.snr_db} <span className="text-xs font-normal text-slate-500">dB</span>
              </div>
              <span className="text-[10px] text-slate-500">Post-filtering fidelity</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
