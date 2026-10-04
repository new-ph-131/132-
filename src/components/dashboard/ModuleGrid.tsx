import React from 'react';
import {
  Receipt,
  Truck,
  RotateCcw,
  Boxes,
  Wallet,
  Star,
  FileCheck2,
  CloudUpload,
  Plus,
  ArrowRight,
  Sparkles,
  ClipboardList,
  FileText,
  Layers,
  BookOpen,
} from 'lucide-react';

interface ModuleGridProps {
  onNavigate: (view: string, title?: string) => void;
}

export const ModuleGrid: React.FC<ModuleGridProps> = ({ onNavigate }) => {
  const modules = [
    {
      id: 'BILLING',
      title: 'BILLING & SALES',
      desc: 'GST Tax Invoices, Inward Purchase entries & Stitcher Wizard',
      icon: Receipt,
      accent: 'border-blue-500/40 hover:border-blue-400 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900',
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      actions: [
        { label: '+ New Sale (F2)', view: 'GO_SALE', primary: true },
        { label: '+ Purchase Inward', view: 'GO_PURCHASE' },
        { label: 'Challan Stitcher', view: 'GO_STITCHER' },
        { label: 'Sale Register', view: 'GO_SALE_REG' },
        { label: 'Pur Register', view: 'GO_PUR_REG' },
      ],
    },
    {
      id: 'CHALLANS',
      title: 'CHALLAN MANAGEMENT',
      desc: 'Delivery Challans, Dispatch Slips & Multi-Challan Stitching',
      icon: Truck,
      accent: 'border-teal-500/40 hover:border-teal-400 bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-900',
      iconColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      actions: [
        { label: '+ Sale Challan', view: 'GO_CHALLAN_SALE', primary: true },
        { label: '+ Pur Challan', view: 'GO_CHALLAN_PUR' },
        { label: 'Sale Challan Reg', view: 'GO_CHALLAN_SALE_REG' },
        { label: 'Stitch to Bill', view: 'GO_STITCHER' },
      ],
    },
    {
      id: 'RETURNS',
      title: 'RETURNS & REVERSALS',
      desc: 'Credit Notes (Sales Return) & Debit Notes (Distributor Return)',
      icon: RotateCcw,
      accent: 'border-rose-500/40 hover:border-rose-400 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900',
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      actions: [
        { label: '+ Credit Note (CN)', view: 'GO_CN', primary: true },
        { label: '+ Debit Note (DN)', view: 'GO_DN' },
        { label: 'Breakage / Expiry', view: 'GO_BREAKAGE' },
        { label: 'Return Register', view: 'GO_RET_REG' },
      ],
    },
    {
      id: 'INVENTORY',
      title: 'STOCK & BATCHES',
      desc: 'Autonomous Marg-Style Batches, Valuation, Shortage Alerts',
      icon: Boxes,
      accent: 'border-purple-500/40 hover:border-purple-400 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900',
      iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      actions: [
        { label: 'Stock Valuation', view: 'GO_STOCK', primary: true },
        { label: 'Batch Master', view: 'GO_M_BATCH' },
        { label: 'Shortage Register', view: 'GO_SHORTAGE' },
        { label: 'Item Movement', view: 'GO_ITEM_LEDGER' },
      ],
    },
    {
      id: 'ACCOUNTS',
      title: 'ACCOUNTS & DAYBOOK',
      desc: 'Daybook, Bank Reconciliation, Receipts, Payments & Statements',
      icon: Wallet,
      accent: 'border-indigo-500/40 hover:border-indigo-400 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900',
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      actions: [
        { label: 'Daybook', view: 'GO_DAYBOOK', primary: true },
        { label: '+ Receipt Voucher', view: 'GO_RECEIPT' },
        { label: '+ Payment Voucher', view: 'GO_PAYMENT' },
        { label: 'Party Ledgers', view: 'GO_LEDGERS' },
        { label: 'Bank Book', view: 'GO_BANK_BOOK' },
      ],
    },
    {
      id: 'MASTERS',
      title: 'BUSINESS MASTERS',
      desc: 'Parties, Medicine Master, Numbering Series, Salts, Companies',
      icon: Star,
      accent: 'border-amber-500/40 hover:border-amber-400 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900',
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      actions: [
        { label: 'Party Master', view: 'GO_M_PARTY', primary: true },
        { label: 'Medicine Master', view: 'GO_M_ITEM' },
        { label: 'Batch Master', view: 'GO_M_BATCH' },
        { label: 'Salts & Aux', view: 'GO_M_SALT' },
        { label: 'CA / Auditor Profile', view: 'GO_M_CA' },
      ],
    },
    {
      id: 'GST',
      title: 'GST COMPLIANCE HUB',
      desc: 'GSTR-1, GSTR-3B Tax Computations, GSTR-2 Reconciliation & E-Way',
      icon: FileCheck2,
      accent: 'border-emerald-500/40 hover:border-emerald-400 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900',
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      actions: [
        { label: 'GSTR-1 Summary', view: 'GO_GST_1', primary: true },
        { label: 'GSTR-3B Computation', view: 'GO_GST_3B' },
        { label: 'GSTR-2 Reconciliation', view: 'GO_GST_RECON' },
        { label: 'E-Way Bill System', view: 'GO_EWAY' },
      ],
    },
    {
      id: 'DATA_HUB',
      title: 'DATA EXCHANGE & BACKUP',
      desc: 'Marg ERP CSV Importer, JSON Backup & Excel Report Exports',
      icon: CloudUpload,
      accent: 'border-cyan-500/40 hover:border-cyan-400 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900',
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      actions: [
        { label: 'Marg CSV Importer', view: 'GO_SMART_ENTRY', primary: true },
        { label: 'Backup Database (JSON)', view: 'DATA_HUB' },
        { label: 'Export Registers', view: 'GO_CSV' },
        { label: 'Audit Trail', view: 'GO_HISTORY' },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {modules.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className={`border rounded-xl p-4 transition-all duration-200 shadow-lg flex flex-col justify-between hover:shadow-blue-900/10 hover:-translate-y-0.5 ${m.accent}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className={`p-2.5 rounded-lg border ${m.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <button
                  onClick={() => onNavigate(m.id, m.title)}
                  className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
                >
                  <span>Open Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-extrabold text-sm tracking-wide text-white mb-1">
                {m.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {m.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-1.5">
              {m.actions.map((act, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(act.view, act.label.toUpperCase())}
                  className={`text-left px-2.5 py-1.5 rounded text-[11px] font-semibold transition truncate ${
                    act.primary
                      ? 'bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40'
                      : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
                  }`}
                  title={act.label}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
