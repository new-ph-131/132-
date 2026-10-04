import React from 'react';
import { Sale, Purchase } from '../../types';
import { usePharoah } from '../../context/PharoahContext';
import { Printer, X, Download } from 'lucide-react';

interface InvoicePrintModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ sale, onClose }) => {
  const { activeCompany } = usePharoah();

  if (!sale) return null;

  const totalQty = sale.items.reduce((sum, item) => sum + item.qty, 0);
  const totalFree = sale.items.reduce((sum, item) => sum + (item.freeQty || 0), 0);
  const taxableSum = sale.items.reduce((sum, item) => {
    const itemSubtotal = item.qty * item.rate - item.discountRupees;
    return sum + itemSubtotal;
  }, 0);
  const cgstSum = sale.items.reduce((sum, item) => sum + item.cgst, 0);
  const sgstSum = sale.items.reduce((sum, item) => sum + item.sgst, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-800 border-b border-slate-700 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white">GST Tax Invoice Preview</span>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-900 text-blue-300">
              {sale.billNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas (White Paper Styling) */}
        <div className="overflow-y-auto p-6 bg-slate-950 flex justify-center">
          <div className="w-full max-w-3xl bg-white text-slate-900 p-6 rounded shadow-xl font-sans text-xs print:m-0 print:p-0 print:shadow-none print:w-full">
            {/* 1. Header Firm Info */}
            <div className="border-b-2 border-slate-900 pb-3 mb-3 text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                GST TAX INVOICE (ORIGINAL FOR RECIPIENT)
              </div>
              <h1 className="text-xl font-extrabold uppercase tracking-wide text-slate-950 mt-0.5">
                {activeCompany.name}
              </h1>
              <p className="text-xs text-slate-700 font-medium">
                {activeCompany.address}, {activeCompany.state} • Ph: {activeCompany.phone}
              </p>
              <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-800 mt-1">
                <span>GSTIN: <strong>{activeCompany.gstin}</strong></span>
                <span>DL Nos: <strong>{activeCompany.dlNo}</strong></span>
              </div>
            </div>

            {/* 2. Invoice & Buyer Information */}
            <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 rounded mb-3 text-xs">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Billed To (Buyer):</div>
                <div className="font-extrabold text-sm text-slate-900">{sale.partyName}</div>
                <div className="text-slate-600 mt-0.5">{sale.partyAddress || 'Local Address'}</div>
                <div className="text-slate-700 mt-1">
                  GSTIN: <span className="font-bold">{sale.partyGstin || 'UNREGISTERED'}</span>
                </div>
                <div className="text-slate-700">
                  DL No: <span className="font-semibold">{sale.partyDl || 'N/A'}</span> • Phone: {sale.partyPhone || 'N/A'}
                </div>
              </div>

              <div className="text-right flex flex-col justify-between">
                <div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Invoice Details</div>
                  <div className="text-base font-extrabold text-blue-800">{sale.billNo}</div>
                  <div className="text-slate-700 font-semibold mt-0.5">
                    Date: {new Date(sale.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="text-[11px] text-slate-600">
                  Payment Mode: <strong className="uppercase">{sale.paymentMode}</strong> • State: {sale.partyState}
                </div>
              </div>
            </div>

            {/* 3. Items Table */}
            <div className="border border-slate-300 rounded overflow-hidden mb-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-700">
                    <th className="p-1.5 border-r border-slate-300 w-8 text-center">#</th>
                    <th className="p-1.5 border-r border-slate-300">Product / Medicine</th>
                    <th className="p-1.5 border-r border-slate-300 text-center">Pack</th>
                    <th className="p-1.5 border-r border-slate-300 text-center">Batch</th>
                    <th className="p-1.5 border-r border-slate-300 text-center">Exp</th>
                    <th className="p-1.5 border-r border-slate-300 text-center">HSN</th>
                    <th className="p-1.5 border-r border-slate-300 text-right">Qty</th>
                    <th className="p-1.5 border-r border-slate-300 text-right">Free</th>
                    <th className="p-1.5 border-r border-slate-300 text-right">Rate</th>
                    <th className="p-1.5 border-r border-slate-300 text-right">MRP</th>
                    <th className="p-1.5 border-r border-slate-300 text-right">GST%</th>
                    <th className="p-1.5 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-1.5 border-r border-slate-300 text-center font-semibold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-center text-slate-600">
                        {item.packing}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-center font-mono font-semibold">
                        {item.batch}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-center text-slate-600">
                        {item.exp}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-center text-slate-500 text-[10px]">
                        {item.hsn}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-extrabold text-slate-900">
                        {item.qty}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right text-slate-600">
                        {item.freeQty || 0}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right">
                        {item.rate.toFixed(2)}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right text-slate-500">
                        {item.mrp.toFixed(2)}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right text-slate-600">
                        {item.gstRate}%
                      </td>
                      <td className="p-1.5 text-right font-bold text-slate-900">
                        {item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Financial Calculations & Summary */}
            <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 rounded mb-3">
              <div className="text-xs space-y-1 text-slate-700">
                <div className="font-bold text-slate-900 mb-1">Bank Payment Details:</div>
                <div>Bank: <strong>State Bank of India</strong></div>
                <div>A/C No: <strong>30495810294</strong></div>
                <div>IFSC: <strong>SBIN0001234</strong> (Chetak Circle)</div>
                <div className="pt-2 text-[10px] text-slate-500 leading-tight">
                  * All disputes subject to Udaipur jurisdiction only.
                  * Goods once sold will not be taken back without original invoice.
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-800">
                <div className="flex justify-between py-0.5 border-b border-slate-200">
                  <span className="text-slate-600">Total Items / Qty:</span>
                  <span className="font-semibold">{sale.items.length} items / {totalQty} (+{totalFree} free)</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-200">
                  <span className="text-slate-600">Taxable Amount:</span>
                  <span className="font-semibold">₹{taxableSum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-200">
                  <span className="text-slate-600">CGST Amount:</span>
                  <span className="font-semibold">₹{cgstSum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-200">
                  <span className="text-slate-600">SGST Amount:</span>
                  <span className="font-semibold">₹{sgstSum.toFixed(2)}</span>
                </div>
                {sale.extraDiscount > 0 && (
                  <div className="flex justify-between py-0.5 text-emerald-700 font-semibold border-b border-slate-200">
                    <span>Extra Footer Discount:</span>
                    <span>-₹{sale.extraDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 text-base font-extrabold text-slate-950 pt-1 border-t-2 border-slate-900">
                  <span>Grand Net Payable:</span>
                  <span className="text-blue-900">₹{sale.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 5. Signature Footer */}
            <div className="flex justify-between items-end pt-4 mt-4 border-t border-slate-300 text-xs">
              <div className="text-slate-500">
                Customer Signature & Stamp
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">For {activeCompany.name}</div>
                <div className="h-10"></div>
                <div className="text-slate-600 border-t border-slate-400 pt-0.5 inline-block">
                  Authorized Signatory
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
