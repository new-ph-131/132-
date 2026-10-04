import React, { useState } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import { BatchInfo, Medicine } from '../../types';
import {
  Layers,
  Search,
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface BatchMasterViewProps {
  onBack: () => void;
}

export const BatchMasterView: React.FC<BatchMasterViewProps> = ({ onBack }) => {
  const { medicines, batchHistory, updateBatch } = usePharoah();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Hold' | 'Blocked'>('All');

  // Flatten all batches
  const allBatches: Array<{ med: Medicine; batch: BatchInfo }> = [];
  Object.entries(batchHistory).forEach(([medId, batches]) => {
    const med = medicines.find((m) => m.id === medId);
    if (med) {
      batches.forEach((b) => {
        allBatches.push({ med, batch: b });
      });
    }
  });

  const filteredBatches = allBatches.filter(({ med, batch }) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.batch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate days to expiry
  const getExpiryBadge = (expStr: string) => {
    let expDate: Date | null = null;
    if (expStr.includes('/')) {
      const [m, y] = expStr.split('/');
      const fullYear = parseInt(y, 10) < 100 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
      expDate = new Date(fullYear, parseInt(m, 10), 0);
    }
    if (!expDate) return <span className="text-slate-400">{expStr}</span>;

    const now = new Date();
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          EXPIRED ({expStr})
        </span>
      );
    } else if (diffDays <= 90) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Near Exp ({expStr})
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
          Valid ({expStr})
        </span>
      );
    }
  };

  const handleStatusChange = (medId: string, batchNo: string, newStatus: BatchInfo['status']) => {
    updateBatch(medId, batchNo, { status: newStatus });
  };

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
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white tracking-wide">
                AUTONOMOUS BATCH MASTER (MARG COMPLIANT)
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700">
                {allBatches.length} Batches
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Granular lot tracking, expiry audit watchdog, multi-tier pricing rates & block controls
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Medicine Name or Batch Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Batches Only</option>
            <option value="Hold">On Hold (Inspection)</option>
            <option value="Blocked">Blocked (Quarantined)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3">Medicine Description</th>
                <th className="p-3">Batch Number</th>
                <th className="p-3 text-center">Expiry Audit</th>
                <th className="p-3 text-right">MRP (₹)</th>
                <th className="p-3 text-right">Pur Rate</th>
                <th className="p-3 text-right">Rate A</th>
                <th className="p-3 text-right">Rate B</th>
                <th className="p-3 text-center">In-Stock Qty</th>
                <th className="p-3 text-center">Batch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredBatches.map(({ med, batch }) => (
                <tr key={`${med.id}_${batch.batch}`} className="hover:bg-slate-800/40 transition">
                  <td className="p-3">
                    <div className="font-extrabold text-white text-sm">{med.name}</div>
                    <div className="text-[10px] text-slate-400">Pack: {med.packing}</div>
                  </td>
                  <td className="p-3 font-mono font-extrabold text-blue-400 text-sm">
                    {batch.batch}
                  </td>
                  <td className="p-3 text-center">{getExpiryBadge(batch.exp)}</td>
                  <td className="p-3 text-right text-slate-300">₹{batch.mrp.toFixed(2)}</td>
                  <td className="p-3 text-right text-slate-400">₹{batch.purRate.toFixed(2)}</td>
                  <td className="p-3 text-right font-bold text-emerald-400">
                    ₹{batch.rateA.toFixed(2)}
                  </td>
                  <td className="p-3 text-right text-slate-300">₹{batch.rateB.toFixed(2)}</td>
                  <td className="p-3 text-center font-extrabold text-white text-sm">
                    {batch.qty}
                  </td>
                  <td className="p-3 text-center">
                    <select
                      value={batch.status}
                      onChange={(e) =>
                        handleStatusChange(med.id, batch.batch, e.target.value as any)
                      }
                      className={`px-2 py-1 rounded text-xs font-bold border ${
                        batch.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : batch.status === 'Hold'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}
                    >
                      <option value="Active">Active</option>
                      <option value="Hold">Hold</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
