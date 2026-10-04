import React, { useState } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import { Party } from '../../types';
import {
  BookOpen,
  ArrowLeft,
  Printer,
  Download,
  Calendar,
  Building,
} from 'lucide-react';

interface LedgerViewProps {
  onBack: () => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ onBack }) => {
  const { parties, sales, purchases, vouchers, saleReturns, purchaseReturns, activeCompany } =
    usePharoah();

  const [selectedPartyId, setSelectedPartyId] = useState(parties[0]?.id || '');

  const party = parties.find((p) => p.id === selectedPartyId) || parties[0];

  // Compile full ledger entries for this party
  interface LedgerRow {
    date: string;
    docNo: string;
    type: string;
    particulars: string;
    debit: number;
    credit: number;
    balance: number;
  }

  const rows: LedgerRow[] = [];
  let runningBal = party ? party.opBal || 0 : 0;

  // Opening Balance Row
  rows.push({
    date: '2024-04-01',
    docNo: 'OB',
    type: 'OPENING',
    particulars: 'Opening Balance b/f',
    debit: party && party.group === 'Sundry Debtors' ? party.opBal : 0,
    credit: party && party.group === 'Sundry Creditors' ? party.opBal : 0,
    balance: runningBal,
  });

  if (party) {
    // 1. Sales
    sales
      .filter((s) => s.partyId === party.id && s.status === 'Active')
      .forEach((s) => {
        runningBal += s.totalAmount;
        rows.push({
          date: s.date.split('T')[0],
          docNo: s.billNo,
          type: 'SALE INVOICE',
          particulars: `GST Tax Invoice (${s.paymentMode})`,
          debit: s.totalAmount,
          credit: 0,
          balance: runningBal,
        });
      });

    // 2. Purchases
    purchases
      .filter((p) => p.partyId === party.id)
      .forEach((p) => {
        runningBal += p.totalAmount;
        rows.push({
          date: p.date.split('T')[0],
          docNo: p.internalNo,
          type: 'PURCHASE ENTRY',
          particulars: `Inward Supply (Inv: ${p.billNo})`,
          debit: 0,
          credit: p.totalAmount,
          balance: runningBal,
        });
      });

    // 3. Vouchers
    vouchers
      .filter((v) => v.partyId === party.id && v.status === 'Active')
      .forEach((v) => {
        if (v.type === 'RECEIPT') {
          runningBal -= v.amount;
          rows.push({
            date: v.date.split('T')[0],
            docNo: v.voucherNo,
            type: 'RECEIPT VOUCHER',
            particulars: `${v.narration} (${v.paymentMode})`,
            debit: 0,
            credit: v.amount,
            balance: runningBal,
          });
        } else if (v.type === 'PAYMENT') {
          runningBal -= v.amount;
          rows.push({
            date: v.date.split('T')[0],
            docNo: v.voucherNo,
            type: 'PAYMENT VOUCHER',
            particulars: `${v.narration} (${v.paymentMode})`,
            debit: v.amount,
            credit: 0,
            balance: runningBal,
          });
        }
      });

    // 4. Returns
    saleReturns
      .filter((r) => r.partyName === party.name && r.status === 'Active')
      .forEach((r) => {
        runningBal -= r.totalAmount;
        rows.push({
          date: r.date.split('T')[0],
          docNo: r.billNo,
          type: 'CREDIT NOTE',
          particulars: `Sales Return (${r.returnType})`,
          debit: 0,
          credit: r.totalAmount,
          balance: runningBal,
        });
      });
  }

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
              PARTY LEDGER ACCOUNT STATEMENT
            </h2>
            <p className="text-xs text-slate-400">
              Dr / Cr chronological ledger statements with live running balance
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow"
        >
          <Printer className="w-4 h-4" />
          <span>Print Statement</span>
        </button>
      </div>

      {/* Select Party */}
      <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <label className="font-bold text-slate-300 block mb-1">Select Account / Party:</label>
          <select
            value={selectedPartyId}
            onChange={(e) => setSelectedPartyId(e.target.value)}
            className="w-full md:w-96 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-xs"
          >
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.group}]
              </option>
            ))}
          </select>
        </div>

        {party && (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Closing Balance</span>
            <span className={`text-xl font-extrabold ${runningBal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{Math.abs(runningBal).toFixed(2)} {runningBal >= 0 ? 'Dr' : 'Cr'}
            </span>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-white">{party?.name}</h3>
            <p className="text-xs text-slate-400">
              GSTIN: {party?.gst || 'URP'} • DL: {party?.dl || 'N/A'} • {party?.address}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                <th className="p-3">Date</th>
                <th className="p-3">Voucher / Bill No</th>
                <th className="p-3">Type</th>
                <th className="p-3">Particulars</th>
                <th className="p-3 text-right">Debit (₹)</th>
                <th className="p-3 text-right">Credit (₹)</th>
                <th className="p-3 text-right">Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="p-3 text-slate-300 whitespace-nowrap">{r.date}</td>
                  <td className="p-3 font-mono font-bold text-blue-400">{r.docNo}</td>
                  <td className="p-3 font-semibold text-slate-300">{r.type}</td>
                  <td className="p-3 text-slate-300">{r.particulars}</td>
                  <td className="p-3 text-right font-bold text-emerald-400">
                    {r.debit > 0 ? `₹${r.debit.toFixed(2)}` : '-'}
                  </td>
                  <td className="p-3 text-right font-bold text-rose-400">
                    {r.credit > 0 ? `₹${r.credit.toFixed(2)}` : '-'}
                  </td>
                  <td className="p-3 text-right font-extrabold text-white text-sm">
                    ₹{Math.abs(r.balance).toFixed(2)} {r.balance >= 0 ? 'Dr' : 'Cr'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
