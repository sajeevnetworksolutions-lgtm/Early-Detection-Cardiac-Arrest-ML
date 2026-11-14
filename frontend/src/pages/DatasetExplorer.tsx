import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Info,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';

export const DatasetExplorer: React.FC = () => {
  const [datasets, setDatasets] = useState<any>(null);
  const [selectedDataset, setSelectedDataset] = useState<'primary' | 'secondary' | 'mitdb'>('primary');
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const statusData = await api.getDatasetStatus();
      setDatasets(statusData);
      const summaryData = await api.getDatasetSummary();
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const res = await api.uploadDataset(file);
      setUploadMessage(`Uploaded and validated ${file.name}`);
      loadData();
    } catch (err: any) {
      setUploadMessage(`Upload failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-600" />
            <h2 className="text-xl font-bold text-slate-900">Clinical Dataset Explorer & Schema Validator</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inspection, missing-value profiling, partition isolation, and PhysioNet DUA compliance verification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            <span>Upload Clinical CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {uploadMessage && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-sky-600" />
          <span>{uploadMessage}</span>
        </div>
      )}

      {/* Dataset Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tab 1: Primary eICU */}
        <button
          onClick={() => setSelectedDataset('primary')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedDataset === 'primary'
              ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 text-sm">Primary: eICU Cardiac Risk</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Active Benchmark
            </span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
            PhysioNet Clinical Trajectory Flow Matching cohort (eICU Database v2.0). 64,589 total patient cohort.
          </p>
          <div className="mt-3 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Features: HR, DBP, RR, Age</span>
            <span className="font-semibold text-sky-700">6 Features</span>
          </div>
        </button>

        {/* Tab 2: Secondary MDS-ED */}
        <button
          onClick={() => setSelectedDataset('secondary')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedDataset === 'secondary'
              ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 text-sm">Secondary: MIMIC-IV-Ext-MDS-ED</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
              DUA Restricted
            </span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
            Emergency department multimodal records with 129,095 ECG waveforms & 2,408 clinical columns.
          </p>
          <div className="mt-3 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Excludes -999 labels</span>
            <span className="font-semibold text-amber-700">Credentialed</span>
          </div>
        </button>

        {/* Tab 3: MIT-BIH */}
        <button
          onClick={() => setSelectedDataset('mitdb')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedDataset === 'mitdb'
              ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 text-sm">Tertiary: MIT-BIH Arrhythmia</span>
            <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
              Waveforms Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
            48 2-channel ECG recordings at 360 Hz with expert annotations for normal, PVC, PAC, and fusion beats.
          </p>
          <div className="mt-3 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Sampling: 360 Hz</span>
            <span className="font-semibold text-teal-700">Lead II / MLII</span>
          </div>
        </button>
      </div>

      {/* Dataset Summary Details */}
      {selectedDataset === 'primary' && summary && (
        <div className="space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Records</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {summary.total_records.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400">80% Train / 10% Val / 10% Test</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold uppercase">Missing Values</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {summary.total_missing}
              </div>
              <span className="text-[11px] text-emerald-600">Imputed via Median (Train only)</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold uppercase">Duplicate Records</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {summary.duplicate_records}
              </div>
              <span className="text-[11px] text-slate-400">Strict patient de-duplication</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold uppercase">Primary Target</span>
              <div className="text-2xl font-bold text-sky-700 mt-1">ICU_MORT</div>
              <span className="text-[11px] text-slate-400">Acute Deterioration Outcome</span>
            </div>
          </div>

          {/* Dataset Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Dataset Partition Preview (First 10 Patients)</h3>
                <p className="text-xs text-slate-500">Strictly isolated splits: train, validation, and testing</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-100">
                  <tr>
                    <th className="py-2 px-3">Patient ID</th>
                    <th className="py-2 px-3">Split</th>
                    <th className="py-2 px-3">Adm. Hours</th>
                    <th className="py-2 px-3">HR (Norm)</th>
                    <th className="py-2 px-3">DBP (Norm)</th>
                    <th className="py-2 px-3">RR (Norm)</th>
                    <th className="py-2 px-3">Age (Norm)</th>
                    <th className="py-2 px-3">MI</th>
                    <th className="py-2 px-3">ICU_MORT</th>
                    <th className="py-2 px-3">HOSP_MORT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.preview?.map((row: any) => (
                    <tr key={row.patient_id} className="hover:bg-slate-50/60 font-mono">
                      <td className="py-2 px-3 font-semibold text-slate-800">{row.patient_id}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.split === 'train' ? 'bg-sky-100 text-sky-800' :
                          row.split === 'val' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {row.split}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{row.TIME_FROM_ADM}</td>
                      <td className="py-2 px-3 text-slate-600">{row.hr_normalized}</td>
                      <td className="py-2 px-3 text-slate-600">{row.dbp_normalized}</td>
                      <td className="py-2 px-3 text-slate-600">{row.rr_normalized}</td>
                      <td className="py-2 px-3 text-slate-600">{row.age_normalized}</td>
                      <td className="py-2 px-3">{row.MI === 1 ? <span className="text-rose-600 font-bold">1</span> : '0'}</td>
                      <td className="py-2 px-3">{row.ICU_MORT === 1 ? <span className="text-rose-600 font-bold">1</span> : '0'}</td>
                      <td className="py-2 px-3">{row.HOSP_MORT === 1 ? <span className="text-rose-600 font-bold">1</span> : '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedDataset === 'secondary' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-base mb-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>MIMIC-IV-Ext-MDS-ED Credentialing Notice</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The MIMIC-IV-Ext-MDS-ED emergency department benchmark contains approximately 129,095 ECG records across 2,408 columns.
            In accordance with PhysioNet compliance:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-600 mt-2 space-y-1">
            <li>Requires completing CITI "Data or Specimens Only Research" training.</li>
            <li>Requires signed PhysioNet Data Use Agreement (DUA).</li>
            <li>To load: Download <code>mds_ed.csv</code> from PhysioNet and place in <code>data/raw/mds_ed.csv</code> or use the upload button above.</li>
            <li>Excluded or unavailable labels with value <code>-999</code> are automatically masked to prevent label leakage.</li>
          </ul>
        </div>
      )}

      {selectedDataset === 'mitdb' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-base mb-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <span>MIT-BIH Arrhythmia Database Ready</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            400 benchmark ECG segments at 360 Hz have been generated and pre-indexed for beat classification:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs font-semibold">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
              Class N: Normal Sinus Rhythm (100 records)
            </div>
            <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
              Class V: Premature Ventricular Contraction (100 records)
            </div>
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
              Class A: Atrial Premature Beat (100 records)
            </div>
            <div className="p-3 bg-purple-50 text-purple-800 rounded-xl border border-purple-200">
              Class F: Ventricular Fusion Beat (100 records)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
