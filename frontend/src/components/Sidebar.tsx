import React from 'react';
import {
  LayoutDashboard,
  Database,
  Activity,
  HeartPulse,
  BrainCircuit,
  BarChart3,
  History,
  FileDown,
  AlertTriangle
} from 'lucide-react';

export type PageId =
  | 'home'
  | 'datasets'
  | 'ecg'
  | 'predict'
  | 'training'
  | 'performance'
  | 'history'
  | 'reports';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  const navItems = [
    { id: 'home' as PageId, label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'datasets' as PageId, label: 'Dataset Explorer', icon: Database },
    { id: 'ecg' as PageId, label: 'ECG Signal Analysis', icon: Activity },
    { id: 'predict' as PageId, label: 'Patient Risk Assessment', icon: HeartPulse },
    { id: 'training' as PageId, label: 'Model Training', icon: BrainCircuit },
    { id: 'performance' as PageId, label: 'Model Performance', icon: BarChart3 },
    { id: 'history' as PageId, label: 'Prediction History', icon: History },
    { id: 'reports' as PageId, label: 'Reports & Downloads', icon: FileDown },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation Modules
        </div>
        <nav className="space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  active
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Medical Notice</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Prototype evaluates ICU mortality & deterioration risk. Not certified for autonomous clinical diagnosis.
        </p>
      </div>
    </aside>
  );
};
