import React, { useState } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import {
  Star,
  Plus,
  ArrowLeft,
  Building2,
  Atom,
  MapPin,
  FileBadge,
  UserCheck,
} from 'lucide-react';

interface AuxMastersViewProps {
  onBack: () => void;
  initialTabIndex?: number;
}

export const AuxMastersView: React.FC<AuxMastersViewProps> = ({
  onBack,
  initialTabIndex = 0,
}) => {
  const {
    companies,
    salts,
    routes,
    numberingSeries,
    addCompany,
    addSalt,
    addRoute,
    activeCompany,
  } = usePharoah();

  const [activeTab, setActiveTab] = useState<'COMP' | 'SALT' | 'ROUTE' | 'SERIES' | 'CA'>('COMP');

  const [newCompName, setNewCompName] = useState('');
  const [newSaltName, setNewSaltName] = useState('');
  const [newRouteName, setNewRouteName] = useState('');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0F172A] p-4 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-wide">
              AUXILIARY MASTERS & SYSTEM SERIES
            </h2>
            <p className="text-xs text-slate-400">
              Pharma companies, generic salts/molecules, delivery routes & numbering series
            </p>
          </div>
        </div>

        <div className="flex flex-wrap bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('COMP')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'COMP' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Companies ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('SALT')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'SALT' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Salts / Molecules ({salts.length})
          </button>
          <button
            onClick={() => setActiveTab('ROUTE')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'ROUTE' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Routes ({routes.length})
          </button>
          <button
            onClick={() => setActiveTab('SERIES')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'SERIES' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Series Master
          </button>
          <button
            onClick={() => setActiveTab('CA')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'CA' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            CA Profile
          </button>
        </div>
      </div>

      {/* Tab: Companies */}
      {activeTab === 'COMP' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New Pharmaceutical Company Name (e.g. TORRENT PHARMA)"
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white flex-1"
            />
            <button
              onClick={() => {
                if (newCompName.trim()) {
                  addCompany(newCompName.trim());
                  setNewCompName('');
                }
              }}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Company</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {companies.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between"
              >
                <div>
                  <span className="font-extrabold text-white text-sm block">{c.name}</span>
                  <span className="font-mono text-slate-500 text-[10px]">{c.id}</span>
                </div>
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Salts */}
      {activeTab === 'SALT' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Generic Salt / Formulation Name (e.g. AMOXICILLIN 500MG)"
              value={newSaltName}
              onChange={(e) => setNewSaltName(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white flex-1"
            />
            <button
              onClick={() => {
                if (newSaltName.trim()) {
                  addSalt(newSaltName.trim(), 'Mono');
                  setNewSaltName('');
                }
              }}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Salt</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {salts.map((s) => (
              <div
                key={s.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between"
              >
                <div>
                  <span className="font-extrabold text-white text-sm block">{s.name}</span>
                  <span className="text-slate-400 text-[10px]">Type: {s.type} • {s.id}</span>
                </div>
                <Atom className="w-4 h-4 text-amber-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Routes */}
      {activeTab === 'ROUTE' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Delivery Beat / Route Name (e.g. SECTOR 14 - GOVERDHAN VILAS)"
              value={newRouteName}
              onChange={(e) => setNewRouteName(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white flex-1"
            />
            <button
              onClick={() => {
                if (newRouteName.trim()) {
                  addRoute(newRouteName.trim());
                  setNewRouteName('');
                }
              }}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Route</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {routes.map((r) => (
              <div
                key={r.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-white text-sm block">{r.name}</span>
                  <span className="font-mono text-slate-500 text-[10px]">{r.id}</span>
                </div>
                <MapPin className="w-4 h-4 text-teal-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Series Master */}
      {activeTab === 'SERIES' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                <th className="p-3">Series Name</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-center">Prefix</th>
                <th className="p-3 text-right">Start From</th>
                <th className="p-3 text-center">Default</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {numberingSeries.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">{s.name}</td>
                  <td className="p-3 text-slate-300">{s.type}</td>
                  <td className="p-3 text-center font-mono font-bold text-blue-400">{s.prefix}</td>
                  <td className="p-3 text-right font-mono text-white">{s.startNumber}</td>
                  <td className="p-3 text-center">
                    {s.isDefault ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 font-bold">
                        Default
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 font-bold">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: CA Profile */}
      {activeTab === 'CA' && (
        <div className="max-w-2xl mx-auto bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <UserCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-sm text-white">Chartered Accountant (CA) & Auditor Profile</h3>
              <p className="text-slate-400">Configure auditor access, statutory reports & direct GSTR exports</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Auditor Firm Name</label>
              <input
                type="text"
                defaultValue="M/S S.K. JAIN & ASSOCIATES"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Lead CA Name</label>
              <input
                type="text"
                defaultValue="CA Suresh Kumar Jain"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">ICAI Membership No</label>
              <input
                type="text"
                defaultValue="409218"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Firm Registration No (FRN)</label>
              <input
                type="text"
                defaultValue="014281C"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <p className="text-[11px] font-semibold text-emerald-400 mb-1">Audit Portal Enabled</p>
            <p className="text-slate-400 text-[11px]">
              Direct export protocols for Marg, Tally XML & GSTR JSON formats are enabled for this audit profile.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
