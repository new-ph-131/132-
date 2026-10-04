import React from 'react';
import { usePharoah } from '../../context/PharoahContext';
import {
  TrendingUp,
  ShoppingCart,
  ArrowDownRight,
  ArrowUpRight,
  PackageCheck,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface KpiStripProps {
  onNavigate: (view: string, title?: string) => void;
}

export const KpiStrip: React.FC<KpiStripProps> = ({ onNavigate }) => {
  const {
    sales,
    purchases,
    totalReceivables,
    totalPayables,
    totalStockValuation,
    batchHistory,
    shortages,
  } = usePharoah();

  // Calculate today's sales
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales
    .filter((s) => s.status === 'Active' && s.date.startsWith(todayStr))
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const allTimeSales = sales
    .filter((s) => s.status === 'Active')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const todayPurchases = purchases
    .filter((p) => p.date.startsWith(todayStr))
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const allPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  // Near expiry batches count (< 90 days)
  let nearExpiryCount = 0;
  const now = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(now.getDate() + 90);

  Object.values(batchHistory).forEach((batches) => {
    batches.forEach((b) => {
      if (b.qty > 0 && b.exp) {
        // format could be MM/YY or YYYY-MM
        let expDate: Date | null = null;
        if (b.exp.includes('/')) {
          const [m, y] = b.exp.split('/');
          const fullYear = parseInt(y, 10) < 100 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
          expDate = new Date(fullYear, parseInt(m, 10), 0);
        } else if (b.exp.includes('-')) {
          expDate = new Date(b.exp);
        }
        if (expDate && expDate <= ninetyDaysFromNow) {
          nearExpiryCount++;
        }
      }
    });
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Today's Sales */}
      <div
        onClick={() => onNavigate('GO_SALE_REG', 'SALES REGISTER')}
        className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 p-3.5 rounded-xl cursor-pointer transition shadow-md group relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Sale Today</span>
          <TrendingUp className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-xl font-extrabold text-white tracking-tight">
          ₹{todaySales > 0 ? todaySales.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : allTimeSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </div>
        <div className="text-[10px] text-blue-400 mt-1 flex items-center gap-1 font-semibold">
          <span>{sales.filter((s) => s.status === 'Active').length} Active Invoices</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
      </div>

      {/* 2. Purchases */}
      <div
        onClick={() => onNavigate('GO_PUR_REG', 'PURCHASE REGISTER')}
        className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-xl cursor-pointer transition shadow-md group relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Purchases</span>
          <ShoppingCart className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-xl font-extrabold text-white tracking-tight">
          ₹{todayPurchases > 0 ? todayPurchases.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : allPurchases.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </div>
        <div className="text-[10px] text-amber-400 mt-1 font-semibold">
          {purchases.length} Inward Entries
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>
      </div>

      {/* 3. Debtors Outstanding */}
      <div
        onClick={() => onNavigate('GO_LEDGERS', 'PARTY LEDGERS')}
        className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-xl cursor-pointer transition shadow-md group relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Receivables</span>
          <ArrowDownRight className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-xl font-extrabold text-emerald-400 tracking-tight">
          ₹{totalReceivables.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </div>
        <div className="text-[10px] text-slate-400 mt-1 font-medium">
          From Sundry Debtors
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
      </div>

      {/* 4. Creditors Outstanding */}
      <div
        onClick={() => onNavigate('GO_LEDGERS', 'PARTY LEDGERS')}
        className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/50 p-3.5 rounded-xl cursor-pointer transition shadow-md group relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Payables</span>
          <ArrowUpRight className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-xl font-extrabold text-rose-400 tracking-tight">
          ₹{totalPayables.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </div>
        <div className="text-[10px] text-slate-400 mt-1 font-medium">
          To Distributors
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500"></div>
      </div>

      {/* 5. Total Stock Valuation */}
      <div
        onClick={() => onNavigate('GO_STOCK', 'INVENTORY VALUATION')}
        className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/50 p-3.5 rounded-xl cursor-pointer transition shadow-md group relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Stock Value</span>
          <PackageCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-xl font-extrabold text-purple-300 tracking-tight">
          ₹{totalStockValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </div>
        <div className="text-[10px] text-purple-400 mt-1 font-semibold">
          Taxable Net Basis
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
      </div>

      {/* 6. Expiry & Shortage Alerts */}
      <div
        onClick={() => onNavigate(nearExpiryCount > 0 ? 'GO_M_BATCH' : 'GO_SHORTAGE', 'STOCK ALERTS')}
        className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-orange-500/50 p-3.5 rounded-xl cursor-pointer transition shadow-md group relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Stock Alerts</span>
          <Clock className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xl font-extrabold ${nearExpiryCount > 0 ? 'text-orange-400' : 'text-slate-300'}`}>
            {nearExpiryCount}
          </span>
          <span className="text-[10px] text-slate-400">Near Expiry</span>
        </div>
        <div className="text-[10px] text-rose-400 font-semibold mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          <span>{shortages.length} Shortage Items</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></div>
      </div>
    </div>
  );
};
