import React from 'react';
import {
  Home,
  Receipt,
  Truck,
  RotateCcw,
  Boxes,
  Wallet,
  Star,
  FileCheck2,
  CloudUpload,
  X,
  History,
} from 'lucide-react';

interface RecentSidebarProps {
  currentView: string;
  onNavigate: (view: string, title?: string) => void;
  recentShortcuts: Array<{ title: string; module: string; iconName?: string }>;
  onRemoveShortcut: (index: number) => void;
  onClearAll: () => void;
}

export const RecentSidebar: React.FC<RecentSidebarProps> = ({
  currentView,
  onNavigate,
  recentShortcuts,
  onRemoveShortcut,
  onClearAll,
}) => {
  const primaryNavItems = [
    { id: 'HOME', title: 'Workstation Hub', icon: Home, color: 'text-blue-400' },
    { id: 'BILLING', title: 'Billing & Sales', icon: Receipt, color: 'text-sky-400' },
    { id: 'CHALLANS', title: 'Challan Hub', icon: Truck, color: 'text-teal-400' },
    { id: 'RETURNS', title: 'Returns (CN/DN)', icon: RotateCcw, color: 'text-rose-400' },
    { id: 'INVENTORY', title: 'Stock & Batches', icon: Boxes, color: 'text-purple-400' },
    { id: 'ACCOUNTS', title: 'Accounts & Daybook', icon: Wallet, color: 'text-indigo-400' },
    { id: 'MASTERS', title: 'Business Masters', icon: Star, color: 'text-amber-400' },
    { id: 'GST', title: 'GST Compliance', icon: FileCheck2, color: 'text-emerald-400' },
    { id: 'DATA_HUB', title: 'Data Exchange', icon: CloudUpload, color: 'text-cyan-400' },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-61px)]">
      {/* Primary Navigation */}
      <div className="p-3 border-b border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 block">
          Core Modules
        </span>
        <nav className="space-y-0.5">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id !== 'HOME' && currentView.startsWith(item.id));
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id, item.title.toUpperCase())}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Recent Activity / Shortcuts */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <History className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Recent Action Views
            </span>
          </div>
          {recentShortcuts.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] text-slate-500 hover:text-rose-400 font-medium transition"
            >
              Clear
            </button>
          )}
        </div>

        {recentShortcuts.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg my-auto">
            Visited views and actions will be pinned here for fast 1-click access.
          </div>
        ) : (
          <div className="space-y-1">
            {recentShortcuts.map((s, idx) => (
              <div
                key={idx}
                className="group flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition border border-slate-800/80"
              >
                <button
                  onClick={() => onNavigate(s.module, s.title.toUpperCase())}
                  className="truncate flex-1 text-left font-medium"
                >
                  {s.title}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveShortcut(idx);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Status info */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Engine Status</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Synchronized
          </span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          Marg Protocol v629 • Offline Safe
        </div>
      </div>
    </aside>
  );
};
