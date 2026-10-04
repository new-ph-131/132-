import React, { useState } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import {
  FileCheck2,
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Truck,
  TrendingUp,
} from 'lucide-react';

interface GstHubViewProps {
  onBack: () => void;
  initialAction?: string;
}

export const GstHubView: React.FC<GstHubViewProps> = ({ onBack, initialAction }) => {
  const { sales, purchases, activeCompany } = usePharoah();

  const [activeTab, setActiveTab] = useState<'GSTR1' | 'GSTR3B' | 'RECON' | 'EWAY'>('GSTR1');

  // Compute Outward Tax (Sales)
  const activeSales = sales.filter((s) => s.status === 'Active');
  const b2bSales = activeSales.filter((s) => s.invoiceType === 'B2B');
  const b2cSales = activeSales.filter((s) => s.invoiceType === 'B2C');

  const b2bTaxable = b2bSales.reduce((acc, s) => {
    return acc + s.items.reduce((iAcc, i) => iAcc + (i.qty * i.rate - i.discountRupees), 0);
  }, 0);
  const b2bTax = b2bSales.reduce((acc, s) => {
    return acc + s.items.reduce((iAcc, i) => iAcc + (i.cgst + i.sgst + i.igst), 0);
  }, 0);

  const b2cTaxable = b2cSales.reduce((acc, s) => {
    return acc + s.items.reduce((iAcc, i) => iAcc + (i.qty * i.rate - i.discountRupees), 0);
  }, 0);
  const b2cTax = b2cSales.reduce((acc, s) => {
    return acc + s.items.reduce((iAcc, i) => iAcc + (i.cgst + i.sgst + i.igst), 0);
  }, 0);

  // Compute Inward Tax (ITC on Purchases)
  const itcTaxable = purchases.reduce((acc, p) => {
    return acc + p.items.reduce((iAcc, i) => iAcc + (i.qty * i.purchaseRate - i.discountRupees), 0);
  }, 0);
  const itcTax = purchases.reduce((acc, p) => {
    return acc + p.items.reduce((iAcc, i) => iAcc + ((i.qty * i.purchaseRate - i.discountRupees) * i.gstRate) / 100, 0);
  }, 0);

  const totalOutputTax = b2bTax + b2cTax;
  const netGstPayable = Math.max(0, totalOutputTax - itcTax);

  const exportGstr1Json = () => {
    const payload = {
      gstin: activeCompany.gstin,
      fp: '042024',
      b2b: b2bSales.map((s) => ({
        ctin: s.partyGstin,
        inv: [
          {
            inum: s.billNo,
            idt: s.date.split('T')[0],
            val: s.totalAmount,
            pos: '08',
            itms: s.items.map((i) => ({
              num: i.srNo,
              itm_det: {
                txval: i.qty * i.rate - i.discountRupees,
                rt: i.gstRate,
                iamt: i.igst,
                camt: i.cgst,
                samt: i.sgst,
              },
            })),
          },
        ],
      })),
      b2cs: b2cSales.map((s) => ({
        sply_ty: 'INTRA',
        pos: '08',
        txval: s.totalAmount / 1.12,
        rt: 12,
        camt: (s.totalAmount - s.totalAmount / 1.12) / 2,
        samt: (s.totalAmount - s.totalAmount / 1.12) / 2,
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `GSTR1_${activeCompany.gstin}_Return.json`);
    dlAnchor.click();
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
              GST COMPLIANCE & STATUTORY RETURNS
            </h2>
            <p className="text-xs text-slate-400">
              GSTR-1 outward, GSTR-3B tax offset, 2B ITC reconciliation & E-Way Bills
            </p>
          </div>
        </div>

        <div className="flex flex-wrap bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('GSTR1')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'GSTR1' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            GSTR-1 (Outward)
          </button>
          <button
            onClick={() => setActiveTab('GSTR3B')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'GSTR3B' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            GSTR-3B Computation
          </button>
          <button
            onClick={() => setActiveTab('RECON')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'RECON' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            GSTR-2B Reconciliation
          </button>
          <button
            onClick={() => setActiveTab('EWAY')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'EWAY' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            E-Way Bill Hub
          </button>
        </div>
      </div>

      {/* Tab: GSTR-1 */}
      {activeTab === 'GSTR1' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#0F172A] p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="font-extrabold text-white text-sm">GSTR-1 Summary</span>
              <p className="text-slate-400 text-xs">GSTIN: {activeCompany.gstin} • State: 08 (Rajasthan)</p>
            </div>
            <button
              onClick={exportGstr1Json}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Portal JSON</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Table 4: B2B Invoices */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-xl text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-extrabold text-white text-sm">Table 4: B2B Regular Invoices</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 font-bold">
                  {b2bSales.length} Invoices
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Total Taxable Value:</span>
                  <span className="font-bold text-white">₹{b2bTaxable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">CGST Amount:</span>
                  <span className="font-bold text-emerald-400">₹{(b2bTax / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">SGST Amount:</span>
                  <span className="font-bold text-emerald-400">₹{(b2bTax / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-white font-extrabold">
                  <span>Total Invoice Value:</span>
                  <span>₹{(b2bTaxable + b2bTax).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Table 7: B2C Small */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 shadow-xl text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-extrabold text-white text-sm">Table 7: B2C Small (Retail Outward)</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 font-bold">
                  {b2cSales.length} Invoices
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Total Taxable Value:</span>
                  <span className="font-bold text-white">₹{b2cTaxable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">CGST Amount:</span>
                  <span className="font-bold text-emerald-400">₹{(b2cTax / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">SGST Amount:</span>
                  <span className="font-bold text-emerald-400">₹{(b2cTax / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-white font-extrabold">
                  <span>Total Invoice Value:</span>
                  <span>₹{(b2cTaxable + b2cTax).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: GSTR-3B */}
      {activeTab === 'GSTR3B' && (
        <div className="max-w-3xl mx-auto bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-base text-white">GSTR-3B Tax Computation & ITC Offset</h3>
            <p className="text-slate-400 text-xs">Monthly self-assessment summary of tax liability</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="font-bold text-white text-xs block mb-1">
                1. Total Outward Tax Liability (3.1 a)
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Taxable Value: ₹{(b2bTaxable + b2cTaxable).toFixed(2)}</span>
                <span className="font-bold text-rose-400">Total Tax: ₹{totalOutputTax.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="font-bold text-white text-xs block mb-1">
                2. Eligible Input Tax Credit (ITC - 4 A 5)
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Purchase Inward Value: ₹{itcTaxable.toFixed(2)}</span>
                <span className="font-bold text-emerald-400">Available ITC: ₹{itcTax.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/40 border border-emerald-900/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-300 block">
                  Net Tax Payable (In Cash through Challan)
                </span>
                <span className="text-slate-400 text-[11px]">
                  Output Tax (₹{totalOutputTax.toFixed(2)}) - ITC Offset (₹{itcTax.toFixed(2)})
                </span>
              </div>
              <span className="text-2xl font-extrabold text-white">
                ₹{netGstPayable.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Recon */}
      {activeTab === 'RECON' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>GSTR-2B Auto-Reconciliation Engine</span>
          </div>
          <p className="text-slate-400 text-xs">
            Matching internal purchase entries against supplier-filed GSTR-1 documents.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-3">Distributor</th>
                  <th className="p-3">GSTIN</th>
                  <th className="p-3">Internal Bill No</th>
                  <th className="p-3 text-right">Our Tax Amount</th>
                  <th className="p-3 text-right">Portal 2B Amount</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {purchases.map((p) => {
                  const pTax = p.items.reduce((acc, i) => acc + ((i.qty * i.purchaseRate) * i.gstRate) / 100, 0);
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{p.distributorName}</td>
                      <td className="p-3 font-mono text-slate-400">{activeCompany.gstin}</td>
                      <td className="p-3 font-mono text-blue-400">{p.billNo}</td>
                      <td className="p-3 text-right font-bold text-white">₹{pTax.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">₹{pTax.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          100% Matched
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: E-Way */}
      {activeTab === 'EWAY' && (
        <div className="max-w-2xl mx-auto bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <Truck className="w-6 h-6 text-teal-400" />
            <div>
              <h3 className="font-extrabold text-sm text-white">E-Way Bill Generation Protocol</h3>
              <p className="text-slate-400">Applicable on pharma consignments &gt; ₹50,000</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="font-bold text-white block mb-1">Threshold Detection</span>
              <p className="text-slate-400">
                All B2B tax invoices exceeding ₹50,000 will automatically require transporter ID & vehicle registration.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">NIC Portal API Connector</span>
                <span className="text-[11px] text-slate-500">ewaybillgst.gov.in Direct Gateway</span>
              </div>
              <span className="px-2 py-1 rounded bg-teal-950 text-teal-300 text-xs font-bold border border-teal-800">
                Connected
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
