import React, { useState, useEffect } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import { BillItem, Medicine, BatchInfo, Party } from '../../types';
import {
  Plus,
  Trash2,
  Printer,
  Save,
  UserPlus,
  Search,
  AlertCircle,
  FileCheck,
  ChevronDown,
  Layers,
  ArrowLeft,
} from 'lucide-react';

interface NewSaleViewProps {
  onBack: () => void;
  onInvoiceCreated?: (sale: any) => void;
}

export const NewSaleView: React.FC<NewSaleViewProps> = ({ onBack, onInvoiceCreated }) => {
  const {
    parties,
    medicines,
    batchHistory,
    getNextNumber,
    addSale,
    addParty,
    addMedicine,
  } = usePharoah();

  // Invoice Header State
  const [billNo, setBillNo] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [invoiceType, setInvoiceType] = useState<'B2B' | 'B2C'>('B2B');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CREDIT' | 'BANK'>('CREDIT');
  const [vehicleNo, setVehicleNo] = useState('');
  const [extraDiscount, setExtraDiscount] = useState<number>(0);

  // Line items state
  const [items, setItems] = useState<BillItem[]>([]);

  // Item Selection & Batch Lookup Modals
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [selectedMedForBatch, setSelectedMedForBatch] = useState<Medicine | null>(null);

  // Quick Add Party Modal
  const [isQuickPartyOpen, setIsQuickPartyOpen] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyPhone, setNewPartyPhone] = useState('');
  const [newPartyGst, setNewPartyGst] = useState('');
  const [newPartyAddress, setNewPartyAddress] = useState('');

  // Quick Add Product Modal
  const [isQuickProductOpen, setIsQuickProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPack, setNewProdPack] = useState('10 TAB');
  const [newProdMrp, setNewProdMrp] = useState(100);
  const [newProdPurRate, setNewProdPurRate] = useState(70);
  const [newProdRateA, setNewProdRateA] = useState(85);
  const [newProdGst, setNewProdGst] = useState(12);

  // Initialize Bill Number & default party
  useEffect(() => {
    const nextNo = getNextNumber('SALE');
    setBillNo(nextNo);
    if (parties.length > 0 && !selectedPartyId) {
      setSelectedPartyId(parties[0].id);
      if (parties[0].gst) setInvoiceType('B2B');
    }
  }, [parties]);

  const selectedParty = parties.find((p) => p.id === selectedPartyId);

  // Handle party change
  const handlePartyChange = (partyId: string) => {
    setSelectedPartyId(partyId);
    const p = parties.find((item) => item.id === partyId);
    if (p) {
      setInvoiceType(p.gst ? 'B2B' : 'B2C');
    }
  };

  // Select a Medicine -> Open its Batches lookup
  const handleSelectMedicine = (med: Medicine) => {
    setSelectedMedForBatch(med);
    setIsMedicineModalOpen(false);
  };

  // Add a Batch to Cart
  const handleSelectBatch = (med: Medicine, batch: BatchInfo) => {
    // Choose appropriate rate based on party price level
    let appliedRate = batch.rateA || med.rateA || batch.rate;
    if (selectedParty?.priceLevel === 'B' && batch.rateB) appliedRate = batch.rateB;
    if (selectedParty?.priceLevel === 'C' && batch.rateC) appliedRate = batch.rateC;

    const gstRate = med.gst || 12;
    const qty = 1;
    const itemSubtotal = qty * appliedRate;
    const taxAmount = (itemSubtotal * gstRate) / 100;
    const total = itemSubtotal + taxAmount;

    const newItem: BillItem = {
      id: `bi_${Date.now()}_${Math.random()}`,
      srNo: items.length + 1,
      medicineID: med.id,
      name: med.name,
      packing: med.packing,
      batch: batch.batch,
      exp: batch.exp,
      hsn: med.hsnCode || '3004',
      mrp: batch.mrp || med.mrp,
      qty,
      freeQty: 0,
      rate: appliedRate,
      gstRate,
      cgst: taxAmount / 2,
      sgst: taxAmount / 2,
      igst: 0,
      total,
      discountRupees: 0,
      discountPer: 0,
      appliedRateType: selectedParty?.priceLevel || 'A',
      rateCFormula: 0,
    };

    setItems([...items, newItem]);
    setSelectedMedForBatch(null);
  };

  // Update item field in cart
  const updateItem = (index: number, updates: Partial<BillItem>) => {
    setItems((prev) => {
      const updated = [...prev];
      const cur = { ...updated[index], ...updates };

      const qty = Math.max(0, cur.qty);
      const rate = Math.max(0, cur.rate);
      let discRupees = cur.discountRupees || 0;

      if (updates.discountPer !== undefined) {
        discRupees = (qty * rate * updates.discountPer) / 100;
        cur.discountRupees = discRupees;
      } else if (updates.discountRupees !== undefined) {
        cur.discountPer = qty * rate > 0 ? (discRupees / (qty * rate)) * 100 : 0;
      }

      const taxable = Math.max(0, qty * rate - discRupees);
      const tax = (taxable * cur.gstRate) / 100;

      cur.qty = qty;
      cur.cgst = tax / 2;
      cur.sgst = tax / 2;
      cur.total = taxable + tax;

      updated[index] = cur;
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index).map((item, idx) => ({ ...item, srNo: idx + 1 })));
  };

  // Calculations
  const subtotal = items.reduce((acc, i) => acc + (i.qty * i.rate - i.discountRupees), 0);
  const totalTax = items.reduce((acc, i) => acc + (i.cgst + i.sgst), 0);
  const grossPayable = subtotal + totalTax - extraDiscount;
  const roundOff = Math.round(grossPayable) - grossPayable;
  const netPayable = Math.round(grossPayable);

  // Save Invoice
  const handleSaveInvoice = () => {
    if (!selectedParty) {
      alert('Please select a customer/party first.');
      return;
    }
    if (items.length === 0) {
      alert('Cart is empty. Please add at least 1 medicine item.');
      return;
    }

    const newSale = addSale({
      billNo,
      partyId: selectedParty.id,
      date: new Date().toISOString(),
      partyName: selectedParty.name,
      partyGstin: selectedParty.gst || '',
      partyState: selectedParty.state || 'Rajasthan',
      paymentMode,
      totalAmount: netPayable,
      status: 'Active',
      invoiceType,
      transporterName: selectedParty.transport || '',
      transporterId: '',
      vehicleNo,
      salesmanName: '',
      sourceTag: 'COUNTER_SALE',
      partyPhone: selectedParty.phone,
      partyEmail: selectedParty.email,
      partyAddress: selectedParty.address,
      partyCity: selectedParty.city,
      partyDl: selectedParty.dl,
      partyPan: selectedParty.pan,
      extraDiscount,
      roundOff,
      linkedChallanIds: [],
      items,
    });

    if (onInvoiceCreated) {
      onInvoiceCreated(newSale);
    } else {
      alert(`Invoice ${newSale.billNo} generated successfully!`);
      onBack();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0F172A] p-4 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Back to Sales Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white tracking-wide">
                NEW TAX INVOICE (GST SALE)
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700">
                {billNo}
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Marg ERP Pharmacological Billing</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMedicineModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Select Product (F3)</span>
          </button>
          <button
            onClick={handleSaveInvoice}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-900/20"
          >
            <Save className="w-4 h-4" />
            <span>Save & Finalize (Ctrl+S)</span>
          </button>
        </div>
      </div>

      {/* Invoice Meta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0F172A] p-4 rounded-xl border border-slate-800 text-xs">
        {/* Party Selector */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-300">Customer / Party Name *</label>
            <button
              onClick={() => setIsQuickPartyOpen(true)}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              <UserPlus className="w-3 h-3" />
              <span>+ Quick Party</span>
            </button>
          </div>
          <select
            value={selectedPartyId}
            onChange={(e) => handlePartyChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold focus:border-blue-500 text-xs"
          >
            {parties.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900">
                {p.name} {p.city ? `(${p.city})` : ''} - [{p.group}]
              </option>
            ))}
          </select>
          {selectedParty && (
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
              <span>GSTIN: <strong className="text-slate-200">{selectedParty.gst || 'URP'}</strong></span>
              <span>DL: <strong className="text-slate-200">{selectedParty.dl || 'N/A'}</strong></span>
              <span>Price Level: <strong className="text-blue-400">{selectedParty.priceLevel}</strong></span>
            </div>
          )}
        </div>

        {/* Invoice Type */}
        <div>
          <label className="font-bold text-slate-300 mb-1 block">Invoice Type</label>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setInvoiceType('B2B')}
              className={`py-1.5 rounded font-bold text-center transition ${
                invoiceType === 'B2B'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              B2B (GST)
            </button>
            <button
              type="button"
              onClick={() => setInvoiceType('B2C')}
              className={`py-1.5 rounded font-bold text-center transition ${
                invoiceType === 'B2C'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              B2C (Retail)
            </button>
          </div>
        </div>

        {/* Payment Mode */}
        <div>
          <label className="font-bold text-slate-300 mb-1 block">Payment Mode</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold focus:border-blue-500 text-xs"
          >
            <option value="CREDIT">CREDIT (Ledger Balance)</option>
            <option value="CASH">CASH (Direct Counter)</option>
            <option value="BANK">BANK / UPI Transfer</option>
          </select>
        </div>
      </div>

      {/* Cart Items Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
              Bill Items ({items.length})
            </h3>
          </div>
          <button
            onClick={() => setIsQuickProductOpen(true)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            + New Medicine Master
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm font-semibold mb-2">Cart is empty</p>
            <p className="text-slate-500 text-xs mb-4">
              Click the button below to search and add medicines with batches.
            </p>
            <button
              onClick={() => setIsMedicineModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
            >
              + Browse Medicine Catalog
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-2.5 w-10 text-center">#</th>
                  <th className="p-2.5 min-w-[200px]">Item Description</th>
                  <th className="p-2.5 w-20 text-center">Packing</th>
                  <th className="p-2.5 w-24 text-center">Batch</th>
                  <th className="p-2.5 w-20 text-center">Expiry</th>
                  <th className="p-2.5 w-20 text-right">Qty</th>
                  <th className="p-2.5 w-16 text-right">Free</th>
                  <th className="p-2.5 w-24 text-right">Rate (₹)</th>
                  <th className="p-2.5 w-16 text-right">Disc %</th>
                  <th className="p-2.5 w-20 text-right">GST %</th>
                  <th className="p-2.5 w-28 text-right">Total (₹)</th>
                  <th className="p-2.5 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-white">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">HSN: {item.hsn}</div>
                    </td>
                    <td className="p-2.5 text-center text-slate-300 font-medium">{item.packing}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-blue-400">{item.batch}</td>
                    <td className="p-2.5 text-center font-mono text-slate-400">{item.exp}</td>
                    <td className="p-2.5 text-right">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateItem(idx, { qty: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-right font-bold text-white focus:border-blue-500"
                      />
                    </td>
                    <td className="p-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.freeQty}
                        onChange={(e) => updateItem(idx, { freeQty: parseFloat(e.target.value) || 0 })}
                        className="w-14 px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-right text-slate-300"
                      />
                    </td>
                    <td className="p-2.5 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(idx, { rate: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-right font-bold text-white focus:border-blue-500"
                      />
                    </td>
                    <td className="p-2.5 text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPer}
                        onChange={(e) => updateItem(idx, { discountPer: parseFloat(e.target.value) || 0 })}
                        className="w-14 px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-right text-emerald-400"
                      />
                    </td>
                    <td className="p-2.5 text-right text-slate-300 font-semibold">{item.gstRate}%</td>
                    <td className="p-2.5 text-right font-extrabold text-white text-sm">
                      ₹{item.total.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                        title="Remove item"
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

        {/* Bill Summary Calculations Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setIsMedicineModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Item</span>
            </button>

            <div className="flex flex-wrap items-center justify-end gap-6 text-xs">
              <div>
                <span className="text-slate-400">Subtotal: </span>
                <span className="font-bold text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400">Total GST: </span>
                <span className="font-bold text-white">₹{totalTax.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Footer Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={extraDiscount}
                  onChange={(e) => setExtraDiscount(parseFloat(e.target.value) || 0)}
                  className="w-16 px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-right text-emerald-400 font-bold"
                />
              </div>
              <div className="px-3 py-1.5 bg-blue-600/20 border border-blue-500/40 rounded-lg">
                <span className="text-blue-300 font-bold">Net Amount: </span>
                <span className="text-lg font-extrabold text-white ml-1">
                  ₹{netPayable.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Select Medicine Catalog */}
      {isMedicineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white">Select Product / Medicine</h3>
              <button
                onClick={() => setIsMedicineModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Medicine Name or Packing..."
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto divide-y divide-slate-800/80 p-2">
              {medicines
                .filter(
                  (m) =>
                    m.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
                    m.packing.toLowerCase().includes(medicineSearch.toLowerCase())
                )
                .map((med) => {
                  const batches = batchHistory[med.id] || [];
                  const activeBatches = batches.filter((b) => b.qty > 0);
                  return (
                    <div
                      key={med.id}
                      onClick={() => handleSelectMedicine(med)}
                      className="p-3 hover:bg-slate-800/60 rounded-lg cursor-pointer transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                          {med.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Pack: <strong>{med.packing}</strong></span>
                          <span>•</span>
                          <span>GST: <strong>{med.gst}%</strong></span>
                          <span>•</span>
                          <span>Rate A: <strong>₹{med.rateA.toFixed(2)}</strong></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          med.stock > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          Stock: {med.stock} {med.packing}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1 font-mono">
                          {activeBatches.length} Batches Avail
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Batch Lookup Dialog for Selected Medicine */}
      {selectedMedForBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white">Select Batch</h3>
                <p className="text-xs text-blue-300 font-semibold">{selectedMedForBatch.name} ({selectedMedForBatch.packing})</p>
              </div>
              <button
                onClick={() => setSelectedMedForBatch(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-3 space-y-2">
              {(batchHistory[selectedMedForBatch.id] || []).length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No batches recorded for this medicine. Please add a batch via Purchase or Batch Master.
                </div>
              ) : (
                (batchHistory[selectedMedForBatch.id] || []).map((b, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectBatch(selectedMedForBatch, b)}
                    className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 rounded-lg cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-blue-400">{b.batch}</span>
                        <span className="text-xs text-slate-400 font-mono">Exp: {b.exp}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">
                          {b.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <span>MRP: <strong>₹{b.mrp.toFixed(2)}</strong></span>
                        <span>Rate A: <strong className="text-emerald-400">₹{b.rateA.toFixed(2)}</strong></span>
                        <span>Rate B: <strong>₹{b.rateB.toFixed(2)}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white">
                        {b.qty} In Stock
                      </div>
                      <button className="mt-1 px-2.5 py-1 rounded bg-blue-600 group-hover:bg-blue-500 text-white font-bold text-xs">
                        Select
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Quick Add Party */}
      {isQuickPartyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl w-full max-w-md p-4 shadow-2xl space-y-3">
            <h3 className="font-extrabold text-sm text-white">Quick Add Customer / Party</h3>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Party / Chemist Name *</label>
              <input
                type="text"
                value={newPartyName}
                onChange={(e) => setNewPartyName(e.target.value)}
                placeholder="e.g. Royal Pharmacy"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                value={newPartyGst}
                onChange={(e) => setNewPartyGst(e.target.value)}
                placeholder="15-character GSTIN"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Phone Number</label>
              <input
                type="text"
                value={newPartyPhone}
                onChange={(e) => setNewPartyPhone(e.target.value)}
                placeholder="Mobile number"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsQuickPartyOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newPartyName.trim()) return;
                  const added = addParty({
                    name: newPartyName.trim().toUpperCase(),
                    group: 'Sundry Debtors',
                    phone: newPartyPhone,
                    email: '',
                    address: newPartyAddress,
                    city: 'Local',
                    state: 'Rajasthan',
                    route: 'RT-001',
                    gst: newPartyGst.trim(),
                    dl: '',
                    dlExp: '',
                    pan: '',
                    transport: '',
                    priceLevel: 'A',
                    defaultSeriesId: 'INV',
                    hsnCode: '3004',
                    opBal: 0,
                    creditLimit: 50000,
                    creditDays: 30,
                  });
                  setSelectedPartyId(added.id);
                  setIsQuickPartyOpen(false);
                  setNewPartyName('');
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Save Party
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Quick Add Product */}
      {isQuickProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-slate-700 rounded-xl w-full max-w-md p-4 shadow-2xl space-y-3">
            <h3 className="font-extrabold text-sm text-white">Quick Add Medicine Master</h3>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Medicine Name *</label>
              <input
                type="text"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                placeholder="e.g. CALPOL 500 MG"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Packing</label>
                <input
                  type="text"
                  value={newProdPack}
                  onChange={(e) => setNewProdPack(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">GST %</label>
                <input
                  type="number"
                  value={newProdGst}
                  onChange={(e) => setNewProdGst(parseFloat(e.target.value) || 12)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">MRP (₹)</label>
                <input
                  type="number"
                  value={newProdMrp}
                  onChange={(e) => setNewProdMrp(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Pur Rate (₹)</label>
                <input
                  type="number"
                  value={newProdPurRate}
                  onChange={(e) => setNewProdPurRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Sale Rate A</label>
                <input
                  type="number"
                  value={newProdRateA}
                  onChange={(e) => setNewProdRateA(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsQuickProductOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newProdName.trim()) return;
                  const added = addMedicine(
                    {
                      systemId: `PH-${Date.now().toString().slice(-5)}`,
                      uniqueCode: newProdName.slice(0, 6).toUpperCase(),
                      name: newProdName.trim().toUpperCase(),
                      packing: newProdPack,
                      companyId: 'CP-00001',
                      saltId: 'SL-00001',
                      drugTypeId: 'DT-01',
                      rackNo: 'R-01',
                      hsnCode: '30049099',
                      conversion: 1,
                      reorderLevel: 20,
                      gst: newProdGst,
                      mrp: newProdMrp,
                      purRate: newProdPurRate,
                      rateA: newProdRateA,
                      rateB: newProdRateA * 0.95,
                      rateC: newProdRateA * 0.92,
                      stock: 100,
                      drugForm: 'TAB',
                      isNarcotic: false,
                      isScheduleH1: false,
                      storageCondition: 'Room Temp',
                    },
                    {
                      batch: 'INIT-01',
                      exp: '12/26',
                      packing: newProdPack,
                      mrp: newProdMrp,
                      rate: newProdRateA,
                      qty: 100,
                      openingQty: 100,
                      adjustmentQty: 0,
                      breakageQty: 0,
                      adjReason: '',
                      purRate: newProdPurRate,
                      rateA: newProdRateA,
                      rateB: newProdRateA * 0.95,
                      rateC: newProdRateA * 0.92,
                      rateCFormula: 0,
                      appliedRateType: 'A',
                      status: 'Active',
                    }
                  );
                  setIsQuickProductOpen(false);
                  setNewProdName('');
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
