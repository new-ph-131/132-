import React, { useState, useEffect } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import { PurchaseItem, Medicine, Party } from '../../types';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Search,
  ShoppingCart,
  Layers,
} from 'lucide-react';

interface PurchaseEntryViewProps {
  onBack: () => void;
  onPurchaseCreated?: () => void;
}

export const PurchaseEntryView: React.FC<PurchaseEntryViewProps> = ({
  onBack,
  onPurchaseCreated,
}) => {
  const { parties, medicines, getNextNumber, addPurchase } = usePharoah();

  const distributors = parties.filter((p) => p.group === 'Sundry Creditors');

  // Purchase Header
  const [internalNo, setInternalNo] = useState('');
  const [supplierBillNo, setSupplierBillNo] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<'CREDIT' | 'CASH' | 'BANK'>('CREDIT');
  const [extraDiscount, setExtraDiscount] = useState<number>(0);

  // Line items
  const [items, setItems] = useState<PurchaseItem[]>([]);

  // Add Item Dialog
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [expiry, setExpiry] = useState('12/26');
  const [mrp, setMrp] = useState<number>(0);
  const [purRate, setPurRate] = useState<number>(0);
  const [rateA, setRateA] = useState<number>(0);
  const [qty, setQty] = useState<number>(10);
  const [freeQty, setFreeQty] = useState<number>(0);
  const [discPer, setDiscPer] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(12);

  useEffect(() => {
    setInternalNo(getNextNumber('PURCHASE'));
    if (distributors.length > 0 && !selectedPartyId) {
      setSelectedPartyId(distributors[0].id);
    }
  }, [distributors]);

  const selectedDistributor = parties.find((p) => p.id === selectedPartyId);

  // When medicine changes in dialog, populate standard rates
  const handleMedChange = (medId: string) => {
    setSelectedMedId(medId);
    const m = medicines.find((item) => item.id === medId);
    if (m) {
      setMrp(m.mrp);
      setPurRate(m.purRate);
      setRateA(m.rateA);
      setGstRate(m.gst || 12);
      setBatchNo(`BT-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const addItemToPurchase = () => {
    const med = medicines.find((m) => m.id === selectedMedId);
    if (!med || !batchNo.trim()) {
      alert('Please select a medicine and enter a batch number.');
      return;
    }

    const itemSubtotal = qty * purRate;
    const discRupees = (itemSubtotal * discPer) / 100;
    const taxable = itemSubtotal - discRupees;
    const tax = (taxable * gstRate) / 100;
    const total = taxable + tax;

    const newItem: PurchaseItem = {
      id: `pi_${Date.now()}`,
      srNo: items.length + 1,
      medicineID: med.id,
      name: med.name,
      packing: med.packing,
      batch: batchNo.trim().toUpperCase(),
      exp: expiry,
      hsn: med.hsnCode || '3004',
      mrp,
      qty,
      freeQty,
      purchaseRate: purRate,
      gstRate,
      total,
      rateA,
      rateB: rateA * 0.96,
      rateC: rateA * 0.93,
      discountPer: discPer,
      discountRupees: discRupees,
      rateCFormula: 0,
      appliedRateType: 'A',
    };

    setItems([...items, newItem]);
    setIsItemDialogOpen(false);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx).map((item, i) => ({ ...item, srNo: i + 1 })));
  };

  const subtotal = items.reduce((acc, i) => acc + i.qty * i.purchaseRate - i.discountRupees, 0);
  const totalTax = items.reduce((acc, i) => acc + ((i.qty * i.purchaseRate - i.discountRupees) * i.gstRate) / 100, 0);
  const netPayable = Math.round(subtotal + totalTax - extraDiscount);

  const handleSavePurchase = () => {
    if (!selectedDistributor) {
      alert('Please select a distributor.');
      return;
    }
    if (!supplierBillNo.trim()) {
      alert('Please enter the Supplier Bill / Invoice Number.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least 1 item.');
      return;
    }

    addPurchase({
      internalNo,
      billNo: supplierBillNo.trim(),
      partyId: selectedDistributor.id,
      distributorName: selectedDistributor.name,
      paymentMode,
      gstStatus: 'Verified',
      date: new Date(billDate).toISOString(),
      entryDate: new Date().toISOString(),
      totalAmount: netPayable,
      items,
      linkedChallanIds: [],
      sourceTag: 'DIRECT_PURCHASE',
      extraDiscount,
      roundOff: 0,
    });

    alert(`Purchase Entry ${internalNo} (Supplier Inv: ${supplierBillNo}) recorded. Stock has been incremented.`);
    if (onPurchaseCreated) {
      onPurchaseCreated();
    } else {
      onBack();
    }
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
                PURCHASE INWARD ENTRY
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-900/60 text-amber-300 border border-amber-700">
                {internalNo}
              </span>
            </div>
            <p className="text-xs text-slate-400">Record distributor supplies, batch details & restock inventory</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (medicines.length > 0) handleMedChange(medicines[0].id);
              setIsItemDialogOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Inward Item</span>
          </button>
          <button
            onClick={handleSavePurchase}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-900/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Purchase Entry</span>
          </button>
        </div>
      </div>

      {/* Purchase Header Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0F172A] p-4 rounded-xl border border-slate-800 text-xs">
        <div className="md:col-span-2">
          <label className="font-bold text-slate-300 mb-1 block">Distributor / Supplier *</label>
          <select
            value={selectedPartyId}
            onChange={(e) => setSelectedPartyId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold focus:border-amber-500 text-xs"
          >
            {distributors.length > 0 ? (
              distributors.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900">
                  {d.name} {d.city ? `(${d.city})` : ''}
                </option>
              ))
            ) : (
              parties.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name}
                </option>
              ))
            )}
          </select>
          {selectedDistributor && (
            <div className="text-[11px] text-slate-400 mt-1">
              GSTIN: <strong className="text-slate-200">{selectedDistributor.gst || 'N/A'}</strong> • DL: {selectedDistributor.dl || 'N/A'}
            </div>
          )}
        </div>

        <div>
          <label className="font-bold text-slate-300 mb-1 block">Supplier Bill / Inv No *</label>
          <input
            type="text"
            placeholder="e.g. ABC/24-25/9912"
            value={supplierBillNo}
            onChange={(e) => setSupplierBillNo(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold focus:border-amber-500 text-xs"
          />
        </div>

        <div>
          <label className="font-bold text-slate-300 mb-1 block">Bill Date</label>
          <input
            type="date"
            value={billDate}
            onChange={(e) => setBillDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold focus:border-amber-500 text-xs"
          />
        </div>
      </div>

      {/* Cart Items Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
              Purchased Medicine Items ({items.length})
            </h3>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No items added yet. Click "+ Add Inward Item" above to add products with batch, expiry, and purchase rates.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-2.5 w-10 text-center">#</th>
                  <th className="p-2.5">Item Name</th>
                  <th className="p-2.5 text-center">Pack</th>
                  <th className="p-2.5 text-center">Batch</th>
                  <th className="p-2.5 text-center">Exp</th>
                  <th className="p-2.5 text-right">MRP (₹)</th>
                  <th className="p-2.5 text-right">Pur Rate (₹)</th>
                  <th className="p-2.5 text-right">Qty</th>
                  <th className="p-2.5 text-right">Free</th>
                  <th className="p-2.5 text-right">GST %</th>
                  <th className="p-2.5 text-right">Total (₹)</th>
                  <th className="p-2.5 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-white">{item.name}</td>
                    <td className="p-2.5 text-center text-slate-300">{item.packing}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-amber-400">{item.batch}</td>
                    <td className="p-2.5 text-center font-mono text-slate-400">{item.exp}</td>
                    <td className="p-2.5 text-right text-slate-400">₹{item.mrp.toFixed(2)}</td>
                    <td className="p-2.5 text-right font-bold text-white">₹{item.purchaseRate.toFixed(2)}</td>
                    <td className="p-2.5 text-right font-bold text-amber-300">{item.qty}</td>
                    <td className="p-2.5 text-right text-slate-400">{item.freeQty}</td>
                    <td className="p-2.5 text-right text-slate-300">{item.gstRate}%</td>
                    <td className="p-2.5 text-right font-extrabold text-white">₹{item.total.toFixed(2)}</td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
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

        {items.length > 0 && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end gap-6 text-xs">
            <div>
              <span className="text-slate-400">Subtotal: </span>
              <span className="font-bold text-white">₹{subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400">Tax: </span>
              <span className="font-bold text-white">₹{totalTax.toFixed(2)}</span>
            </div>
            <div className="px-3 py-1 bg-amber-600/20 border border-amber-500/40 rounded-lg">
              <span className="text-amber-300 font-bold">Total Inward: </span>
              <span className="text-base font-extrabold text-white ml-1">
                ₹{netPayable.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Item Dialog */}
      {isItemDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-3">
            <h3 className="font-extrabold text-sm text-white">Add Purchased Medicine & Batch</h3>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Select Medicine *</label>
              <select
                value={selectedMedId}
                onChange={(e) => handleMedChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.packing}) - Stock: {m.stock}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Batch Number *</label>
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Expiry (MM/YY)</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="12/26"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">MRP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={mrp}
                  onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Pur Rate (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={purRate}
                  onChange={(e) => setPurRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Sale Rate A (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rateA}
                  onChange={(e) => setRateA(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Free Qty</label>
                <input
                  type="number"
                  min="0"
                  value={freeQty}
                  onChange={(e) => setFreeQty(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Disc %</label>
                <input
                  type="number"
                  min="0"
                  value={discPer}
                  onChange={(e) => setDiscPer(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setIsItemDialogOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={addItemToPurchase}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
