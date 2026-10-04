import React, { useState } from 'react';
import { usePharoah } from '../../context/PharoahContext';
import {
  CloudUpload,
  Download,
  Upload,
  FileText,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  Database,
  Layers,
} from 'lucide-react';

interface DataExchangeHubViewProps {
  onBack: () => void;
  initialAction?: string;
}

export const DataExchangeHubView: React.FC<DataExchangeHubViewProps> = ({
  onBack,
  initialAction,
}) => {
  const {
    exportDatabaseJson,
    importDatabaseJson,
    resetToDemoData,
    addMedicine,
    medicines,
    parties,
    sales,
    purchases,
    totalStockValuation,
  } = usePharoah();

  const [activeTab, setActiveTab] = useState<'BACKUP' | 'MARG_IMPORT' | 'CSV_EXPORT'>('BACKUP');

  // Marg CSV / Text Importer state
  const [margCsvText, setMargCsvText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // JSON Import state
  const [jsonInput, setJsonInput] = useState('');

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJson();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Pharoah_ERP_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJson = () => {
    if (!jsonInput.trim()) return;
    const success = importDatabaseJson(jsonInput.trim());
    if (success) {
      alert('Database successfully restored from JSON backup!');
      setJsonInput('');
    } else {
      alert('Failed to parse backup JSON. Please check file format.');
    }
  };

  // Marg ERP CSV / Text Batch Importer
  const handleParseMargCsv = () => {
    if (!margCsvText.trim()) return;
    const lines = margCsvText.trim().split('\n');
    let importedCount = 0;

    lines.forEach((line) => {
      // Common Marg format: Name, Packing, MRP, PurRate, RateA, Batch, Exp, Qty
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 3) {
        const prodName = parts[0];
        const pack = parts[1] || '10 TAB';
        const mrp = parseFloat(parts[2]) || 100;
        const purRate = parseFloat(parts[3]) || mrp * 0.7;
        const rateA = parseFloat(parts[4]) || mrp * 0.85;
        const batch = parts[5] || `BT-${Math.floor(100 + Math.random() * 900)}`;
        const exp = parts[6] || '12/26';
        const qty = parseFloat(parts[7]) || 100;

        addMedicine(
          {
            systemId: `PH-${Math.floor(10000 + Math.random() * 90000)}`,
            uniqueCode: prodName.slice(0, 6).toUpperCase(),
            name: prodName.toUpperCase(),
            packing: pack,
            companyId: 'CP-00001',
            saltId: 'SL-00001',
            drugTypeId: 'DT-01',
            rackNo: 'R-01',
            hsnCode: '30049099',
            conversion: 1,
            reorderLevel: 20,
            gst: 12,
            mrp,
            purRate,
            rateA,
            rateB: rateA * 0.96,
            rateC: rateA * 0.92,
            stock: qty,
            drugForm: 'TAB',
            isNarcotic: false,
            isScheduleH1: false,
            storageCondition: 'Room Temp',
          },
          {
            batch,
            exp,
            packing: pack,
            mrp,
            rate: rateA,
            qty,
            openingQty: qty,
            adjustmentQty: 0,
            breakageQty: 0,
            adjReason: 'Imported from Marg CSV',
            purRate,
            rateA,
            rateB: rateA * 0.96,
            rateC: rateA * 0.92,
            rateCFormula: 0,
            appliedRateType: 'A',
            status: 'Active',
          }
        );
        importedCount++;
      }
    });

    setImportStatus(`Successfully ingested ${importedCount} items into Medicine Master & Batches!`);
    setMargCsvText('');
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
              DATA EXCHANGE & SMART ENTRY HUB
            </h2>
            <p className="text-xs text-slate-400">
              Marg ERP CSV migration, full JSON backups, report exports & data resilience
            </p>
          </div>
        </div>

        <div className="flex flex-wrap bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'BACKUP' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Backup & Restore
          </button>
          <button
            onClick={() => setActiveTab('MARG_IMPORT')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'MARG_IMPORT' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Marg CSV Importer
          </button>
          <button
            onClick={() => setActiveTab('CSV_EXPORT')}
            className={`px-3 py-1 rounded font-bold transition ${
              activeTab === 'CSV_EXPORT' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Export All Registers
          </button>
        </div>
      </div>

      {/* Tab: Backup & Restore */}
      {activeTab === 'BACKUP' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm pb-2 border-b border-slate-800">
              <Download className="w-5 h-5" />
              <span>Full ERP Database Backup</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Export all medicines, autonomous batches, party ledger records, sales, purchases, and numbering series into a secure JSON snapshot.
            </p>

            <div className="p-3 bg-slate-900 rounded-lg space-y-1 text-slate-300">
              <div>Medicines: <strong>{medicines.length}</strong></div>
              <div>Parties: <strong>{parties.length}</strong></div>
              <div>Sales Invoices: <strong>{sales.length}</strong></div>
              <div>Purchases: <strong>{purchases.length}</strong></div>
            </div>

            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Complete Backup (.JSON)</span>
            </button>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-blue-400 font-extrabold text-sm pb-2 border-b border-slate-800">
              <Upload className="w-5 h-5" />
              <span>Restore Database from Backup</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Paste previously exported backup JSON content to restore the complete workstation.
            </p>

            <textarea
              rows={4}
              placeholder="Paste JSON database dump here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-[11px]"
            />

            <button
              onClick={handleImportJson}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition"
            >
              Parse & Restore Database
            </button>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  if (confirm('Restore pristine demo dataset? Current custom records will be overwritten.')) {
                    resetToDemoData();
                    alert('Database reset to initial sample demo data.');
                  }
                }}
                className="w-full py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-semibold text-xs border border-rose-800 transition"
              >
                Reset to Pristine Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Marg CSV Importer */}
      {activeTab === 'MARG_IMPORT' && (
        <div className="max-w-3xl mx-auto bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-sm text-white">Marg ERP CSV / Batch Text Importer</h3>
            <p className="text-slate-400 text-xs">
              Directly import medicines and lots from Marg ERP CSV exports. Format: Name, Pack, MRP, PurRate, RateA, Batch, Exp, Qty
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Sample Data or Paste CSV Text:
            </label>
            <textarea
              rows={6}
              value={margCsvText}
              onChange={(e) => setMargCsvText(e.target.value)}
              placeholder={`DOLO 650 MG, 15 TAB, 30.91, 25.40, 28.50, DL-9901, 10/26, 120
AZITHRAL 500, 5 TAB, 119.50, 88.00, 108.00, AZ-8802, 08/26, 50`}
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setMargCsvText(`BECOSULES CAPSULES, 20 CAP, 54.00, 38.00, 48.00, BC-104, 11/26, 200
GLYCOMET GP 2, 10 TAB, 145.00, 105.00, 128.00, GP-881, 09/26, 80
MONTAIR LC, 10 TAB, 210.00, 155.00, 185.00, ML-442, 07/26, 100`);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              + Load Sample Marg CSV Rows
            </button>

            <button
              onClick={handleParseMargCsv}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition"
            >
              Ingest & Build Batches
            </button>
          </div>

          {importStatus && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab: CSV Export */}
      {activeTab === 'CSV_EXPORT' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-white text-sm">Medicine Catalog</div>
            <p className="text-slate-400">{medicines.length} registered products</p>
            <button
              onClick={() => {
                const headers = ['Name', 'Packing', 'MRP', 'Pur Rate', 'Rate A', 'Stock'];
                const rows = medicines.map((m) => [m.name, m.packing, m.mrp, m.purRate, m.rateA, m.stock]);
                const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                const link = document.createElement('a');
                link.href = encodeURI(csv);
                link.download = 'Medicines.csv';
                link.click();
              }}
              className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
            >
              Download CSV
            </button>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-white text-sm">Parties & Debtors</div>
            <p className="text-slate-400">{parties.length} accounts</p>
            <button
              onClick={() => {
                const headers = ['Name', 'Group', 'Phone', 'GSTIN', 'DL No', 'City'];
                const rows = parties.map((p) => [p.name, p.group, p.phone, p.gst, p.dl, p.city]);
                const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                const link = document.createElement('a');
                link.href = encodeURI(csv);
                link.download = 'Parties.csv';
                link.click();
              }}
              className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
            >
              Download CSV
            </button>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-white text-sm">Sales Register</div>
            <p className="text-slate-400">{sales.length} invoices</p>
            <button
              onClick={() => {
                const headers = ['Bill No', 'Date', 'Party', 'Mode', 'Total'];
                const rows = sales.map((s) => [s.billNo, s.date.split('T')[0], s.partyName, s.paymentMode, s.totalAmount]);
                const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                const link = document.createElement('a');
                link.href = encodeURI(csv);
                link.download = 'Sales_Register.csv';
                link.click();
              }}
              className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
            >
              Download CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
