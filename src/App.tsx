import React, { useState } from 'react';
import { usePharoah } from './context/PharoahContext';
import { TopBar } from './components/layout/TopBar';
import { RecentSidebar } from './components/layout/RecentSidebar';
import { KpiStrip } from './components/dashboard/KpiStrip';
import { ModuleGrid } from './components/dashboard/ModuleGrid';
import { InvoiceFeed } from './components/dashboard/InvoiceFeed';
import { InvoicePrintModal } from './components/modals/InvoicePrintModal';

// Views
import { NewSaleView } from './views/billing/NewSaleView';
import { SaleSummaryView } from './views/billing/SaleSummaryView';
import { PurchaseEntryView } from './views/billing/PurchaseEntryView';
import { PurchaseSummaryView } from './views/billing/PurchaseSummaryView';
import { ChallanStitcherWizard } from './views/challans/ChallanStitcherWizard';
import { SaleChallanView } from './views/challans/SaleChallanView';
import { ReturnsView } from './views/returns/ReturnsView';
import { ProductMasterView } from './views/inventory/ProductMasterView';
import { BatchMasterView } from './views/inventory/BatchMasterView';
import { ShortageRegisterView } from './views/inventory/ShortageRegisterView';
import { VoucherView } from './views/accounts/VoucherView';
import { LedgerView } from './views/accounts/LedgerView';
import { PartyMasterView } from './views/masters/PartyMasterView';
import { AuxMastersView } from './views/masters/AuxMastersView';
import { GstHubView } from './views/gst/GstHubView';
import { DataExchangeHubView } from './views/data_exchange/DataExchangeHubView';

import { Sale } from './types';
import { ChevronRight, Home } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, login } = usePharoah();

  const [currentView, setCurrentView] = useState<string>('HOME');
  const [currentViewTitle, setCurrentViewTitle] = useState<string>('MAIN BUSINESS MODULES');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Invoice Print Modal State
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState<Sale | null>(null);

  // Recent shortcuts history
  const [recentShortcuts, setRecentShortcuts] = useState<
    Array<{ title: string; module: string }>
  >([
    { title: 'New Sale (F2)', module: 'GO_SALE' },
    { title: 'Challan Stitcher', module: 'GO_STITCHER' },
    { title: 'Stock Valuation', module: 'GO_STOCK' },
    { title: 'Daily Daybook', module: 'GO_DAYBOOK' },
  ]);

  const handleNavigate = (view: string, title?: string) => {
    const formattedTitle = title || view.replace('GO_', '').replace('_', ' ');
    setCurrentView(view);
    setCurrentViewTitle(formattedTitle.toUpperCase());

    // Update recent shortcuts
    if (view !== 'HOME') {
      setRecentShortcuts((prev) => {
        const filtered = prev.filter((item) => item.module !== view);
        return [{ title: formattedTitle, module: view }, ...filtered.slice(0, 7)];
      });
    }
  };

  const handleRemoveShortcut = (index: number) => {
    setRecentShortcuts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllShortcuts = () => {
    setRecentShortcuts([]);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col font-sans">
      {/* Workstation Top Navigation */}
      <TopBar
        currentView={currentView}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex flex-1 items-start">
        {/* Sidebar */}
        <RecentSidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          recentShortcuts={recentShortcuts}
          onRemoveShortcut={handleRemoveShortcut}
          onClearAll={handleClearAllShortcuts}
        />

        {/* Main Content Pane */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-[1600px] w-full mx-auto space-y-4">
          {/* Breadcrumb strip */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 py-1">
            <button
              onClick={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')}
              className="hover:text-blue-400 transition flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Pharoah ERP</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-bold text-slate-200">{currentViewTitle}</span>
          </div>

          {/* VIEW ROUTER */}
          {currentView === 'HOME' && (
            <div className="space-y-5">
              <KpiStrip onNavigate={handleNavigate} />
              <ModuleGrid onNavigate={handleNavigate} />
              <InvoiceFeed
                onViewInvoice={(sale) => setActiveInvoiceForPrint(sale)}
                onNavigate={handleNavigate}
              />
            </div>
          )}

          {/* BILLING ROUTES */}
          {currentView === 'BILLING' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleNavigate('GO_SALE', 'NEW TAX INVOICE')}
                  className="p-6 rounded-xl bg-gradient-to-br from-blue-900/60 to-slate-900 border border-blue-500/40 hover:border-blue-400 text-left transition shadow-lg group"
                >
                  <h3 className="font-extrabold text-base text-white group-hover:text-blue-300">
                    + New GST Sale Invoice (F2)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct counter billing with autonomous batch lookups, tax calculations & thermal printing
                  </p>
                </button>

                <button
                  onClick={() => handleNavigate('GO_PURCHASE', 'PURCHASE ENTRY')}
                  className="p-6 rounded-xl bg-gradient-to-br from-amber-900/60 to-slate-900 border border-amber-500/40 hover:border-amber-400 text-left transition shadow-lg group"
                >
                  <h3 className="font-extrabold text-base text-white group-hover:text-amber-300">
                    + Inward Purchase Supply
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Record supplier invoices, lot arrivals, batch creation & inventory updates
                  </p>
                </button>

                <button
                  onClick={() => handleNavigate('GO_STITCHER', 'CHALLAN STITCHER')}
                  className="p-6 rounded-xl bg-gradient-to-br from-teal-900/60 to-slate-900 border border-teal-500/40 hover:border-teal-400 text-left transition shadow-lg group"
                >
                  <h3 className="font-extrabold text-base text-white group-hover:text-teal-300">
                    Challan-to-Bill Stitcher
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Consolidate multiple delivery challans into a single GST tax invoice
                  </p>
                </button>
              </div>

              <SaleSummaryView
                onBack={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')}
                onNewSale={() => handleNavigate('GO_SALE', 'NEW TAX INVOICE')}
                onViewInvoice={(sale) => setActiveInvoiceForPrint(sale)}
              />
            </div>
          )}

          {currentView === 'GO_SALE' && (
            <NewSaleView
              onBack={() => handleNavigate('BILLING', 'BILLING & SALES')}
              onInvoiceCreated={(sale) => setActiveInvoiceForPrint(sale)}
            />
          )}

          {currentView === 'GO_SALE_REG' && (
            <SaleSummaryView
              onBack={() => handleNavigate('BILLING', 'BILLING & SALES')}
              onNewSale={() => handleNavigate('GO_SALE', 'NEW TAX INVOICE')}
              onViewInvoice={(sale) => setActiveInvoiceForPrint(sale)}
            />
          )}

          {currentView === 'GO_PURCHASE' && (
            <PurchaseEntryView
              onBack={() => handleNavigate('BILLING', 'BILLING & SALES')}
              onPurchaseCreated={() => handleNavigate('GO_PUR_REG', 'PURCHASE REGISTER')}
            />
          )}

          {currentView === 'GO_PUR_REG' && (
            <PurchaseSummaryView
              onBack={() => handleNavigate('BILLING', 'BILLING & SALES')}
              onNewPurchase={() => handleNavigate('GO_PURCHASE', 'PURCHASE ENTRY')}
            />
          )}

          {/* CHALLANS */}
          {currentView === 'GO_STITCHER' && (
            <ChallanStitcherWizard
              onBack={() => handleNavigate('CHALLANS', 'CHALLAN MANAGEMENT')}
              onInvoiceCreated={(sale) => setActiveInvoiceForPrint(sale)}
            />
          )}

          {(currentView === 'CHALLANS' ||
            currentView === 'GO_CHALLAN_SALE' ||
            currentView === 'GO_CHALLAN_SALE_REG' ||
            currentView === 'GO_CHALLAN_PUR') && (
            <SaleChallanView
              onBack={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')}
              onOpenStitcher={() => handleNavigate('GO_STITCHER', 'CHALLAN STITCHER')}
            />
          )}

          {/* RETURNS */}
          {(currentView === 'RETURNS' ||
            currentView === 'GO_CN' ||
            currentView === 'GO_DN' ||
            currentView === 'GO_BREAKAGE' ||
            currentView === 'GO_RET_REG') && (
            <ReturnsView
              onBack={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')}
              initialAction={currentView}
            />
          )}

          {/* INVENTORY */}
          {(currentView === 'INVENTORY' ||
            currentView === 'GO_STOCK' ||
            currentView === 'GO_M_ITEM' ||
            currentView === 'GO_ITEM_LEDGER') && (
            <ProductMasterView onBack={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')} />
          )}

          {currentView === 'GO_M_BATCH' && (
            <BatchMasterView onBack={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')} />
          )}

          {currentView === 'GO_SHORTAGE' && (
            <ShortageRegisterView onBack={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')} />
          )}

          {/* ACCOUNTS */}
          {(currentView === 'ACCOUNTS' ||
            currentView === 'GO_RECEIPT' ||
            currentView === 'GO_PAYMENT' ||
            currentView === 'GO_CONTRA' ||
            currentView === 'GO_DAYBOOK' ||
            currentView === 'GO_BANK_BOOK') && (
            <VoucherView
              onBack={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')}
              initialAction={currentView}
            />
          )}

          {currentView === 'GO_LEDGERS' && (
            <LedgerView onBack={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')} />
          )}

          {/* MASTERS */}
          {(currentView === 'MASTERS' || currentView === 'GO_M_PARTY') && (
            <PartyMasterView onBack={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')} />
          )}

          {(currentView === 'GO_M_COMP' ||
            currentView === 'GO_M_SALT' ||
            currentView === 'GO_M_ROUTE' ||
            currentView === 'GO_M_SERIES' ||
            currentView === 'GO_M_CA') && (
            <AuxMastersView onBack={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')} />
          )}

          {/* GST */}
          {(currentView === 'GST' ||
            currentView === 'GO_GST_1' ||
            currentView === 'GO_GST_3B' ||
            currentView === 'GO_GST_RECON' ||
            currentView === 'GO_EWAY') && (
            <GstHubView
              onBack={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')}
              initialAction={currentView}
            />
          )}

          {/* DATA EXCHANGE */}
          {(currentView === 'DATA_HUB' ||
            currentView === 'GO_SMART_ENTRY' ||
            currentView === 'GO_CSV' ||
            currentView === 'GO_HISTORY') && (
            <DataExchangeHubView
              onBack={() => handleNavigate('HOME', 'MAIN BUSINESS MODULES')}
              initialAction={currentView}
            />
          )}
        </main>
      </div>

      {/* Printable Invoice Modal */}
      {activeInvoiceForPrint && (
        <InvoicePrintModal
          sale={activeInvoiceForPrint}
          onClose={() => setActiveInvoiceForPrint(null)}
        />
      )}
    </div>
  );
};
