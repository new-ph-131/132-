# Pharoah ERP Web Workstation (React + Vite + TypeScript)

A comprehensive, Marg ERP-compliant Pharmaceutical ERP Workstation rebuilt as a high-performance React SPA with Vite, Tailwind CSS, and TypeScript.

## Core Features & Business Logic Ported

1. **Billing & Sales**:
   - Marg-style fast invoice generator (`F2`) with party outstandings, credit limits, DL numbers, and GSTIN verification.
   - Autonomous batch lookup: Select batch with real-time stock, expiry audit, MRP, Purchase Rate, and multi-tier pricing (Rate A / B / C).
   - Dual discounts: Line-item discount (`%` or `₹`) and extra footer discount.
   - Real-time GST calculations (CGST + SGST or IGST) with fractional round-off.
   - Quick Add Party and Quick Add Medicine modals right inside billing.
   - Printable GST Tax Invoices formatted to pharmaceutical wholesale & distribution standards.
   - Sales Register with filtering, date tracking, invoice reprinting, cancellation, and admin-only deletion.

2. **Purchases**:
   - Supplier invoice inward logging (Distributor name, supplier invoice number, dates).
   - Batch arrival entry: Batch number, Expiry, MRP, Purchase Rate, Rates A/B/C, Tax, Free quantity.
   - Purchase Register with chronological inward logs and export to CSV.

3. **Challan Management & Stitcher Wizard**:
   - Sale delivery challans with digital verification/signatures.
   - **Challan-to-Bill Stitcher**: Multi-challan selector that consolidates pending dispatch slips into a single GST Tax Invoice and marks challans as converted.

4. **Returns & Reversals (Credit / Debit Notes)**:
   - Credit Notes (Sales Returns) with categorization: Sellable, Breakage, or Expiry.
   - Sellable items automatically restock inventory; damaged goods are quarantined.
   - Debit Notes (Supplier Returns) with automatic stock deduction.
   - Returns Register.

5. **Inventory & Autonomous Batch Engine**:
   - Full medicine catalog with salt composition, manufacturer company, rack number, HSN code, and reorder levels.
   - Marg-compliant Batch Master with status control (Active, Hold, Blocked) and expiry color badges (Expired, Near Expiry < 90 days, Valid).
   - Real-time taxable net stock valuation calculation.
   - Shortage Register for inventory replenishment and order indents.
   - Complete inventory recalculation algorithm matching `InventoryLogicCenter`.

6. **Accounts & Financial Ledger**:
   - Voucher Entry: Receipts, Payments, Contra, and Office Expenses.
   - Daily Daybook: Chronological log of all outward sales, inward purchases, receipts, and payments.
   - Party Ledger Account Statement: Running Dr/Cr balance with printable statement.
   - Bank Book: Tracking bank deposits and cash withdrawals.

7. **Auxiliary & Business Masters**:
   - Party Master (Sundry Debtors & Creditors, price levels, credit days).
   - Pharmaceutical Company Master.
   - Generic Salt / Molecule Master.
   - Route & Beat Master.
   - Numbering Series with gap-filling sequential numbering.
   - CA & Auditor Profile.

8. **GST Compliance Hub**:
   - GSTR-1 summary tables (Table 4 B2B, Table 7 B2CS, HSN summary) with portal JSON export.
   - GSTR-3B tax computation with outward liability and purchase ITC offset.
   - GSTR-2B reconciliation viewer.
   - E-Way Bill management.

9. **Data Exchange & Local Persistence**:
   - Offline-safe `localStorage` synchronization.
   - JSON full database backup and restore.
   - Marg ERP CSV batch importer.
   - CSV export for all registers.

## Running the Application

```bash
npm install
npm run dev
```

The application runs on `http://0.0.0.0:3000`.
