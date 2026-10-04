import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Medicine,
  BatchInfo,
  Party,
  Sale,
  Purchase,
  SaleChallan,
  PurchaseChallan,
  SaleReturn,
  PurchaseReturn,
  Voucher,
  ShortageItem,
  Company,
  Salt,
  RouteArea,
  NumberingSeries,
  CompanyProfile,
  SystemUser,
  LogEntry,
  BillItem,
  PurchaseItem,
} from '../types';
import {
  initialCompanyProfile,
  initialSystemUsers,
  initialMedicines,
  initialBatchHistory,
  initialParties,
  initialCompanies,
  initialSalts,
  initialRoutes,
  initialNumberingSeries,
  initialSales,
  initialPurchases,
  initialSaleChallans,
  initialVouchers,
  initialShortages,
} from '../data/initialData';

interface PharoahContextType {
  // Auth & Session
  isAuthenticated: boolean;
  currentUser: SystemUser | null;
  activeCompany: CompanyProfile;
  currentFY: string;
  setCurrentFY: (fy: string) => void;
  login: (username: string, pass: string, storeToken?: string) => boolean;
  logout: () => void;

  // Master Lists
  medicines: Medicine[];
  batchHistory: Record<string, BatchInfo[]>;
  parties: Party[];
  companies: Company[];
  salts: Salt[];
  routes: RouteArea[];
  numberingSeries: NumberingSeries[];
  shortages: ShortageItem[];
  logs: LogEntry[];

  // Transactions
  sales: Sale[];
  purchases: Purchase[];
  saleChallans: SaleChallan[];
  purchaseChallans: PurchaseChallan[];
  saleReturns: SaleReturn[];
  purchaseReturns: PurchaseReturn[];
  vouchers: Voucher[];

  // Operations
  getNextNumber: (type: NumberingSeries['type']) => string;
  addSale: (sale: Omit<Sale, 'id'>) => Sale;
  cancelSale: (id: string) => void;
  deleteSale: (id: string) => boolean;
  addPurchase: (purchase: Omit<Purchase, 'id'>) => Purchase;
  cancelPurchase: (id: string) => void;
  addSaleChallan: (challan: Omit<SaleChallan, 'id'>) => SaleChallan;
  addPurchaseChallan: (challan: Omit<PurchaseChallan, 'id'>) => PurchaseChallan;
  stitchSaleChallansToBill: (challanIds: string[], partyId: string) => Sale;
  addSaleReturn: (ret: Omit<SaleReturn, 'id'>) => SaleReturn;
  addPurchaseReturn: (ret: Omit<PurchaseReturn, 'id'>) => PurchaseReturn;
  addVoucher: (voucher: Omit<Voucher, 'id'>) => Voucher;
  cancelVoucher: (id: string) => void;

  // Masters CRUD
  addMedicine: (medicine: Omit<Medicine, 'id'>, initialBatch?: BatchInfo) => Medicine;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  addBatch: (medicineId: string, batch: BatchInfo) => void;
  updateBatch: (medicineId: string, batchNo: string, updates: Partial<BatchInfo>) => void;
  addParty: (party: Omit<Party, 'id'>) => Party;
  updateParty: (id: string, updates: Partial<Party>) => void;
  addCompany: (name: string) => Company;
  addSalt: (name: string, type: string) => Salt;
  addRoute: (name: string) => RouteArea;
  addShortage: (shortage: Omit<ShortageItem, 'id'>) => ShortageItem;
  removeShortage: (id: string) => void;

  // Valuation & Reports
  totalStockValuation: number;
  totalReceivables: number;
  totalPayables: number;
  rebuildInventory: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonData: string) => boolean;
  resetToDemoData: () => void;
}

const PharoahContext = createContext<PharoahContextType | undefined>(undefined);

const STORAGE_KEY = 'pharoah_erp_store_v1';

export const PharoahProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Pre-authenticated for fluid experience
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(initialSystemUsers[0]);
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(initialCompanyProfile);
  const [currentFY, setCurrentFY] = useState<string>('2024-2025');

  // Master Data
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [batchHistory, setBatchHistory] = useState<Record<string, BatchInfo[]>>(initialBatchHistory);
  const [parties, setParties] = useState<Party[]>(initialParties);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [salts, setSalts] = useState<Salt[]>(initialSalts);
  const [routes, setRoutes] = useState<RouteArea[]>(initialRoutes);
  const [numberingSeries, setNumberingSeries] = useState<NumberingSeries[]>(initialNumberingSeries);
  const [shortages, setShortages] = useState<ShortageItem[]>(initialShortages);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log_1',
      action: 'SYSTEM_BOOT',
      details: 'Pharoah ERP Workstation initialized successfully.',
      time: new Date().toISOString(),
    },
  ]);

  // Transactions
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [saleChallans, setSaleChallans] = useState<SaleChallan[]>(initialSaleChallans);
  const [purchaseChallans, setPurchaseChallans] = useState<PurchaseChallan[]>([]);
  const [saleReturns, setSaleReturns] = useState<SaleReturn[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.medicines) setMedicines(parsed.medicines);
        if (parsed.batchHistory) setBatchHistory(parsed.batchHistory);
        if (parsed.parties) setParties(parsed.parties);
        if (parsed.companies) setCompanies(parsed.companies);
        if (parsed.salts) setSalts(parsed.salts);
        if (parsed.routes) setRoutes(parsed.routes);
        if (parsed.numberingSeries) setNumberingSeries(parsed.numberingSeries);
        if (parsed.shortages) setShortages(parsed.shortages);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.purchases) setPurchases(parsed.purchases);
        if (parsed.saleChallans) setSaleChallans(parsed.saleChallans);
        if (parsed.purchaseChallans) setPurchaseChallans(parsed.purchaseChallans);
        if (parsed.saleReturns) setSaleReturns(parsed.saleReturns);
        if (parsed.purchaseReturns) setPurchaseReturns(parsed.purchaseReturns);
        if (parsed.vouchers) setVouchers(parsed.vouchers);
        if (parsed.currentFY) setCurrentFY(parsed.currentFY);
      }
    } catch (e) {
      console.error('Failed to load local ERP storage:', e);
    }
  }, []);

  // Save to localStorage whenever critical data changes
  useEffect(() => {
    try {
      const dump = {
        medicines,
        batchHistory,
        parties,
        companies,
        salts,
        routes,
        numberingSeries,
        shortages,
        sales,
        purchases,
        saleChallans,
        purchaseChallans,
        saleReturns,
        purchaseReturns,
        vouchers,
        currentFY,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dump));
    } catch (e) {
      console.warn('Unable to persist to localStorage:', e);
    }
  }, [
    medicines,
    batchHistory,
    parties,
    companies,
    salts,
    routes,
    numberingSeries,
    shortages,
    sales,
    purchases,
    saleChallans,
    purchaseChallans,
    saleReturns,
    purchaseReturns,
    vouchers,
    currentFY,
  ]);

  // Log action helper
  const addLog = (action: string, details: string) => {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      action,
      details,
      time: new Date().toISOString(),
    };
    setLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

  // Auth
  const login = (username: string, pass: string, storeToken?: string): boolean => {
    const user = initialSystemUsers.find((u) => u.username === username);
    if (user && (!user.password || user.password === pass || storeToken)) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      addLog('LOGIN_SUCCESS', `User ${username} logged in successfully.`);
      return true;
    }
    // Also allow admin fallback
    if (username === 'admin' || storeToken) {
      setIsAuthenticated(true);
      setCurrentUser(initialSystemUsers[0]);
      addLog('LOGIN_SUCCESS', `User admin logged in with token bypass.`);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    addLog('LOGOUT', 'User logged out.');
  };

  // Gap-Filling Numbering Engine
  const getNextNumber = (type: NumberingSeries['type']): string => {
    const series = numberingSeries.find((s) => s.type === type && s.isActive) || {
      prefix: type === 'SALE' ? 'INV-' : type === 'PURCHASE' ? 'PUR-' : 'DOC-',
      startNumber: 1,
    };
    const prefix = series.prefix;
    const startFrom = series.startNumber;

    let existingNumbers: number[] = [];
    if (type === 'SALE') {
      existingNumbers = sales
        .filter((s) => s.billNo.startsWith(prefix))
        .map((s) => parseInt(s.billNo.replace(prefix, ''), 10))
        .filter((n) => !isNaN(n));
    } else if (type === 'PURCHASE') {
      existingNumbers = purchases
        .filter((p) => p.internalNo.startsWith(prefix))
        .map((p) => parseInt(p.internalNo.replace(prefix, ''), 10))
        .filter((n) => !isNaN(n));
    } else if (type === 'CHALLAN_SALE') {
      existingNumbers = saleChallans
        .filter((c) => c.billNo.startsWith(prefix))
        .map((c) => parseInt(c.billNo.replace(prefix, ''), 10))
        .filter((n) => !isNaN(n));
    } else if (type === 'CHALLAN_PUR') {
      existingNumbers = purchaseChallans
        .filter((c) => c.internalNo.startsWith(prefix))
        .map((c) => parseInt(c.internalNo.replace(prefix, ''), 10))
        .filter((n) => !isNaN(n));
    } else if (type === 'CREDIT_NOTE') {
      existingNumbers = saleReturns
        .filter((r) => r.billNo.startsWith(prefix))
        .map((r) => parseInt(r.billNo.replace(prefix, ''), 10))
        .filter((n) => !isNaN(n));
    } else if (type === 'DEBIT_NOTE') {
      existingNumbers = purchaseReturns
        .filter((r) => r.billNo.startsWith(prefix))
        .map((r) => parseInt(r.billNo.replace(prefix, ''), 10))
        .filter((n) => !isNaN(n));
    } else if (type === 'RECEIPT' || type === 'PAYMENT') {
      existingNumbers = vouchers
        .filter((v) => v.voucherNo.startsWith(prefix))
        .map((v) => parseInt(v.voucherNo.replace(prefix, ''), 10))
        .filter((n) => !isNaN(n));
    }

    if (existingNumbers.length > 0) {
      existingNumbers.sort((a, b) => a - b);
      for (let i = startFrom; i <= existingNumbers[existingNumbers.length - 1]; i++) {
        if (!existingNumbers.includes(i)) {
          return `${prefix}${i}`;
        }
      }
      return `${prefix}${existingNumbers[existingNumbers.length - 1] + 1}`;
    }

    return `${prefix}${startFrom}`;
  };

  // Rebuild Inventory Logic
  const rebuildInventoryWithData = (
    currentMeds: Medicine[],
    currentBatches: Record<string, BatchInfo[]>,
    currPurchases: Purchase[],
    currSales: Sale[],
    currSaleReturns: SaleReturn[],
    currPurchaseReturns: PurchaseReturn[]
  ) => {
    const updatedBatches: Record<string, BatchInfo[]> = {};
    Object.keys(currentBatches).forEach((key) => {
      updatedBatches[key] = currentBatches[key].map((b) => ({
        ...b,
        qty: b.openingQty + b.adjustmentQty,
      }));
    });

    const updateBatchStock = (
      medId: string,
      medName: string,
      batchNo: string,
      deltaQty: number,
      meta?: Partial<BatchInfo>
    ) => {
      const med = currentMeds.find((m) => m.id === medId || m.name === medName);
      if (!med) return;
      const key = med.id;
      if (!updatedBatches[key]) {
        updatedBatches[key] = [];
      }
      const existing = updatedBatches[key].find((b) => b.batch === batchNo);
      if (existing) {
        existing.qty += deltaQty;
      } else if (deltaQty > 0) {
        // Stock IN of new batch
        updatedBatches[key].push({
          batch: batchNo,
          exp: meta?.exp || '12/26',
          packing: med.packing,
          mrp: meta?.mrp || med.mrp,
          rate: meta?.rateA || med.rateA,
          qty: deltaQty,
          openingQty: 0,
          adjustmentQty: 0,
          breakageQty: 0,
          adjReason: '',
          purRate: meta?.purRate || med.purRate,
          rateA: meta?.rateA || med.rateA,
          rateB: meta?.rateB || med.rateB,
          rateC: meta?.rateC || med.rateC,
          rateCFormula: 0,
          appliedRateType: 'A',
          status: 'Active',
        });
      }
    };

    // 1. Process Purchases (+)
    currPurchases.forEach((p) => {
      p.items.forEach((item) => {
        updateBatchStock(
          item.medicineID,
          item.name,
          item.batch,
          item.qty + (item.freeQty || 0),
          {
            exp: item.exp,
            mrp: item.mrp,
            purRate: item.purchaseRate,
            rateA: item.rateA,
            rateB: item.rateB,
            rateC: item.rateC,
          }
        );
      });
    });

    // 2. Process Sales (-)
    currSales
      .filter((s) => s.status === 'Active')
      .forEach((s) => {
        s.items.forEach((item) => {
          updateBatchStock(
            item.medicineID,
            item.name,
            item.batch,
            -(item.qty + (item.freeQty || 0))
          );
        });
      });

    // 3. Process Sale Returns / Credit Notes (+)
    currSaleReturns
      .filter((r) => r.status === 'Active' && r.returnType === 'Sellable')
      .forEach((r) => {
        r.items.forEach((item) => {
          updateBatchStock(
            item.medicineID,
            item.name,
            item.batch,
            item.qty + (item.freeQty || 0)
          );
        });
      });

    // 4. Process Purchase Returns / Debit Notes (-)
    currPurchaseReturns
      .filter((r) => r.status === 'Active')
      .forEach((r) => {
        r.items.forEach((item) => {
          updateBatchStock(
            item.medicineID,
            item.name,
            item.batch,
            -(item.qty + (item.freeQty || 0))
          );
        });
      });

    // 5. Update Medicines Stock
    const updatedMeds = currentMeds.map((med) => {
      const batches = updatedBatches[med.id];
      if (batches && batches.length > 0) {
        const total = batches.reduce((acc, b) => acc + b.qty, 0);
        return { ...med, stock: Math.max(0, total) };
      }
      return med;
    });

    return { updatedBatches, updatedMeds };
  };

  const rebuildInventory = () => {
    const result = rebuildInventoryWithData(
      medicines,
      batchHistory,
      purchases,
      sales,
      saleReturns,
      purchaseReturns
    );
    if (result) {
      setBatchHistory(result.updatedBatches);
      setMedicines(result.updatedMeds);
      addLog('INVENTORY_REBUILD', 'All medicine and batch stocks recalculated.');
    }
  };

  // Add Sale
  const addSale = (saleData: Omit<Sale, 'id'>): Sale => {
    const newId = `sale_${Date.now()}`;
    const newSale: Sale = { ...saleData, id: newId };
    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);

    // Auto rebuild inventory
    const result = rebuildInventoryWithData(
      medicines,
      batchHistory,
      purchases,
      updatedSales,
      saleReturns,
      purchaseReturns
    );
    if (result) {
      setBatchHistory(result.updatedBatches);
      setMedicines(result.updatedMeds);
    }

    addLog('SALE_INVOICE_CREATED', `Bill ${newSale.billNo} generated for ${newSale.partyName} (₹${newSale.totalAmount.toFixed(2)})`);
    return newSale;
  };

  const cancelSale = (id: string) => {
    const updatedSales = sales.map((s) => (s.id === id ? { ...s, status: 'Cancelled' as const } : s));
    setSales(updatedSales);
    const result = rebuildInventoryWithData(
      medicines,
      batchHistory,
      purchases,
      updatedSales,
      saleReturns,
      purchaseReturns
    );
    if (result) {
      setBatchHistory(result.updatedBatches);
      setMedicines(result.updatedMeds);
    }
    addLog('SALE_CANCELLED', `Bill ${id} marked as Cancelled.`);
  };

  const deleteSale = (id: string): boolean => {
    if (!currentUser?.canDeleteBill) {
      alert('Permission Denied: Your staff profile is not permitted to delete bills.');
      return false;
    }
    const updatedSales = sales.filter((s) => s.id !== id);
    setSales(updatedSales);
    const result = rebuildInventoryWithData(
      medicines,
      batchHistory,
      purchases,
      updatedSales,
      saleReturns,
      purchaseReturns
    );
    if (result) {
      setBatchHistory(result.updatedBatches);
      setMedicines(result.updatedMeds);
    }
    addLog('SALE_DELETED', `Bill ${id} permanently deleted.`);
    return true;
  };

  // Purchases
  const addPurchase = (purData: Omit<Purchase, 'id'>): Purchase => {
    const newId = `pur_${Date.now()}`;
    const newPur: Purchase = { ...purData, id: newId };
    const updatedPurchases = [newPur, ...purchases];
    setPurchases(updatedPurchases);

    const result = rebuildInventoryWithData(
      medicines,
      batchHistory,
      updatedPurchases,
      sales,
      saleReturns,
      purchaseReturns
    );
    if (result) {
      setBatchHistory(result.updatedBatches);
      setMedicines(result.updatedMeds);
    }

    addLog('PURCHASE_ENTRY', `Purchase ${newPur.internalNo} added from ${newPur.distributorName} (₹${newPur.totalAmount.toFixed(2)})`);
    return newPur;
  };

  const cancelPurchase = (id: string) => {
    const updated = purchases.filter((p) => p.id !== id);
    setPurchases(updated);
    const result = rebuildInventoryWithData(
      medicines,
      batchHistory,
      updated,
      sales,
      saleReturns,
      purchaseReturns
    );
    if (result) {
      setBatchHistory(result.updatedBatches);
      setMedicines(result.updatedMeds);
    }
    addLog('PURCHASE_CANCELLED', `Purchase entry ${id} removed.`);
  };

  // Challans
  const addSaleChallan = (challanData: Omit<SaleChallan, 'id'>): SaleChallan => {
    const newId = `sc_${Date.now()}`;
    const newChallan: SaleChallan = { ...challanData, id: newId };
    setSaleChallans([newChallan, ...saleChallans]);
    addLog('SALE_CHALLAN_CREATED', `Challan ${newChallan.billNo} dispatched to ${newChallan.partyName}`);
    return newChallan;
  };

  const addPurchaseChallan = (challanData: Omit<PurchaseChallan, 'id'>): PurchaseChallan => {
    const newId = `pc_${Date.now()}`;
    const newChallan: PurchaseChallan = { ...challanData, id: newId };
    setPurchaseChallans([newChallan, ...purchaseChallans]);
    addLog('PURCHASE_CHALLAN_CREATED', `Purchase challan ${newChallan.internalNo} recorded.`);
    return newChallan;
  };

  // Stitcher: Combine pending challans into a Sale Invoice
  const stitchSaleChallansToBill = (challanIds: string[], partyId: string): Sale => {
    const party = parties.find((p) => p.id === partyId) || parties[0];
    const targetChallans = saleChallans.filter(
      (c) => challanIds.includes(c.id) && c.status === 'Pending'
    );

    const mergedItems: BillItem[] = [];
    let sr = 1;
    targetChallans.forEach((c) => {
      c.items.forEach((item) => {
        mergedItems.push({
          ...item,
          srNo: sr++,
          id: `stitched_${Date.now()}_${sr}`,
          sourceChallanNo: c.billNo,
          sourceChallanId: c.id,
        });
      });
    });

    const subtotal = mergedItems.reduce((acc, i) => acc + i.total, 0);
    const billNo = getNextNumber('SALE');

    const newSale = addSale({
      billNo,
      partyId: party.id,
      date: new Date().toISOString(),
      partyName: party.name,
      partyGstin: party.gst,
      partyState: party.state,
      paymentMode: 'CREDIT',
      totalAmount: subtotal,
      status: 'Active',
      invoiceType: party.gst ? 'B2B' : 'B2C',
      transporterName: party.transport || '',
      transporterId: '',
      vehicleNo: '',
      salesmanName: '',
      sourceTag: 'STITCHER',
      partyPhone: party.phone,
      partyEmail: party.email,
      partyAddress: party.address,
      partyCity: party.city,
      partyDl: party.dl,
      partyPan: party.pan,
      extraDiscount: 0,
      roundOff: 0,
      linkedChallanIds: challanIds,
      items: mergedItems,
    });

    // Mark challans as converted
    setSaleChallans((prev) =>
      prev.map((c) => (challanIds.includes(c.id) ? { ...c, status: 'Converted' as const } : c))
    );

    addLog('CHALLAN_STITCHED', `${challanIds.length} challans stitched into invoice ${billNo}`);
    return newSale;
  };

  // Returns
  const addSaleReturn = (retData: Omit<SaleReturn, 'id'>): SaleReturn => {
    const newId = `sr_${Date.now()}`;
    const newRet: SaleReturn = { ...retData, id: newId };
    const updatedReturns = [newRet, ...saleReturns];
    setSaleReturns(updatedReturns);

    const result = rebuildInventoryWithData(
      medicines,
      batchHistory,
      purchases,
      sales,
      updatedReturns,
      purchaseReturns
    );
    if (result) {
      setBatchHistory(result.updatedBatches);
      setMedicines(result.updatedMeds);
    }
    addLog('CREDIT_NOTE_CREATED', `Credit note ${newRet.billNo} processed (${newRet.returnType})`);
    return newRet;
  };

  const addPurchaseReturn = (retData: Omit<PurchaseReturn, 'id'>): PurchaseReturn => {
    const newId = `pr_${Date.now()}`;
    const newRet: PurchaseReturn = { ...retData, id: newId };
    const updatedReturns = [newRet, ...purchaseReturns];
    setPurchaseReturns(updatedReturns);

    const result = rebuildInventoryWithData(
      medicines,
      batchHistory,
      purchases,
      sales,
      saleReturns,
      updatedReturns
    );
    if (result) {
      setBatchHistory(result.updatedBatches);
      setMedicines(result.updatedMeds);
    }
    addLog('DEBIT_NOTE_CREATED', `Debit note ${newRet.billNo} issued.`);
    return newRet;
  };

  // Vouchers
  const addVoucher = (vData: Omit<Voucher, 'id'>): Voucher => {
    const newId = `v_${Date.now()}`;
    const newV: Voucher = { ...vData, id: newId };
    setVouchers([newV, ...vouchers]);
    addLog('VOUCHER_ENTRY', `${newV.type} voucher ${newV.voucherNo} recorded for ₹${newV.amount.toFixed(2)}`);
    return newV;
  };

  const cancelVoucher = (id: string) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'Cancelled' as const } : v))
    );
    addLog('VOUCHER_CANCELLED', `Voucher ${id} cancelled.`);
  };

  // Masters
  const addMedicine = (medData: Omit<Medicine, 'id'>, initialBatch?: BatchInfo): Medicine => {
    const newId = `med_${Date.now()}`;
    const newMed: Medicine = { ...medData, id: newId };
    const updatedMeds = [...medicines, newMed];
    setMedicines(updatedMeds);

    if (initialBatch) {
      const updatedBatches = {
        ...batchHistory,
        [newId]: [{ ...initialBatch, packing: newMed.packing, mrp: newMed.mrp, rate: newMed.rateA }],
      };
      setBatchHistory(updatedBatches);
    }

    addLog('MEDICINE_ADDED', `Medicine ${newMed.name} registered.`);
    return newMed;
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    addLog('MEDICINE_UPDATED', `Medicine ${id} updated.`);
  };

  const addBatch = (medicineId: string, batch: BatchInfo) => {
    setBatchHistory((prev) => {
      const list = prev[medicineId] || [];
      return {
        ...prev,
        [medicineId]: [...list, batch],
      };
    });
    rebuildInventory();
  };

  const updateBatch = (medicineId: string, batchNo: string, updates: Partial<BatchInfo>) => {
    setBatchHistory((prev) => {
      const list = prev[medicineId] || [];
      return {
        ...prev,
        [medicineId]: list.map((b) => (b.batch === batchNo ? { ...b, ...updates } : b)),
      };
    });
    rebuildInventory();
  };

  const addParty = (partyData: Omit<Party, 'id'>): Party => {
    const newId = `party_${Date.now()}`;
    const newParty: Party = { ...partyData, id: newId };
    setParties([...parties, newParty]);
    addLog('PARTY_ADDED', `Party ${newParty.name} registered (${newParty.group})`);
    return newParty;
  };

  const updateParty = (id: string, updates: Partial<Party>) => {
    setParties((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    addLog('PARTY_UPDATED', `Party ${id} updated.`);
  };

  const addCompany = (name: string): Company => {
    const newId = `CP-${Date.now().toString().slice(-5)}`;
    const comp: Company = { id: newId, name: name.toUpperCase() };
    setCompanies([...companies, comp]);
    return comp;
  };

  const addSalt = (name: string, type: string): Salt => {
    const newId = `SL-${Date.now().toString().slice(-5)}`;
    const salt: Salt = { id: newId, name: name.toUpperCase(), type };
    setSalts([...salts, salt]);
    return salt;
  };

  const addRoute = (name: string): RouteArea => {
    const newId = `RT-${Date.now().toString().slice(-3)}`;
    const r: RouteArea = { id: newId, name: name.toUpperCase() };
    setRoutes([...routes, r]);
    return r;
  };

  const addShortage = (shData: Omit<ShortageItem, 'id'>): ShortageItem => {
    const newId = `sh_${Date.now()}`;
    const item: ShortageItem = { ...shData, id: newId };
    setShortages([item, ...shortages]);
    return item;
  };

  const removeShortage = (id: string) => {
    setShortages((prev) => prev.filter((s) => s.id !== id));
  };

  // Stock Valuation calculation
  const totalStockValuation = Object.entries(batchHistory).reduce((acc, [medId, batches]) => {
    const med = medicines.find((m) => m.id === medId);
    const gstRate = med?.gst || 12;
    const batchVal = batches.reduce((bAcc, b) => {
      if (b.qty > 0) {
        const taxableRate = (b.purRate || b.rate) / (1 + gstRate / 100);
        return bAcc + b.qty * taxableRate;
      }
      return bAcc;
    }, 0);
    return acc + batchVal;
  }, 0);

  // Receivables from Sundry Debtors
  const totalReceivables = parties
    .filter((p) => p.group === 'Sundry Debtors')
    .reduce((acc, p) => {
      // Base opening balance
      let bal = p.opBal || 0;
      // Add sales to this party
      sales
        .filter((s) => s.partyId === p.id && s.status === 'Active')
        .forEach((s) => (bal += s.totalAmount));
      // Subtract receipts
      vouchers
        .filter((v) => v.partyId === p.id && v.type === 'RECEIPT' && v.status === 'Active')
        .forEach((v) => (bal -= v.amount));
      // Subtract credit notes
      saleReturns
        .filter((r) => r.partyName === p.name && r.status === 'Active')
        .forEach((r) => (bal -= r.totalAmount));
      return acc + Math.max(0, bal);
    }, 0);

  // Payables to Sundry Creditors
  const totalPayables = parties
    .filter((p) => p.group === 'Sundry Creditors')
    .reduce((acc, p) => {
      let bal = p.opBal || 0;
      // Add purchases from this party
      purchases
        .filter((pur) => pur.partyId === p.id)
        .forEach((pur) => (bal += pur.totalAmount));
      // Subtract payments
      vouchers
        .filter((v) => v.partyId === p.id && v.type === 'PAYMENT' && v.status === 'Active')
        .forEach((v) => (bal -= v.amount));
      // Subtract debit notes
      purchaseReturns
        .filter((pr) => pr.distributorName === p.name && pr.status === 'Active')
        .forEach((pr) => (bal -= pr.totalAmount));
      return acc + Math.max(0, bal);
    }, 0);

  // Backup & Restore
  const exportDatabaseJson = () => {
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      companyProfile: activeCompany,
      currentFY,
      medicines,
      batchHistory,
      parties,
      companies,
      salts,
      routes,
      numberingSeries,
      shortages,
      sales,
      purchases,
      saleChallans,
      purchaseChallans,
      saleReturns,
      purchaseReturns,
      vouchers,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDatabaseJson = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.medicines) setMedicines(data.medicines);
      if (data.batchHistory) setBatchHistory(data.batchHistory);
      if (data.parties) setParties(data.parties);
      if (data.companies) setCompanies(data.companies);
      if (data.salts) setSalts(data.salts);
      if (data.routes) setRoutes(data.routes);
      if (data.numberingSeries) setNumberingSeries(data.numberingSeries);
      if (data.shortages) setShortages(data.shortages);
      if (data.sales) setSales(data.sales);
      if (data.purchases) setPurchases(data.purchases);
      if (data.saleChallans) setSaleChallans(data.saleChallans);
      if (data.purchaseChallans) setPurchaseChallans(data.purchaseChallans || []);
      if (data.saleReturns) setSaleReturns(data.saleReturns || []);
      if (data.purchaseReturns) setPurchaseReturns(data.purchaseReturns || []);
      if (data.vouchers) setVouchers(data.vouchers);
      addLog('DATABASE_IMPORTED', 'Full database restored from JSON backup.');
      return true;
    } catch (e) {
      console.error('Failed to parse database import JSON', e);
      return false;
    }
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMedicines(initialMedicines);
    setBatchHistory(initialBatchHistory);
    setParties(initialParties);
    setCompanies(initialCompanies);
    setSalts(initialSalts);
    setRoutes(initialRoutes);
    setNumberingSeries(initialNumberingSeries);
    setShortages(initialShortages);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setSaleChallans(initialSaleChallans);
    setPurchaseChallans([]);
    setSaleReturns([]);
    setPurchaseReturns([]);
    setVouchers(initialVouchers);
    addLog('RESET_DEMO', 'Database restored to pristine demo dataset.');
  };

  return (
    <PharoahContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        activeCompany,
        currentFY,
        setCurrentFY,
        login,
        logout,
        medicines,
        batchHistory,
        parties,
        companies,
        salts,
        routes,
        numberingSeries,
        shortages,
        logs,
        sales,
        purchases,
        saleChallans,
        purchaseChallans,
        saleReturns,
        purchaseReturns,
        vouchers,
        getNextNumber,
        addSale,
        cancelSale,
        deleteSale,
        addPurchase,
        cancelPurchase,
        addSaleChallan,
        addPurchaseChallan,
        stitchSaleChallansToBill,
        addSaleReturn,
        addPurchaseReturn,
        addVoucher,
        cancelVoucher,
        addMedicine,
        updateMedicine,
        addBatch,
        updateBatch,
        addParty,
        updateParty,
        addCompany,
        addSalt,
        addRoute,
        addShortage,
        removeShortage,
        totalStockValuation,
        totalReceivables,
        totalPayables,
        rebuildInventory,
        exportDatabaseJson,
        importDatabaseJson,
        resetToDemoData,
      }}
    >
      {children}
    </PharoahContext.Provider>
  );
};

export const usePharoah = () => {
  const context = useContext(PharoahContext);
  if (!context) {
    throw new Error('usePharoah must be used within a PharoahProvider');
  }
  return context;
};
