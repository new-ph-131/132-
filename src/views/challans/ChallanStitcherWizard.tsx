import React, { useState } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import { SaleChallan } from '../../types';
import {
  Sparkles,
  ArrowLeft,
  CheckSquare,
  Square,
  Truck,
  ArrowRight,
  Layers,
  FileCheck,
} from 'lucide-react';

interface ChallanStitcherWizardProps {
  onBack: () => void;
  onInvoiceCreated: (sale: any) => void;
}

export const ChallanStitcherWizard: React.FC<ChallanStitcherWizardProps> = ({
  onBack,
  onInvoiceCreated,
}) => {
  const { parties, saleChallans, stitchSaleChallansToBill } = usePharoah();

  const [selectedPartyId, setSelectedPartyId] = useState(parties[0]?.id || '');
  const [selectedChallanIds, setSelectedChallanIds] = useState<string[]>([]);

  const pendingChallans = saleChallans.filter(
    (c) => c.status === 'Pending' && (selectedPartyId ? c.partyId === selectedPartyId : true)
  );

  const toggleSelectChallan = (id: string) => {
    if (selectedChallanIds.includes(id)) {
      setSelectedChallanIds(selectedChallanIds.filter((cid) => cid !== id));
    } else {
      setSelectedChallanIds([...selectedChallanIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedChallanIds.length === pendingChallans.length) {
      setSelectedChallanIds([]);
    } else {
      setSelectedChallanIds(pendingChallans.map((c) => c.id));
    }
  };

  const handleStitch = () => {
    if (selectedChallanIds.length === 0) {
      alert('Please select at least 1 pending challan to stitch.');
      return;
    }
    const sale = stitchSaleChallansToBill(selectedChallanIds, selectedPartyId);
    alert(`Success! Generated Consolidated Invoice ${sale.billNo} from ${selectedChallanIds.length} challans.`);
    onInvoiceCreated(sale);
  };

  const totalSelectedAmount = pendingChallans
    .filter((c) => selectedChallanIds.includes(c.id))
    .reduce((sum, c) => sum + c.totalAmount, 0);

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
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-extrabold text-white tracking-wide">
                CHALLAN-TO-BILL STITCHER WIZARD
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Combine multiple pending delivery challans into a consolidated GST Tax Invoice
            </p>
          </div>
        </div>

        <button
          onClick={handleStitch}
          disabled={selectedChallanIds.length === 0}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-extrabold text-xs transition shadow-lg ${
            selectedChallanIds.length > 0
              ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Stitch {selectedChallanIds.length} Challan(s)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Select Party */}
      <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 text-xs">
        <label className="font-bold text-slate-300 block mb-1">Select Customer / Party:</label>
        <select
          value={selectedPartyId}
          onChange={(e) => {
            setSelectedPartyId(e.target.value);
            setSelectedChallanIds([]);
          }}
          className="w-full md:w-96 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold focus:border-teal-500"
        >
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.city ? `(${p.city})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Challan Selection Grid */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-xs uppercase text-slate-200">
              Pending Delivery Challans for Party ({pendingChallans.length})
            </span>
          </div>
          {pendingChallans.length > 0 && (
            <button
              onClick={selectAll}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
            >
              {selectedChallanIds.length === pendingChallans.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {pendingChallans.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No pending delivery challans found for this party.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {pendingChallans.map((challan) => {
              const isSelected = selectedChallanIds.includes(challan.id);
              return (
                <div
                  key={challan.id}
                  onClick={() => toggleSelectChallan(challan.id)}
                  className={`p-4 cursor-pointer transition flex items-center justify-between ${
                    isSelected ? 'bg-teal-950/30 border-l-4 border-teal-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-teal-400 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-white">
                          {challan.billNo}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          {challan.status}
                        </span>
                        {challan.isSigned && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                            <FileCheck className="w-3 h-3" />
                            Signed
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Dispatched: {new Date(challan.date).toLocaleDateString('en-IN')} • {challan.items.length} items
                        {challan.remarks ? ` • Note: ${challan.remarks}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-white">
                      ₹{challan.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-teal-400 font-semibold mt-0.5">
                      Ready for consolidation
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Summary bar */}
        {selectedChallanIds.length > 0 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">
              Selected <strong>{selectedChallanIds.length}</strong> Challans for Consolidation:
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-extrabold text-teal-300">
                Total ₹{totalSelectedAmount.toFixed(2)}
              </span>
              <button
                onClick={handleStitch}
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition"
              >
                Generate Combined Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
