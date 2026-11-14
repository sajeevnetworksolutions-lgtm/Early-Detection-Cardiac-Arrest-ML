import React, { useState, useEffect } from 'react';
import {
  FileDown,
  FileText,
  FileSpreadsheet,
  BookOpen,
  Download,
  Award,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export const ReportsDownloads: React.FC = () => {
  const [dictionary, setDictionary] = useState<any[]>([]);

  useEffect(() => {
    api.getFeatureDictionary().then(setDictionary).catch(console.error);
  }, []);

  const references = [
    {
      authors: 'Parameswari S., Jeevitha S., Sree Rathna Lakshmi NVS., Swetha BV.',
      title: 'Machine Learning Driven Early Prediction of Cardiac Arrest',
      journal: 'Technology and Health Care, 2025.',
    },
    {
      authors: 'Shah A., Ahirrao S., Pandya S., Kotecha K., Rathod S.',
      title: 'Smart Cardiac Framework for an Early Detection of Cardiac Arrest Condition and Risk',
      journal: 'Frontiers in Public Health, vol. 9, 2021.',
    },
    {
      authors: 'Cheni Sruneethi., Pottendla Jyothi.',
      title: 'A Machine Learning Approach Using Statistical Models for Early Detection of Cardiac Arrest in Newborn Babies in the Cardiac Intensive Care Unit',
      journal: 'IJSRCSEIT, 2025.',
    },
    {
      authors: 'Kumar Narayanan et al.',
      title: 'Indian Team in Study of AI Tool to Predict Irregular Heartbeats',
      journal: 'European Heart Journal, reported in Times of India, 2025.',
    },
    {
      authors: 'J. Sivaraman et al.',
      title: 'NIT-R Develops New Atrial Lead System for Arrhythmia Detection',
      journal: 'Times of India, 2025.',
    },
    {
      authors: 'Medical Experts from Jaslok Hospital and KEM Hospital',
      title: 'AI Improving Early Detection, Prevention in Cardiac Patients',
      journal: 'Times of India, 2025.',
    },
    {
      authors: 'G. Divya., M. Naga Sravan Kumar., T. JayaDharani., B. Pavan., K. Praveen.',
      title: 'Deciphering Cardiac Destiny: Unveiling Future Risks Through Cutting-Edge Machine Learning Approaches',
      journal: 'arXiv Research Publication, 2024.',
    },
    {
      authors: 'Mehroush Banday., Sherin Zafar., Parul Agarwal., M. Afshar Alam.',
      title: 'Early Detection of Coronary Heart Disease Using Hybrid Quantum Machine Learning Approach',
      journal: 'arXiv Research Publication, 2024.',
    },
    {
      authors: 'Atit Pokharel., Shashank Dahal., Pratik Sapkota., Bhupendra Bimal Chhetri.',
      title: 'Electrocardiogram (ECG) Based Cardiac Arrhythmia Detection and Classification using Machine Learning Algorithms',
      journal: 'arXiv Research Publication, 2024.',
    },
    {
      authors: 'M. Khurram Umair et al.',
      title: 'Machine Learning Driven Early Prediction of Cardiac Arrest Using ECG Time Series Data',
      journal: 'Scientific Reports, 2026.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <FileDown className="w-5 h-5 text-sky-600" />
          <h2 className="text-xl font-bold text-slate-900">Academic Reports & Research Deliverables</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Download peer-reviewed PDF reports, raw test evaluations, feature definitions, and verified academic references
        </p>
      </div>

      {/* Download Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF Download Card */}
        <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Full Academic Thesis Report</span>
            </div>
            <h3 className="text-lg font-bold">Research Project Report (PDF)</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Complete academic paper compiled with ReportLab containing problem statement, literature survey,
              data preprocessing, Butterworth ECG filtering, model comparisons, ROC/PR curves, and clinical discussions.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">PDF • 1.33 MB • Publication Quality</span>
            <a
              href={api.getReportPdfUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>

        {/* CSV Download Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-3">
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
              <span>Measurable Test Data</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Experimental Evaluation Metrics (CSV)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export all 11 evaluation metrics for the six synopsis machine learning algorithms:
              Accuracy, Sensitivity, Specificity, Precision, F1-Score, ROC-AUC, PR-AUC, FPR, FNR, and CDSI.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">CSV • UTF-8 • Test Partition (1,000 Pts)</span>
            <a
              href={api.getComparisonCsvUrl()}
              download="model_comparison.csv"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </a>
          </div>
        </div>
      </div>

      {/* Feature Catalog Dictionary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800">Physiological & ECG Feature Engineering Dictionary</h3>
          <p className="text-xs text-slate-500">Mathematical definitions and clinical diagnostic utility</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Feature Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Mathematical Formula</th>
                <th className="py-2.5 px-3">Clinical Diagnostic Utility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dictionary.map((f) => (
                <tr key={f.feature} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{f.feature}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[10px]">
                      {f.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{f.formula}</td>
                  <td className="py-2.5 px-3 text-slate-600 leading-relaxed">{f.clinical_utility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Literature References */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <BookOpen className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Verified Academic References (From Sri Siddhartha Institute of Technology Synopsis)
          </h3>
        </div>

        <div className="space-y-3">
          {references.map((ref, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs flex gap-3">
              <span className="font-bold text-slate-400 shrink-0">[{idx + 1}]</span>
              <div>
                <span className="font-semibold text-slate-800">{ref.authors}</span>{' '}
                <span className="italic text-slate-700">"{ref.title},"</span>{' '}
                <span className="text-slate-500">{ref.journal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
