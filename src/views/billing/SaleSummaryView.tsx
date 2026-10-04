import React, { useState } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import { Sale } from '../../types';
import {
  FileText,
  Printer,
  Trash2,
  Ban,
  Search,
  Download,
  Plus,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface SaleSummaryViewProps {
  onBack: () => void;
  onNewSale: () => void;
  onViewInvoice: (sale: Sale) => void;
}

export const SaleSummaryView: React.FC<SaleSummaryViewProps> = ({
  onBack,
  onNewSale,
  onViewInvoice,
}) => {
  const { sales, cancelSale, deleteSale, currentUser } = usePharoah();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Cancelled'>('All');

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.partyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSalesVal = filteredSales
    .filter((s) => s.status === 'Active')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const exportCsv = () => {
    const headers = ['Bill No', 'Date', 'Party Name', 'GSTIN', 'Type', 'Payment Mode', 'Items Count', 'Status', 'Total Amount'];
    const rows = filteredSales.map((s) => [
      s.billNo,
      s.date.split('T')[0],
      `"${s.partyName}"`,
      s.partyGstin,
      s.invoiceType,
      s.paymentMode,
      s.items.length,
      s.status,
      s.totalAmount.toFixed(2),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Register_${new Date().toISOString().slice(0, 10)}.csv`);
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
              SALES REGISTER & AUDIT SUMMARY
            </h2>
            <p className="text-xs text-slate-400">
              Complete chronological register of pharmaceutical outward tax invoices
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
            onClick={onNewSale}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale (F2)</span>
          </button>
        </div>
      </div>

      {/* Filters and Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Bill No or Party Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-400"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white font-semibold"
          >
            <option value="All">All Statuses ({sales.length})</option>
            <option value="Active">Active Bills Only</option>
            <option value="Cancelled">Cancelled Bills</option>
          </select>
        </div>

        <div className="p-2.5 bg-blue-950/40 border border-blue-900/60 rounded-xl flex items-center justify-between px-4">
          <span className="text-xs text-blue-300 font-bold">Filtered Total:</span>
          <span className="text-base font-extrabold text-white">
            ₹{totalSalesVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No sales invoices found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-3">Bill No</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Party Name</th>
                  <th className="p-3">GSTIN</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3 text-center">Items</th>
                  <th className="p-3 text-right">Net Total (₹)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-blue-400">
                      {sale.billNo}
                    </td>
                    <td className="p-3 text-slate-300 whitespace-nowrap">
                      {new Date(sale.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3 font-bold text-white max-w-[200px] truncate">
                      {sale.partyName}
                    </td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">
                      {sale.partyGstin || 'URP'}
                    </td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                        {sale.paymentMode}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-400">
                      {sale.items.length}
                    </td>
                    <td className="p-3 text-right font-extrabold text-white text-sm">
                      ₹{sale.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      {sale.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/60">
                          <XCircle className="w-3 h-3" />
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewInvoice(sale)}
                          className="p-1.5 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition border border-blue-500/30"
                          title="Print / View Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {sale.status === 'Active' && (
                          <button
                            onClick={() => {
                              if (confirm(`Cancel invoice ${sale.billNo}?`)) {
                                cancelSale(sale.id);
                              }
                            }}
                            className="p-1.5 rounded bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white transition border border-amber-500/30"
                            title="Cancel Bill (Keep Audit Trail)"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {currentUser?.canDeleteBill && (
                          <button
                            onClick={() => {
                              if (confirm(`PERMANENTLY delete bill ${sale.billNo}? This cannot be undone.`)) {
                                deleteSale(sale.id);
                              }
                            }}
                            className="p-1.5 rounded bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition border border-rose-500/30"
                            title="Delete Bill (Admin Only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
