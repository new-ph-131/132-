import React, { useState } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import {
  ShoppingCart,
  Trash2,
  Search,
  Download,
  Plus,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

interface PurchaseSummaryViewProps {
  onBack: () => void;
  onNewPurchase: () => void;
}

export const PurchaseSummaryView: React.FC<PurchaseSummaryViewProps> = ({
  onBack,
  onNewPurchase,
}) => {
  const { purchases, cancelPurchase } = usePharoah();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPurchases = purchases.filter((p) => {
    return (
      p.internalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.distributorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPurAmount = filteredPurchases.reduce((acc, p) => acc + p.totalAmount, 0);

  const exportCsv = () => {
    const headers = ['Internal No', 'Supplier Bill No', 'Date', 'Distributor', 'Mode', 'Items Count', 'Total Amount'];
    const rows = filteredPurchases.map((p) => [
      p.internalNo,
      p.billNo,
      p.date.split('T')[0],
      `"${p.distributorName}"`,
      p.paymentMode,
      p.items.length,
      p.totalAmount.toFixed(2),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Purchase_Register_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <h2 className="text-lg font-extrabold text-white tracking-wide">
              PURCHASE REGISTER & INWARD LOG
            </h2>
            <p className="text-xs text-slate-400">
              Chronological log of supplier bills, ITC purchases & batch stock receipts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onNewPurchase}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>+ Inward Purchase</span>
          </button>
        </div>
      </div>

      {/* Search and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Internal No, Supplier Bill No, or Distributor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white"
          />
        </div>

        <div className="p-2.5 bg-amber-950/40 border border-amber-900/60 rounded-xl flex items-center justify-between px-4">
          <span className="text-xs text-amber-300 font-bold">Total Purchases:</span>
          <span className="text-base font-extrabold text-white">
            ₹{totalPurAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {filteredPurchases.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No purchase records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-3">Internal No</th>
                  <th className="p-3">Supplier Bill No</th>
                  <th className="p-3">Bill Date</th>
                  <th className="p-3">Distributor Name</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3 text-center">Items Count</th>
                  <th className="p-3 text-right">Inward Total (₹)</th>
                  <th className="p-3 text-center">GST Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPurchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-amber-400">
                      {pur.internalNo}
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-200">
                      {pur.billNo}
                    </td>
                    <td className="p-3 text-slate-300 whitespace-nowrap">
                      {new Date(pur.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3 font-bold text-white max-w-[200px] truncate">
                      {pur.distributorName}
                    </td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                        {pur.paymentMode}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-400">
                      {pur.items.length} items
                    </td>
                    <td className="p-3 text-right font-extrabold text-white text-sm">
                      ₹{pur.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                        {pur.gstStatus || 'Verified'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Cancel purchase ${pur.internalNo}? Stock will be deducted.`)) {
                            cancelPurchase(pur.id);
                          }
                        }}
                        className="p-1.5 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition"
                        title="Cancel Purchase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
