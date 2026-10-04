import React from 'react';
import { usePharoah } from '../../context/PharoahContext';
import {
  FileText,
  Printer,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Sale } from '../../types';

interface InvoiceFeedProps {
  onViewInvoice: (sale: Sale) => void;
  onNavigate: (view: string, title?: string) => void;
}

export const InvoiceFeed: React.FC<InvoiceFeedProps> = ({ onViewInvoice, onNavigate }) => {
  const { sales, purchases, vouchers } = usePharoah();

  const recentSales = sales.slice(0, 6);

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">Live Transaction Activity</h4>
            <p className="text-xs text-slate-400">Recently generated GST tax invoices and bills</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('GO_SALE_REG', 'SALES REGISTER')}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
        >
          <span>View All Sales</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentSales.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          No sales invoices generated yet. Create your first sale invoice!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-2.5">Bill No</th>
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Party / Customer</th>
                <th className="pb-2.5">Type</th>
                <th className="pb-2.5">Items</th>
                <th className="pb-2.5 text-right">Net Amount</th>
                <th className="pb-2.5 text-center">Status</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {recentSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => onViewInvoice(sale)}
                >
                  <td className="py-2.5 font-bold text-blue-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sale.billNo}</span>
                  </td>
                  <td className="py-2.5 text-slate-300 whitespace-nowrap">
                    {new Date(sale.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-2.5 text-white font-semibold max-w-[200px] truncate">
                    {sale.partyName}
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {sale.invoiceType} • {sale.paymentMode}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400">{sale.items.length} items</td>
                  <td className="py-2.5 text-right font-extrabold text-white">
                    ₹{sale.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-center">
                    {sale.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/50">
                        <XCircle className="w-3 h-3" />
                        Cancelled
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onViewInvoice(sale)}
                        className="p-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition"
                        title="View & Print Tax Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
