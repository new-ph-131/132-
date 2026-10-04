import React, { useState, useEffect } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import { SaleReturn, PurchaseReturn, BillItem, PurchaseItem } from '../../types';
import {
  RotateCcw,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface ReturnsViewProps {
  onBack: () => void;
  initialAction?: string;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({ onBack, initialAction }) => {
  const {
    parties,
    medicines,
    batchHistory,
    saleReturns,
    purchaseReturns,
    getNextNumber,
    addSaleReturn,
    addPurchaseReturn,
  } = usePharoah();

  const [activeTab, setActiveTab] = useState<'CN' | 'DN' | 'REGISTER'>('CN');

  // Credit Note (Sales Return)
  const [cnNo, setCnNo] = useState('');
  const [selectedPartyName, setSelectedPartyName] = useState(parties[0]?.name || '');
  const [returnType, setReturnType] = useState<'Sellable' | 'Breakage' | 'Expiry'>('Sellable');
  const [cnItems, setCnItems] = useState<BillItem[]>([]);

  // Item selector
  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || '');
  const [batchNo, setBatchNo] = useState('DL-24A1');
  const [itemQty, setItemQty] = useState(1);
  const [rate, setRate] = useState(28.5);

  useEffect(() => {
    setCnNo(getNextNumber('CREDIT_NOTE'));
    if (initialAction === 'GO_DN') setActiveTab('DN');
    if (initialAction === 'GO_RET_REG') setActiveTab('REGISTER');
  }, [initialAction]);

  const addCnItem = () => {
    const med = medicines.find((m) => m.id === selectedMedId);
    if (!med) return;
    const gstRate = med.gst || 12;
    const taxable = itemQty * rate;
    const tax = (taxable * gstRate) / 100;

    const newItem: BillItem = {
      id: `cni_${Date.now()}`,
      srNo: cnItems.length + 1,
      medicineID: med.id,
      name: med.name,
      packing: med.packing,
      batch: batchNo,
      exp: '12/26',
      hsn: med.hsnCode || '3004',
      mrp: med.mrp,
      qty: itemQty,
      freeQty: 0,
      rate,
      gstRate,
      cgst: tax / 2,
      sgst: tax / 2,
      igst: 0,
      total: taxable + tax,
      discountRupees: 0,
      discountPer: 0,
      isBreakage: returnType !== 'Sellable',
      appliedRateType: 'A',
      rateCFormula: 0,
    };

    setCnItems([...cnItems, newItem]);
  };

  const handleSaveCn = () => {
    if (cnItems.length === 0) {
      alert('Please add at least 1 item for credit note reversal.');
      return;
    }
    const total = cnItems.reduce((acc, i) => acc + i.total, 0);

    addSaleReturn({
      billNo: cnNo,
      date: new Date().toISOString(),
      partyName: selectedPartyName,
      totalAmount: total,
      extraDiscount: 0,
      roundOff: 0,
      status: 'Active',
      returnType,
      items: cnItems,
    });

    alert(`Credit Note ${cnNo} generated successfully! Stock updated.`);
    setCnItems([]);
    setCnNo(getNextNumber('CREDIT_NOTE'));
    setActiveTab('REGISTER');
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
            <h2 className="text-lg font-extrabold text-white tracking-wide">
              RETURNS & CREDIT/DEBIT NOTES
            </h2>
            <p className="text-xs text-slate-400">
              Manage sellable customer returns, breakage/expiry dumps & supplier debit notes
            </p>
          </div>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('CN')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'CN' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            + Credit Note (Sale Return)
          </button>
          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'REGISTER' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Returns Register ({saleReturns.length})
          </button>
        </div>
      </div>

      {activeTab === 'CN' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0F172A] p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Customer / Party *</label>
              <select
                value={selectedPartyName}
                onChange={(e) => setSelectedPartyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Return Category</label>
              <select
                value={returnType}
                onChange={(e) => setReturnType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
              >
                <option value="Sellable">Sellable Return (Adds back to Saleable Stock)</option>
                <option value="Breakage">Breakage / Damage (Segregated)</option>
                <option value="Expiry">Expired Goods (Excluded from Stock)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Credit Note No</label>
              <input
                type="text"
                value={cnNo}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 font-mono font-bold text-rose-400"
              />
            </div>
          </div>

          {/* Quick item bar */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="px-3 py-1.5 rounded bg-slate-800 text-white border border-slate-700"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.packing})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Batch No"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              className="w-24 px-2 py-1 rounded bg-slate-800 text-white font-mono border border-slate-700"
            />

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Qty:</span>
              <input
                type="number"
                min="1"
                value={itemQty}
                onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 rounded bg-slate-800 text-white text-right border border-slate-700 font-bold"
              />
            </div>

            <button
              onClick={addCnItem}
              className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reversal Item</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                    <th className="p-3">#</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3 text-center">Batch</th>
                    <th className="p-3 text-right">Return Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Reversed Amount</th>
                    <th className="p-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {cnItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-white">{item.name}</td>
                      <td className="p-3 text-center font-mono text-rose-400">{item.batch}</td>
                      <td className="p-3 text-right font-bold text-white">{item.qty}</td>
                      <td className="p-3 text-right">₹{item.rate.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-rose-400">₹{item.total.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setCnItems(cnItems.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {cnItems.length > 0 && (
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveCn}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition"
                >
                  Generate Credit Note & Restock
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Register */
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {saleReturns.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No credit note returns issued yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                    <th className="p-3">CN Number</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Party Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3 text-center">Items</th>
                    <th className="p-3 text-right">Reversed Amount</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {saleReturns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-rose-400">{r.billNo}</td>
                      <td className="p-3 text-slate-300">
                        {new Date(r.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-3 font-bold text-white">{r.partyName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-bold">
                          {r.returnType}
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-400">{r.items.length}</td>
                      <td className="p-3 text-right font-extrabold text-white">
                        ₹{r.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
