import React, { useState } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import { ShortageItem } from '../../types';
import {
  AlertTriangle,
  Plus,
  Trash2,
  ArrowLeft,
  Download,
  Package,
} from 'lucide-react';

interface ShortageRegisterViewProps {
  onBack: () => void;
}

export const ShortageRegisterView: React.FC<ShortageRegisterViewProps> = ({ onBack }) => {
  const { medicines, shortages, addShortage, removeShortage, companies } = usePharoah();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || '');
  const [qtyReq, setQtyReq] = useState(50);
  const [remarks, setRemarks] = useState('');

  // Auto-detected shortages from reorder levels
  const autoShortageMedicines = medicines.filter((m) => m.stock <= m.reorderLevel);

  const handleAddManualShortage = () => {
    const med = medicines.find((m) => m.id === selectedMedId);
    if (!med) return;
    const comp = companies.find((c) => c.id === med.companyId)?.name || 'N/A';

    addShortage({
      medicineId: med.id,
      medicineName: med.name,
      companyName: comp,
      distributorName: '',
      customerName: remarks || 'Manual reorder indent',
      source: 'Operator Indent',
      qtyRequired: qtyReq,
      currentStock: med.stock,
      date: new Date().toISOString(),
    });

    setIsAddOpen(false);
    setRemarks('');
  };

  const exportIndentCsv = () => {
    const headers = ['Medicine Name', 'Company', 'Current Stock', 'Required Qty', 'Reason / Indent Note'];
    const rows = shortages.map((s) => [
      `"${s.medicineName}"`,
      `"${s.companyName}"`,
      s.currentStock,
      s.qtyRequired,
      `"${s.customerName}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Purchase_Shortage_Indent_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                SHORTAGE REGISTER & ORDER INDENT
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                {shortages.length} Items Short
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Low-stock alerts, customer order demands & distributor order planner
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportIndentCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Indent</span>
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Shortage Demand</span>
          </button>
        </div>
      </div>

      {/* Auto Warning Banner if products below reorder level */}
      {autoShortageMedicines.length > 0 && (
        <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded-xl flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{autoShortageMedicines.length} Medicines</strong> have breached minimum reorder levels in inventory.
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {shortages.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No shortages or pending indents recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-3">Medicine Description</th>
                  <th className="p-3">Manufacturer</th>
                  <th className="p-3 text-center">Current Stock</th>
                  <th className="p-3 text-center">Required Indent</th>
                  <th className="p-3">Source / Customer Demand</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {shortages.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-white text-sm">
                      {item.medicineName}
                    </td>
                    <td className="p-3 text-slate-300">{item.companyName}</td>
                    <td className="p-3 text-center font-bold text-rose-400">
                      {item.currentStock}
                    </td>
                    <td className="p-3 text-center font-extrabold text-amber-400 text-sm">
                      {item.qtyRequired}
                    </td>
                    <td className="p-3 text-slate-400">{item.customerName}</td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => removeShortage(item.id)}
                        className="p-1 text-slate-500 hover:text-emerald-400 transition"
                        title="Mark as ordered / clear"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl w-full max-w-md p-5 shadow-2xl space-y-3">
            <h3 className="font-extrabold text-sm text-white">Record Shortage / Demand</h3>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Select Medicine</label>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.packing}) - Stock: {m.stock}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Required Quantity</label>
              <input
                type="number"
                min="1"
                value={qtyReq}
                onChange={(e) => setQtyReq(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Customer / Demand Note</label>
              <input
                type="text"
                placeholder="Requested by City Chemist"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManualShortage}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Save Shortage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
