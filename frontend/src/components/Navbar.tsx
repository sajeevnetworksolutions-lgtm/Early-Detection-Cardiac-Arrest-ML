import React from 'react';
import { Activity, ShieldCheck, Database, Award } from 'lucide-react';

interface NavbarProps {
  systemReady: boolean;
  bestModelName: string;
}

export const Navbar: React.FC<NavbarProps> = ({ systemReady, bestModelName }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-sky-600 to-teal-500 p-2.5 rounded-xl text-white shadow-sm">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                CARDIAC DETERIORATION & EARLY ARREST WARNING
              </h1>
              <span className="bg-sky-50 text-sky-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-sky-200">
                SSIT M.Tech CSE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Academic Clinical Decision Support Prototype • Deepthi R L (25CSE06)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <Award className="w-4 h-4 text-teal-600" />
            <span className="text-slate-600">Optimal CDSI Model:</span>
            <span className="font-semibold text-slate-900">{bestModelName || 'Logistic Regression'}</span>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs text-emerald-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{systemReady ? 'ML Backend Online' : 'System Booting...'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
