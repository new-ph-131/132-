import React, { useState, useEffect } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import { Voucher } from '../../types';
import {
  Wallet,
  Plus,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Trash2,
  Banknote,
  BookOpen,
} from 'lucide-react';

interface VoucherViewProps {
  onBack: () => void;
  initialTabIndex?: number;
  initialAction?: string;
}

export const VoucherView: React.FC<VoucherViewProps> = ({
  onBack,
  initialTabIndex = 0,
  initialAction,
}) => {
  const { parties, vouchers, getNextNumber, addVoucher, cancelVoucher, sales, purchases } =
    usePharoah();

  const [activeTab, setActiveTab] = useState<'NEW' | 'DAYBOOK' | 'BANKBOOK'>('NEW');

  useEffect(() => {
    if (initialTabIndex === 1 || initialAction === 'GO_DAYBOOK') setActiveTab('DAYBOOK');
    if (initialTabIndex === 2 || initialAction === 'GO_BANK_BOOK') setActiveTab('BANKBOOK');
  }, [initialTabIndex, initialAction]);

  // Voucher Form
  const [voucherType, setVoucherType] = useState<Voucher['type']>(
    initialAction === 'GO_PAYMENT' ? 'PAYMENT' : 'RECEIPT'
  );
  const [voucherNo, setVoucherNo] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState(parties[0]?.id || '');
  const [amount, setAmount] = useState<number>(1000);
  const [paymentMode, setPaymentMode] = useState<Voucher['paymentMode']>('Cash');
  const [narration, setNarration] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  const [bankName, setBankName] = useState('STATE BANK OF INDIA');

  // Daybook Date Filter
  const [daybookDate, setDaybookDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setVoucherNo(getNextNumber(voucherType === 'RECEIPT' ? 'RECEIPT' : 'PAYMENT'));
  }, [voucherType]);

  const selectedParty = parties.find((p) => p.id === selectedPartyId);

  const handleSaveVoucher = () => {
    if (!selectedParty) return;
    if (amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    addVoucher({
      type: voucherType,
      voucherNo,
      date: new Date().toISOString(),
      partyId: selectedParty.id,
      partyName: selectedParty.name,
      amount,
      paymentMode,
      narration: narration || `${voucherType} from ${selectedParty.name}`,
      status: 'Active',
      linkedBillNumbers: [],
      chequeNo,
      bankName: paymentMode === 'Cheque' || paymentMode === 'Bank' ? bankName : '',
      depositedIn: bankName,
      roundOff: 0,
    });

    alert(`${voucherType} voucher ${voucherNo} of ₹${amount} saved!`);
    setAmount(1000);
    setNarration('');
    setVoucherNo(getNextNumber(voucherType === 'RECEIPT' ? 'RECEIPT' : 'PAYMENT'));
    setActiveTab('DAYBOOK');
  };

  // Daybook compilation
  const daySales = sales.filter((s) => s.date.startsWith(daybookDate) && s.status === 'Active');
  const dayPurchases = purchases.filter((p) => p.date.startsWith(daybookDate));
  const dayVouchers = vouchers.filter((v) => v.date.startsWith(daybookDate) && v.status === 'Active');

  const totalReceipts = dayVouchers
    .filter((v) => v.type === 'RECEIPT')
    .reduce((sum, v) => sum + v.amount, 0);

  const totalPayments = dayVouchers
    .filter((v) => v.type === 'PAYMENT' || v.type === 'EXPENSE')
    .reduce((sum, v) => sum + v.amount, 0);

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
              FINANCIAL ACCOUNTS & VOUCHER HUB
            </h2>
            <p className="text-xs text-slate-400">
              Receipts, payments, contra transfers, daybook ledger & cash transactions
            </p>
          </div>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('NEW')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'NEW' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            + Voucher Entry
          </button>
          <button
            onClick={() => setActiveTab('DAYBOOK')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'DAYBOOK' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily Daybook
          </button>
          <button
            onClick={() => setActiveTab('BANKBOOK')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'BANKBOOK' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bank Book
          </button>
        </div>
      </div>

      {activeTab === 'NEW' && (
        <div className="max-w-2xl mx-auto bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-sm text-white">New Financial Voucher</h3>
            <span className="font-mono text-indigo-400 font-bold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800">
              {voucherNo}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Voucher Type</label>
              <select
                value={voucherType}
                onChange={(e) => setVoucherType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
              >
                <option value="RECEIPT">RECEIPT (Collection from Debtor)</option>
                <option value="PAYMENT">PAYMENT (Paid to Creditor)</option>
                <option value="CONTRA">CONTRA (Cash / Bank Deposit)</option>
                <option value="EXPENSE">EXPENSE (Office Expense)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Payment Method</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
              >
                <option value="Cash">Cash Counter</option>
                <option value="Bank">Direct Bank Transfer / NEFT</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Cheque">Bank Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Account / Party *</label>
            <select
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
            >
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.group}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Voucher Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-base font-extrabold text-emerald-400"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Bank Name / Ledger</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
              />
            </div>
          </div>

          {paymentMode === 'Cheque' && (
            <div>
              <label className="font-bold text-slate-300 block mb-1">Cheque Number</label>
              <input
                type="text"
                placeholder="6-digit cheque number"
                value={chequeNo}
                onChange={(e) => setChequeNo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>
          )}

          <div>
            <label className="font-bold text-slate-300 block mb-1">Narration / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Part payment received via RTGS towards invoice INV-1001"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveVoucher}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition"
            >
              Save & Post Voucher Entry
            </button>
          </div>
        </div>
      )}

      {activeTab === 'DAYBOOK' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#0F172A] p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-slate-300">Select Date:</span>
              <input
                type="date"
                value={daybookDate}
                onChange={(e) => setDaybookDate(e.target.value)}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white font-semibold"
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-emerald-400 font-bold">
                Total Inflows (Receipts): ₹{totalReceipts.toFixed(2)}
              </span>
              <span className="text-rose-400 font-bold">
                Total Outflows (Payments): ₹{totalPayments.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Doc / Voucher No</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Party / Account</th>
                    <th className="p-3">Narration</th>
                    <th className="p-3 text-right">Debit (Dr ₹)</th>
                    <th className="p-3 text-right">Credit (Cr ₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {/* Sales of the day */}
                  {daySales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-blue-400 font-bold">{s.billNo}</td>
                      <td className="p-3 text-slate-300">SALE INVOICE</td>
                      <td className="p-3 font-bold text-white">{s.partyName}</td>
                      <td className="p-3 text-slate-400">Goods sold on {s.paymentMode}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        ₹{s.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-slate-500">-</td>
                    </tr>
                  ))}

                  {/* Purchases of the day */}
                  {dayPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-amber-400 font-bold">{p.internalNo}</td>
                      <td className="p-3 text-slate-300">PURCHASE ENTRY</td>
                      <td className="p-3 font-bold text-white">{p.distributorName}</td>
                      <td className="p-3 text-slate-400">Goods received (Inv {p.billNo})</td>
                      <td className="p-3 text-right text-slate-500">-</td>
                      <td className="p-3 text-right font-bold text-rose-400">
                        ₹{p.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {/* Vouchers of the day */}
                  {dayVouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-indigo-400 font-bold">{v.voucherNo}</td>
                      <td className="p-3 font-semibold text-slate-300">{v.type}</td>
                      <td className="p-3 font-bold text-white">{v.partyName}</td>
                      <td className="p-3 text-slate-400">{v.narration} ({v.paymentMode})</td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        {v.type === 'RECEIPT' ? `₹${v.amount.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-3 text-right font-bold text-rose-400">
                        {v.type !== 'RECEIPT' ? `₹${v.amount.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}

                  {daySales.length === 0 && dayPurchases.length === 0 && dayVouchers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No financial transactions recorded on {daybookDate}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'BANKBOOK' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-xl p-4 text-xs space-y-3">
          <h3 className="font-extrabold text-sm text-white">Bank & Cash Accounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 font-semibold mb-1">State Bank of India (Chetek Circle)</div>
              <div className="font-mono text-slate-300">A/C: 30495810294</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-2">₹1,45,000.00</div>
              <div className="text-[11px] text-slate-500 mt-1">Status: Reconciled</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 font-semibold mb-1">HDFC Bank Ltd (Madhuban)</div>
              <div className="font-mono text-slate-300">A/C: 502000234190</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-2">₹82,500.00</div>
              <div className="text-[11px] text-slate-500 mt-1">Status: Active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
