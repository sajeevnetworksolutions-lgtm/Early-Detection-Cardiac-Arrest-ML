import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { HomeDashboard } from './pages/HomeDashboard';
import { DatasetExplorer } from './pages/DatasetExplorer';
import { ECGAnalysis } from './pages/ECGAnalysis';
import { RiskAssessment } from './pages/RiskAssessment';
import { ModelTraining } from './pages/ModelTraining';
import { ModelPerformance } from './pages/ModelPerformance';
import { PredictionHistory } from './pages/PredictionHistory';
import { ReportsDownloads } from './pages/ReportsDownloads';
import { api } from './services/api';
import { ModelComparisonResponse } from './types';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [systemReady, setSystemReady] = useState(false);
  const [modelData, setModelData] = useState<ModelComparisonResponse | null>(null);
  const [datasetSummary, setDatasetSummary] = useState<any>(null);

  useEffect(() => {
    checkSystem();
  }, []);

  const checkSystem = async () => {
    try {
      const health = await api.checkHealth();
      setSystemReady(health.status === 'healthy');

      const comparison = await api.getModelComparison();
      setModelData(comparison);

      const summary = await api.getDatasetSummary();
      setDatasetSummary(summary);
    } catch (err) {
      console.error('System initialization error:', err);
      // Fallback: If backend is offline during early load, still render gracefully
      setSystemReady(false);
    }
  };

  const bestModelName = modelData?.best_model_selection?.best_model_name || 'Logistic Regression';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar systemReady={systemReady} bestModelName={bestModelName} />

      <div className="flex flex-1">
        <Sidebar currentPage={currentPage} onSelectPage={setCurrentPage} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {currentPage === 'home' && (
            <HomeDashboard
              modelData={modelData}
              datasetSummary={datasetSummary}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'datasets' && <DatasetExplorer />}

          {currentPage === 'ecg' && <ECGAnalysis />}

          {currentPage === 'predict' && <RiskAssessment />}

          {currentPage === 'training' && <ModelTraining />}

          {currentPage === 'performance' && <ModelPerformance modelData={modelData} />}

          {currentPage === 'history' && <PredictionHistory />}

          {currentPage === 'reports' && <ReportsDownloads />}
        </main>
      </div>
    </div>
  );
}

export default App;
