export interface NumberingSeries {
  id: string;
  name: string;
  type: 'SALE' | 'PURCHASE' | 'CHALLAN_SALE' | 'CHALLAN_PUR' | 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'RECEIPT' | 'PAYMENT' | 'PRODUCT';
  prefix: string;
  startNumber: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface ChallanSignature {
  id: string;
  imagePath: string;
  verificationCode: string;
  signedAmount: number;
  signedQty: number;
  signDate: string;
  signX?: number;
  signY?: number;
}

export interface RouteArea {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
}

export interface Salt {
  id: string;
  name: string;
  type: string; // e.g. "Mono", "Combo"
}

export interface DrugType {
  id: string;
  name: string;
}

export interface Bank {
  id: string;
  name: string;
  branch: string;
  accountNo: string;
  openingBalance: number;
}

export interface Salesman {
  id: string;
  name: string;
  phone: string;
  route: string;
}

export interface BatchInfo {
  batch: string;
  exp: string; // MM/YY or YYYY-MM
  packing: string;
  mrp: number;
  rate: number;
  qty: number;
  openingQty: number;
  adjustmentQty: number;
  breakageQty: number;
  adjReason: string;
  isShell?: boolean;
  purRate: number;
  rateA: number;
  rateB: number;
  rateC: number;
  rateCFormula: number;
  appliedRateType: string; // "A" | "B" | "C" | "PUR"
  status: 'Active' | 'Hold' | 'Blocked';
}

export interface Medicine {
  id: string;
  systemId: string; // Business Series ID (e.g. PH-00001)
  uniqueCode: string;
  name: string;
  packing: string;
  companyId: string;
  saltId: string;
  drugTypeId: string;
  rackNo: string;
  hsnCode: string;
  conversion: number;
  reorderLevel: number;
  gst: number;
  mrp: number;
  purRate: number;
  rateA: number;
  rateB: number;
  rateC: number;
  stock: number;
  drugForm: string; // "TAB", "CAP", "SYRUP", "INJ", etc.
  isNarcotic: boolean;
  isScheduleH1: boolean;
  storageCondition: string;
}

export interface Party {
  id: string;
  name: string;
  group: 'Sundry Debtors' | 'Sundry Creditors';
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  route: string;
  gst: string;
  dl: string;
  dlExp: string;
  pan: string;
  transport: string;
  priceLevel: 'A' | 'B' | 'C';
  defaultSeriesId: string;
  hsnCode: string;
  opBal: number;
  creditLimit: number;
  creditDays: number;
}

export interface BillItem {
  id: string;
  srNo: number;
  medicineID: string;
  name: string;
  packing: string;
  batch: string;
  exp: string;
  hsn: string;
  mrp: number;
  qty: number;
  freeQty: number;
  rate: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  discountRupees: number;
  discountPer: number;
  isBreakage?: boolean;
  sourceChallanNo?: string;
  sourceChallanId?: string;
  appliedRateType: string;
  rateCFormula: number;
}

export interface PurchaseItem {
  id: string;
  srNo: number;
  medicineID: string;
  name: string;
  packing: string;
  batch: string;
  exp: string;
  hsn: string;
  mrp: number;
  qty: number;
  freeQty: number;
  purchaseRate: number;
  gstRate: number;
  total: number;
  rateA: number;
  rateB: number;
  rateC: number;
  discountPer: number;
  discountRupees: number;
  rateCFormula: number;
  isBreakage?: boolean;
  sourceChallanNo?: string;
  sourceChallanId?: string;
  appliedRateType: string;
}

export interface Sale {
  id: string;
  billNo: string;
  partyId: string;
  date: string;
  partyName: string;
  partyGstin: string;
  partyState: string;
  paymentMode: 'CASH' | 'CREDIT' | 'BANK';
  totalAmount: number;
  status: 'Active' | 'Cancelled';
  invoiceType: 'B2B' | 'B2C';
  transporterName: string;
  transporterId: string;
  vehicleNo: string;
  salesmanName: string;
  sourceTag: string;
  partyPhone: string;
  partyEmail: string;
  partyAddress: string;
  partyCity: string;
  partyDl: string;
  partyPan: string;
  extraDiscount: number;
  roundOff: number;
  linkedChallanIds: string[];
  items: BillItem[];
}

export interface Purchase {
  id: string;
  internalNo: string;
  billNo: string;
  partyId: string;
  distributorName: string;
  paymentMode: 'CREDIT' | 'CASH' | 'BANK';
  gstStatus: string;
  date: string;
  entryDate: string;
  totalAmount: number;
  items: PurchaseItem[];
  linkedChallanIds: string[];
  sourceTag: string;
  extraDiscount: number;
  roundOff: number;
}

export interface SaleChallan {
  id: string;
  billNo: string;
  partyId: string;
  date: string;
  partyName: string;
  partyGstin: string;
  partyState: string;
  totalAmount: number;
  status: 'Pending' | 'Converted' | 'Cancelled';
  salesmanName: string;
  remarks: string;
  items: BillItem[];
  isSigned: boolean;
  sigHistory: ChallanSignature[];
}

export interface PurchaseChallan {
  id: string;
  internalNo: string;
  billNo: string;
  partyId: string;
  distributorName: string;
  date: string;
  totalAmount: number;
  status: 'Pending' | 'Converted' | 'Cancelled';
  remarks: string;
  items: PurchaseItem[];
}

export interface SaleReturn {
  id: string;
  billNo: string;
  date: string;
  partyName: string;
  totalAmount: number;
  extraDiscount: number;
  roundOff: number;
  status: 'Active' | 'Cancelled';
  returnType: 'Sellable' | 'Breakage' | 'Expiry';
  items: BillItem[];
}

export interface PurchaseReturn {
  id: string;
  billNo: string;
  distributorName: string;
  date: string;
  totalAmount: number;
  extraDiscount: number;
  roundOff: number;
  status: 'Active' | 'Cancelled';
  returnType: 'Sellable' | 'Breakage' | 'Expiry';
  items: PurchaseItem[];
}

export interface Voucher {
  id: string;
  type: 'RECEIPT' | 'PAYMENT' | 'CONTRA' | 'EXPENSE';
  voucherNo: string;
  date: string;
  partyId: string;
  partyName: string;
  amount: number;
  paymentMode: 'Cash' | 'Bank' | 'Cheque' | 'UPI';
  narration: string;
  status: 'Active' | 'Cancelled';
  linkedBillNumbers: string[];
  chequeNo?: string;
  bankName?: string;
  depositedIn?: string;
  chequeDate?: string;
  roundOff?: number;
}

export interface ShortageItem {
  id: string;
  medicineId: string;
  medicineName: string;
  companyName: string;
  distributorName: string;
  customerName: string;
  source: string;
  qtyRequired: number;
  currentStock: number;
  date: string;
}

export interface LogEntry {
  id: string;
  action: string;
  details: string;
  time: string;
}

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: 'Admin' | 'Staff' | 'Accountant' | 'Billing';
  canDeleteBill: boolean;
  canEditBill: boolean;
  canViewPurchaseRate: boolean;
  canViewFinance: boolean;
  canExportData: boolean;
  canRunMaintenance: boolean;
}

export interface CompanyProfile {
  id: string;
  name: string;
  businessType: string;
  createdAt: string;
  address: string;
  state: string;
  gstin: string;
  dlNo: string;
  phone: string;
  email: string;
  adminUser: string;
  password?: string;
  fYears: string[];
}
