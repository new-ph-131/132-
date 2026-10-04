import React, { useState, useEffect } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import { SaleChallan, BillItem } from '../../types';
import {
  Truck,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  FileCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface SaleChallanViewProps {
  onBack: () => void;
  onOpenStitcher: () => void;
}

export const SaleChallanView: React.FC<SaleChallanViewProps> = ({
  onBack,
  onOpenStitcher,
}) => {
  const { parties, medicines, batchHistory, saleChallans, getNextNumber, addSaleChallan } =
    usePharoah();

  const [activeTab, setActiveTab] = useState<'NEW' | 'REGISTER'>('NEW');

  // New Challan Form
  const [billNo, setBillNo] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState(parties[0]?.id || '');
  const [salesmanName, setSalesmanName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<BillItem[]>([]);

  // Item selector
  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || '');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [itemQty, setItemQty] = useState(1);

  useEffect(() => {
    setBillNo(getNextNumber('CHALLAN_SALE'));
  }, []);

  const selectedParty = parties.find((p) => p.id === selectedPartyId);

  const addItem = () => {
    const med = medicines.find((m) => m.id === selectedMedId);
    if (!med) return;
    const batches = batchHistory[med.id] || [];
    const b = batches.find((item) => item.batch === selectedBatch) || batches[0];
    const rate = b ? b.rateA || med.rateA : med.rateA;
    const gstRate = med.gst || 12;
    const taxable = itemQty * rate;
    const tax = (taxable * gstRate) / 100;

    const newItem: BillItem = {
      id: `sci_${Date.now()}`,
      srNo: items.length + 1,
      medicineID: med.id,
      name: med.name,
      packing: med.packing,
      batch: b ? b.batch : 'REG-01',
      exp: b ? b.exp : '12/26',
      hsn: med.hsnCode || '3004',
      mrp: b ? b.mrp : med.mrp,
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
      appliedRateType: 'A',
      rateCFormula: 0,
    };

    setItems([...items, newItem]);
  };

  const handleSaveChallan = () => {
    if (!selectedParty) return;
    if (items.length === 0) {
      alert('Please add items to the delivery challan.');
      return;
    }

    const subtotal = items.reduce((acc, i) => acc + i.total, 0);

    addSaleChallan({
      billNo,
      partyId: selectedParty.id,
      date: new Date().toISOString(),
      partyName: selectedParty.name,
      partyGstin: selectedParty.gst || '',
      partyState: selectedParty.state || 'Rajasthan',
      totalAmount: subtotal,
      status: 'Pending',
      salesmanName,
      remarks,
      items,
      isSigned: true,
      sigHistory: [
        {
          id: `sig_${Date.now()}`,
          imagePath: '',
          verificationCode: `VER-${Math.floor(1000 + Math.random() * 9000)}`,
          signedAmount: subtotal,
          signedQty: items.reduce((sum, i) => sum + i.qty, 0),
          signDate: new Date().toISOString(),
        },
      ],
    });

    alert(`Sale Delivery Challan ${billNo} dispatched successfully!`);
    setItems([]);
    setBillNo(getNextNumber('CHALLAN_SALE'));
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
              DELIVERY CHALLAN WORKSTATION
            </h2>
            <p className="text-xs text-slate-400">Issue goods on delivery note & convert later to invoice</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('NEW')}
              className={`px-3 py-1 rounded font-bold transition ${
                activeTab === 'NEW' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              + New Challan
            </button>
            <button
              onClick={() => setActiveTab('REGISTER')}
              className={`px-3 py-1 rounded font-bold transition ${
                activeTab === 'REGISTER' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Challan Register ({saleChallans.length})
            </button>
          </div>

          <button
            onClick={onOpenStitcher}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition"
          >
            Open Stitcher Wizard
          </button>
        </div>
      </div>

      {activeTab === 'NEW' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0F172A] p-4 rounded-xl border border-slate-800 text-xs">
            <div className="md:col-span-2">
              <label className="font-bold text-slate-300 block mb-1">Customer / Party *</label>
              <select
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city || 'Local'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Delivery Man / Salesman</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Delivery"
                value={salesmanName}
                onChange={(e) => setSalesmanName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Remarks / Dispatch Note</label>
              <input
                type="text"
                placeholder="Urgent supply / Sample"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
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
              onClick={addItem}
              className="px-3 py-1.5 rounded bg-teal-600 hover:bg-teal-500 text-white font-bold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line</span>
            </button>
          </div>

          {/* Items */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                    <th className="p-3">#</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3 text-center">Batch</th>
                    <th className="p-3 text-center">Exp</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-white">{item.name}</td>
                      <td className="p-3 text-center font-mono text-teal-400">{item.batch}</td>
                      <td className="p-3 text-center text-slate-400">{item.exp}</td>
                      <td className="p-3 text-right font-bold text-white">{item.qty}</td>
                      <td className="p-3 text-right">₹{item.rate.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-white">₹{item.total.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setItems(items.filter((_, i) => i !== idx))}
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

            {items.length > 0 && (
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-4">
                <button
                  onClick={handleSaveChallan}
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg transition"
                >
                  Save & Dispatch Challan
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Challan Register */
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-3">Challan No</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Party Name</th>
                  <th className="p-3 text-center">Items</th>
                  <th className="p-3 text-right">Total Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {saleChallans.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-teal-400">{c.billNo}</td>
                    <td className="p-3 text-slate-300">
                      {new Date(c.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3 font-bold text-white">{c.partyName}</td>
                    <td className="p-3 text-center text-slate-400">{c.items.length}</td>
                    <td className="p-3 text-right font-bold text-white">₹{c.totalAmount.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Pending' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {c.isSigned ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Signed
                        </span>
                      ) : (
                        <span className="text-slate-500">Unsigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
