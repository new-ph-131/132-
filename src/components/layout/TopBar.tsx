import React from 'react';
import { usePharoah } from '../../context/PharoahContext';
import {
  Building2,
  Calendar,
  Search,
  User,
  LogOut,
  RefreshCw,
  PlusCircle,
  Database,
  ShieldCheck,
} from 'lucide-react';

interface TopBarProps {
  currentView: string;
  onNavigate: (view: string, title?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  setSearchQuery,
}) => {
  const {
    activeCompany,
    currentFY,
    setCurrentFY,
    currentUser,
    logout,
    rebuildInventory,
  } = usePharoah();

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 shadow-lg px-4 py-2.5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Active Company */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div
            onClick={() => onNavigate('HOME', 'MAIN BUSINESS MODULES')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 flex items-center justify-center shadow-md shadow-blue-900/40 text-white font-extrabold text-xl tracking-wider group-hover:scale-105 transition-transform">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide text-white group-hover:text-blue-400 transition-colors">
                  PHAROAH ERP
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Pharma 629
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs">
                {activeCompany.name}
              </p>
            </div>
          </div>

          {/* Quick FY Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-md px-2.5 py-1 text-xs text-slate-300 shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-semibold text-slate-400">FY:</span>
            <select
              value={currentFY}
              onChange={(e) => setCurrentFY(e.target.value)}
              className="bg-transparent text-white font-bold cursor-pointer text-xs focus:outline-none"
            >
              {activeCompany.fYears.map((fy) => (
                <option key={fy} value={fy} className="bg-slate-900 text-white">
                  {fy}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="w-full md:w-96 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Medicine, Salt, Party, Batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Fast Action Shortcuts & User Profile */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Quick New Sale button */}
          <button
            onClick={() => onNavigate('GO_SALE', 'NEW TAX INVOICE')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md shadow-blue-900/30"
            title="Create New GST Sale Invoice (F2)"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Sale (F2)</span>
          </button>

          {/* Quick Purchase button */}
          <button
            onClick={() => onNavigate('GO_PURCHASE', 'PURCHASE ENTRY')}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-white font-semibold text-xs transition shadow-md shadow-amber-900/20"
            title="Record Inward Purchase"
          >
            <span>+ Pur</span>
          </button>

          {/* Rebuild Stock Tool */}
          <button
            onClick={rebuildInventory}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
            title="Recalculate Stock & Batches"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                {currentUser?.name || 'Administrator'}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
