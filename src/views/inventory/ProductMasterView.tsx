import React, { useState } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import { Medicine, BatchInfo } from '../../types';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';

interface ProductMasterViewProps {
  onBack: () => void;
}

export const ProductMasterView: React.FC<ProductMasterViewProps> = ({ onBack }) => {
  const { medicines, batchHistory, companies, salts, addMedicine, updateMedicine, totalStockValuation } =
    usePharoah();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedForBatches, setSelectedMedForBatches] = useState<Medicine | null>(null);

  // New / Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [packing, setPacking] = useState('10 TAB');
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [saltId, setSaltId] = useState(salts[0]?.id || '');
  const [rackNo, setRackNo] = useState('R-01');
  const [hsnCode, setHsnCode] = useState('30049099');
  const [gst, setGst] = useState(12);
  const [mrp, setMrp] = useState(100);
  const [purRate, setPurRate] = useState(70);
  const [rateA, setRateA] = useState(85);
  const [rateB, setRateB] = useState(80);
  const [rateC, setRateC] = useState(78);
  const [reorderLevel, setReorderLevel] = useState(20);

  const openNewModal = () => {
    setEditingMedId(null);
    setName('');
    setPacking('10 TAB');
    setRackNo('R-01');
    setHsnCode('30049099');
    setGst(12);
    setMrp(100);
    setPurRate(70);
    setRateA(85);
    setRateB(80);
    setRateC(78);
    setReorderLevel(20);
    setIsEditModalOpen(true);
  };

  const openEditModal = (m: Medicine) => {
    setEditingMedId(m.id);
    setName(m.name);
    setPacking(m.packing);
    setCompanyId(m.companyId);
    setSaltId(m.saltId);
    setRackNo(m.rackNo);
    setHsnCode(m.hsnCode);
    setGst(m.gst);
    setMrp(m.mrp);
    setPurRate(m.purRate);
    setRateA(m.rateA);
    setRateB(m.rateB);
    setRateC(m.rateC);
    setReorderLevel(m.reorderLevel);
    setIsEditModalOpen(true);
  };

  const handleSaveMedicine = () => {
    if (!name.trim()) {
      alert('Medicine name is required.');
      return;
    }

    if (editingMedId) {
      updateMedicine(editingMedId, {
        name: name.trim().toUpperCase(),
        packing,
        companyId,
        saltId,
        rackNo,
        hsnCode,
        gst,
        mrp,
        purRate,
        rateA,
        rateB,
        rateC,
        reorderLevel,
      });
      alert('Medicine master updated.');
    } else {
      addMedicine(
        {
          systemId: `PH-${Math.floor(10000 + Math.random() * 90000)}`,
          uniqueCode: name.slice(0, 6).toUpperCase(),
          name: name.trim().toUpperCase(),
          packing,
          companyId,
          saltId,
          drugTypeId: 'DT-01',
          rackNo,
          hsnCode,
          conversion: 1,
          reorderLevel,
          gst,
          mrp,
          purRate,
          rateA,
          rateB,
          rateC,
          stock: 100,
          drugForm: 'TAB',
          isNarcotic: false,
          isScheduleH1: false,
          storageCondition: 'Room Temp',
        },
        {
          batch: `BT-${Math.floor(100 + Math.random() * 900)}`,
          exp: '12/26',
          packing,
          mrp,
          rate: rateA,
          qty: 100,
          openingQty: 100,
          adjustmentQty: 0,
          breakageQty: 0,
          adjReason: '',
          purRate,
          rateA,
          rateB,
          rateC,
          rateCFormula: 0,
          appliedRateType: 'A',
          status: 'Active',
        }
      );
      alert('New medicine and initial batch created.');
    }
    setIsEditModalOpen(false);
  };

  const filteredMeds = medicines.filter((m) => {
    const term = searchTerm.toLowerCase();
    const compName = companies.find((c) => c.id === m.companyId)?.name.toLowerCase() || '';
    const saltName = salts.find((s) => s.id === m.saltId)?.name.toLowerCase() || '';
    return (
      m.name.toLowerCase().includes(term) ||
      m.rackNo.toLowerCase().includes(term) ||
      compName.includes(term) ||
      saltName.includes(term)
    );
  });

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
                MEDICINE MASTER & STOCK VALUATION
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-900/60 text-purple-300 border border-purple-700">
                {medicines.length} Items
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous catalog of drugs, formulations, pricing matrices & live stocks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 px-3 rounded-lg bg-purple-950/40 border border-purple-900/60 text-right">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">Total Valuation</span>
            <span className="text-sm font-extrabold text-white">
              ₹{totalStockValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <button
            onClick={openNewModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Medicine Master</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by medicine brand, composition salt, manufacturing company, or rack..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3">Brand Name</th>
                <th className="p-3 text-center">Packing</th>
                <th className="p-3">Manufacturer / Company</th>
                <th className="p-3 text-center">Rack</th>
                <th className="p-3 text-right">MRP (₹)</th>
                <th className="p-3 text-right">Pur Rate</th>
                <th className="p-3 text-right">Rate A</th>
                <th className="p-3 text-center">Stock</th>
                <th className="p-3 text-center">Batches</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMeds.map((med) => {
                const comp = companies.find((c) => c.id === med.companyId)?.name || 'GENERIC';
                const batches = batchHistory[med.id] || [];
                const isShortage = med.stock <= med.reorderLevel;

                return (
                  <tr key={med.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="font-extrabold text-white text-sm">{med.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        HSN: {med.hsnCode} • GST: {med.gst}%
                      </div>
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-300">
                      {med.packing}
                    </td>
                    <td className="p-3 text-slate-300 text-xs truncate max-w-[180px]">
                      {comp}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                        {med.rackNo}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-300">₹{med.mrp.toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-400">₹{med.purRate.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      ₹{med.rateA.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        isShortage
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      }`}>
                        {isShortage && <AlertTriangle className="w-3 h-3" />}
                        {med.stock}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedMedForBatches(med)}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 transition"
                      >
                        {batches.length} Batches
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openEditModal(med)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Edit Master"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batches Modal */}
      {selectedMedForBatches && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl w-full max-w-xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-white">Batch Inventory</h3>
                <p className="text-xs text-purple-300">{selectedMedForBatches.name}</p>
              </div>
              <button
                onClick={() => setSelectedMedForBatches(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-slate-800 max-h-[60vh] overflow-y-auto">
              {(batchHistory[selectedMedForBatches.id] || []).map((b, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-white text-sm">{b.batch}</span>
                    <span className="text-slate-400 text-xs ml-2 font-mono">Exp: {b.exp}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      MRP: ₹{b.mrp.toFixed(2)} • Rate A: ₹{b.rateA.toFixed(2)} • Rate B: ₹{b.rateB.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-400">{b.qty} Qty</span>
                    <div className="text-[10px] text-slate-500">{b.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Medicine Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl w-full max-w-xl p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-sm text-white">
              {editingMedId ? 'Edit Medicine Master' : 'Add New Medicine Master'}
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Brand Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CALPOL 650 MG"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Packing</label>
                <input
                  type="text"
                  value={packing}
                  onChange={(e) => setPacking(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Rack No</label>
                <input
                  type="text"
                  value={rackNo}
                  onChange={(e) => setRackNo(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">HSN Code</label>
                <input
                  type="text"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Company</label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Salt / Molecule</label>
                <select
                  value={saltId}
                  onChange={(e) => setSaltId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  {salts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">MRP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={mrp}
                  onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Pur Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={purRate}
                  onChange={(e) => setPurRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Rate A</label>
                <input
                  type="number"
                  step="0.01"
                  value={rateA}
                  onChange={(e) => setRateA(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">GST %</label>
                <input
                  type="number"
                  value={gst}
                  onChange={(e) => setGst(parseFloat(e.target.value) || 12)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMedicine}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Save Medicine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
