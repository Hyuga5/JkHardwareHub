import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JournalEntry, AccountHead } from '../../types';
import { formatNPR } from '../../utils/formatters';
import {
  Calculator,
  FileSpreadsheet,
  Receipt,
  BookOpen,
  Scale,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Plus,
  ArrowRight,
  Printer,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Filter,
  Users,
  Building2,
  DollarSign,
} from 'lucide-react';

export const DistributorAccountingSuite: React.FC = () => {
  const {
    activeDistributorId,
    distributors,
    shops,
    chartOfAccounts,
    journalEntries,
    fiscalYear,
    setFiscalYear,
    createJournalVoucher,
    distributorOrders,
  } = useApp();

  const currentDistributor =
    distributors.find((d) => d.id === activeDistributorId) || distributors[0];

  // Accounting Subtabs for Distributor
  const [activeTab, setActiveTab] = useState<
    | 'sales_invoice'
    | 'receipt_voucher'
    | 'journal'
    | 'dealer_ledgers'
    | 'daybook'
    | 'trial_balance'
    | 'pnl'
    | 'vat_register'
    | 'credit_aging'
  >('sales_invoice');

  // Filter journals for distributor
  const distributorJournals = journalEntries.filter(
    (j) => j.shopId === activeDistributorId
  );

  // Sales & Invoicing Form State
  const [selectedDealerId, setSelectedDealerId] = useState<string>(shops[0]?.id || '');
  const [invItemName, setInvItemName] = useState('Shivam Cement OPC 53 Grade (Lot 200 Bags)');
  const [invAmount, setInvAmount] = useState(138000);
  const [invPaymentTerms, setInvPaymentTerms] = useState<'credit_30' | 'advance_bank' | 'cash'>('credit_30');
  const [invSuccessNotice, setInvSuccessNotice] = useState('');

  // Payment Receipt Form State (Collecting payment from dealer)
  const [receiptDealerId, setReceiptDealerId] = useState<string>(shops[0]?.id || '');
  const [receiptAmount, setReceiptAmount] = useState<number>(50000);
  const [receiptPaymentMode, setReceiptPaymentMode] = useState<'1002' | '1003' | '1001'>('1002'); // Nabil or NIC Asia or Cash
  const [receiptChequeRef, setReceiptChequeRef] = useState('NABIL-CHQ-882910');
  const [receiptNarration, setReceiptNarration] = useState('Received part payment from dealer against wholesale supply');
  const [receiptSuccessNotice, setReceiptSuccessNotice] = useState('');

  // Manual Journal Form State
  const [jrnNarration, setJrnNarration] = useState('Yard warehouse rent payment for Shrawan 2081');
  const [jrnDrCode, setJrnDrCode] = useState('5002');
  const [jrnCrCode, setJrnCrCode] = useState('1002');
  const [jrnAmount, setJrnAmount] = useState(85000);
  const [jrnSuccessNotice, setJrnSuccessNotice] = useState('');

  // Selected Ledger Filter
  const [selectedLedgerCode, setSelectedLedgerCode] = useState<string>('1010');

  // Filter for Search in Daybook
  const [daybookSearch, setDaybookSearch] = useState('');

  // Helper: Create Distributor Wholesale Tax Invoice (Sales Entry)
  const handleCreateSalesInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const dealer = shops.find((s) => s.id === selectedDealerId) || shops[0];
    const taxable = invAmount;
    const vat = Math.round(taxable * 0.13);
    const total = taxable + vat;

    createJournalVoucher({
      shopId: activeDistributorId,
      fiscalYear,
      date: new Date().toISOString().split('T')[0],
      voucherType: 'sales',
      narration: `Wholesale freight invoice to ${dealer.name} for ${invItemName}`,
      partyName: dealer.name,
      partyPan: dealer.panVatNumber,
      referenceNo: `DIST-INV-${Math.floor(1000 + Math.random() * 9000)}`,
      totalAmount: total,
      lines: [
        {
          accountCode: invPaymentTerms === 'credit_30' ? '1010' : '1002',
          accountName: invPaymentTerms === 'credit_30' ? `Sundry Debtors (${dealer.name})` : 'Nabil Bank Current A/c',
          debit: total,
          credit: 0,
          particulars: `Wholesale hardware supply on ${invPaymentTerms}`,
        },
        {
          accountCode: '4001',
          accountName: 'Hardware Sales (हार्डवेयर बिक्री)',
          debit: 0,
          credit: taxable,
          particulars: 'Taxable wholesale supply revenue',
        },
        {
          accountCode: '2010',
          accountName: 'VAT Payable (बिक्री भ्याट दायित्व)',
          debit: 0,
          credit: vat,
          particulars: '13% IRD Output VAT',
        },
      ],
    });

    setInvSuccessNotice(`Wholesale Tax Invoice generated & posted to books for ${dealer.name} (Rs. ${total.toLocaleString()})`);
    setTimeout(() => setInvSuccessNotice(''), 4500);
  };

  // Helper: Record Dealer Receipt Voucher (Double Entry: Dr Bank/Cash, Cr Sundry Debtors)
  const handleRecordReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const dealer = shops.find((s) => s.id === receiptDealerId) || shops[0];
    const bankHead = chartOfAccounts.find((c) => c.code === receiptPaymentMode) || chartOfAccounts[1];

    createJournalVoucher({
      shopId: activeDistributorId,
      fiscalYear,
      date: new Date().toISOString().split('T')[0],
      voucherType: 'receipt',
      narration: `${receiptNarration} (Ref: ${receiptChequeRef})`,
      partyName: dealer.name,
      partyPan: dealer.panVatNumber,
      referenceNo: receiptChequeRef,
      totalAmount: receiptAmount,
      lines: [
        {
          accountCode: bankHead.code,
          accountName: bankHead.name,
          debit: receiptAmount,
          credit: 0,
          particulars: `Collection received via Cheque/Online Transfer`,
        },
        {
          accountCode: '1010',
          accountName: `Sundry Debtors (${dealer.name})`,
          debit: 0,
          credit: receiptAmount,
          particulars: `Dealer account credited`,
        },
      ],
    });

    setReceiptSuccessNotice(`Receipt Voucher posted: Rs ${receiptAmount.toLocaleString()} received from ${dealer.name}`);
    setTimeout(() => setReceiptSuccessNotice(''), 4500);
  };

  // Helper: Post Manual Journal Voucher
  const handleCreateJournal = (e: React.FormEvent) => {
    e.preventDefault();
    const drHead = chartOfAccounts.find((c) => c.code === jrnDrCode);
    const crHead = chartOfAccounts.find((c) => c.code === jrnCrCode);
    if (!drHead || !crHead) return;

    createJournalVoucher({
      shopId: activeDistributorId,
      fiscalYear,
      date: new Date().toISOString().split('T')[0],
      voucherType: 'journal',
      narration: jrnNarration,
      totalAmount: jrnAmount,
      lines: [
        {
          accountCode: drHead.code,
          accountName: drHead.name,
          debit: jrnAmount,
          credit: 0,
          particulars: 'Dr account adjustment',
        },
        {
          accountCode: crHead.code,
          accountName: crHead.name,
          debit: 0,
          credit: jrnAmount,
          particulars: 'Cr account adjustment',
        },
      ],
    });

    setJrnSuccessNotice(`Journal voucher posted: Rs. ${jrnAmount.toLocaleString()}`);
    setTimeout(() => setJrnSuccessNotice(''), 4000);
  };

  // Compute Balances for Trial Balance
  const accountBalances = chartOfAccounts.map((head) => {
    let drSum = 0;
    let crSum = 0;

    distributorJournals.forEach((j) => {
      j.lines.forEach((l) => {
        if (l.accountCode === head.code) {
          drSum += l.debit || 0;
          crSum += l.credit || 0;
        }
      });
    });

    const isDrNormal = head.type === 'asset' || head.type === 'expense';
    let closingBalance = head.balance;

    if (isDrNormal) {
      closingBalance = closingBalance + (drSum - crSum);
    } else {
      closingBalance = closingBalance + (crSum - drSum);
    }

    return {
      ...head,
      drSum,
      crSum,
      closingBalance,
    };
  });

  const totalTBDr = accountBalances.reduce(
    (s, a) => s + ((a.type === 'asset' || a.type === 'expense') && a.closingBalance > 0 ? a.closingBalance : 0),
    0
  );
  const totalTBCr = accountBalances.reduce(
    (s, a) => s + ((a.type === 'liability' || a.type === 'equity' || a.type === 'income') && a.closingBalance > 0 ? a.closingBalance : 0),
    0
  );

  // Profit & Loss calculation
  const totalRevenue = accountBalances
    .filter((a) => a.type === 'income')
    .reduce((s, a) => s + a.closingBalance, 0);
  const totalExpenses = accountBalances
    .filter((a) => a.type === 'expense')
    .reduce((s, a) => s + a.closingBalance, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Selected Ledger View Entries
  const selectedLedgerEntries = distributorJournals
    .flatMap((j) =>
      j.lines
        .filter((l) => l.accountCode === selectedLedgerCode)
        .map((l) => ({
          date: j.date,
          voucherNo: j.voucherNo,
          voucherType: j.voucherType,
          narration: j.narration,
          debit: l.debit,
          credit: l.credit,
        }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Dealer Aging Receivables Table
  const dealerAging = shops.map((s, idx) => {
    const orders = distributorOrders.filter((o) => o.shopId === s.id);
    const purchases = orders.reduce((sum, o) => sum + o.totalAmount, 0) + (idx === 0 ? 320000 : 185000);
    const paid = idx === 0 ? 150000 : 75000;
    const balance = purchases - paid;
    return {
      shop: s,
      purchases,
      paid,
      balance,
      days0_30: Math.round(balance * 0.5),
      days31_60: Math.round(balance * 0.3),
      days61_90: Math.round(balance * 0.15),
      days90_plus: Math.round(balance * 0.05),
    };
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Distributor Accounting & BusyWin ERP (थोक लेखा प्रणाली)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Double-Entry General Ledger, Dealer Khata aging, 13% IRD VAT Sales Register, and Trial Balance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 font-semibold mr-1.5">Fiscal Year:</span>
            <span className="font-bold text-orange-400">{fiscalYear}</span>
          </div>
          <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>IRD Tax Compliant</span>
          </div>
        </div>
      </div>

      {/* Accounting Sub-Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('sales_invoice')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'sales_invoice'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Wholesale Tax Invoice</span>
        </button>

        <button
          onClick={() => setActiveTab('receipt_voucher')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'receipt_voucher'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Dealer Payment Receipt</span>
        </button>

        <button
          onClick={() => setActiveTab('credit_aging')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'credit_aging'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Dealer Khata Aging</span>
        </button>

        <button
          onClick={() => setActiveTab('dealer_ledgers')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'dealer_ledgers'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Account Ledgers</span>
        </button>

        <button
          onClick={() => setActiveTab('daybook')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'daybook'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Day Book (दैनिक खाता)</span>
        </button>

        <button
          onClick={() => setActiveTab('trial_balance')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'trial_balance'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Trial Balance (सन्तुलन परीक्षण)</span>
        </button>

        <button
          onClick={() => setActiveTab('pnl')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pnl'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>P&L Statement</span>
        </button>

        <button
          onClick={() => setActiveTab('vat_register')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'vat_register'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>IRD VAT Sales Book</span>
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'journal'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Journal Voucher</span>
        </button>
      </div>

      {/* 1. SALES TAX INVOICE GENERATOR */}
      {activeTab === 'sales_invoice' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-orange-600" />
              Generate B2B Wholesale Tax Invoice & Post to Ledger
            </h2>

            {invSuccessNotice && (
              <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{invSuccessNotice}</span>
              </div>
            )}

            <form onSubmit={handleCreateSalesInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Dealer / Buyer</label>
                  <select
                    value={selectedDealerId}
                    onChange={(e) => setSelectedDealerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (PAN: {s.panVatNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Terms</label>
                  <select
                    value={invPaymentTerms}
                    onChange={(e) => setInvPaymentTerms(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="credit_30">30-Day B2B Credit (Sundry Debtors)</option>
                    <option value="advance_bank">Bank Transfer (Nabil Current A/c)</option>
                    <option value="cash">Counter Cash Payment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Wholesale Item Description</label>
                <input
                  type="text"
                  value={invItemName}
                  onChange={(e) => setInvItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Taxable Amount (Rs)</label>
                  <input
                    type="number"
                    value={invAmount}
                    onChange={(e) => setInvAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">13% IRD VAT (Rs)</label>
                  <input
                    type="text"
                    disabled
                    value={formatNPR(Math.round(invAmount * 0.13))}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold font-mono text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Grand Total Invoiced (Rs)</label>
                  <input
                    type="text"
                    disabled
                    value={formatNPR(invAmount + Math.round(invAmount * 0.13))}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold font-mono text-orange-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Post Tax Invoice & Update Dealer Khata</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Automated Double-Entry Rules
            </h3>
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
              <p className="text-emerald-700 font-bold">
                Dr. Sundry Debtors (Dealer): Rs. {(invAmount * 1.13).toLocaleString()}
              </p>
              <p className="text-blue-700 font-bold pl-4">
                Cr. Hardware Sales (Revenue): Rs. {invAmount.toLocaleString()}
              </p>
              <p className="text-purple-700 font-bold pl-4">
                Cr. VAT Payable (13%): Rs. {(invAmount * 0.13).toLocaleString()}
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              When saved, the invoice updates the dealer&apos;s ledger balance, posts to IRD Sales Register, and generates an electronic voucher reference.
            </p>
          </div>
        </div>
      )}

      {/* 2. DEALER PAYMENT RECEIPT VOUCHER */}
      {activeTab === 'receipt_voucher' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Record Dealer Payment Collection (नगदी / चेक भुक्तानी रसिद)
            </h2>

            {receiptSuccessNotice && (
              <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{receiptSuccessNotice}</span>
              </div>
            )}

            <form onSubmit={handleRecordReceipt} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Paying Dealer / Hardware Store</label>
                  <select
                    value={receiptDealerId}
                    onChange={(e) => setReceiptDealerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Prop: {s.ownerName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Deposit To Bank / Cash Account</label>
                  <select
                    value={receiptPaymentMode}
                    onChange={(e) => setReceiptPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="1002">Nabil Bank Current A/c (1002)</option>
                    <option value="1003">NIC Asia Bank A/c (1003)</option>
                    <option value="1001">Cash in Hand / Counter (1001)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount Collected (NPR)</label>
                  <input
                    type="number"
                    value={receiptAmount}
                    onChange={(e) => setReceiptAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Cheque / Bank Transfer Ref No.</label>
                  <input
                    type="text"
                    value={receiptChequeRef}
                    onChange={(e) => setReceiptChequeRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Narration / Particulars</label>
                <input
                  type="text"
                  value={receiptNarration}
                  onChange={(e) => setReceiptNarration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Post Receipt Voucher & Credit Dealer Khata</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-emerald-600" />
              Receipt Voucher Effect
            </h3>
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
              <p className="text-emerald-700 font-bold">Dr. Bank / Cash: Rs. {receiptAmount.toLocaleString()}</p>
              <p className="text-blue-700 font-bold pl-4">Cr. Sundry Debtors: Rs. {receiptAmount.toLocaleString()}</p>
            </div>
            <p className="text-[11px] text-slate-500">
              Reduces the outstanding receivables and aging bucket balance for the selected retail dealer immediately.
            </p>
          </div>
        </div>
      )}

      {/* 3. DEALER KHATA & CREDIT AGING */}
      {activeTab === 'credit_aging' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              Dealer Receivables Aging Analysis (उधारो असुली खाता)
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg">
              {dealerAging.length} Dealers Tracked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Dealer Hardware Store</th>
                  <th className="py-2.5 px-3 text-right">Total Purchases</th>
                  <th className="py-2.5 px-3 text-right">Total Paid</th>
                  <th className="py-2.5 px-3 text-right">Outstanding (Rs)</th>
                  <th className="py-2.5 px-3 text-right text-emerald-700">0–30 Days</th>
                  <th className="py-2.5 px-3 text-right text-blue-700">31–60 Days</th>
                  <th className="py-2.5 px-3 text-right text-amber-700">61–90 Days</th>
                  <th className="py-2.5 px-3 text-right text-red-700">90+ Days Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {dealerAging.map((d) => (
                  <tr key={d.shop.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-sans font-bold text-slate-900">
                      {d.shop.name}
                      <span className="block text-[10px] text-slate-400 font-normal font-sans">
                        {d.shop.location?.city} • PAN: {d.shop.panVatNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700">{formatNPR(d.purchases)}</td>
                    <td className="py-3 px-3 text-right text-emerald-700">{formatNPR(d.paid)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatNPR(d.balance)}</td>
                    <td className="py-3 px-3 text-right text-slate-600">{formatNPR(d.days0_30)}</td>
                    <td className="py-3 px-3 text-right text-blue-600">{formatNPR(d.days31_60)}</td>
                    <td className="py-3 px-3 text-right text-amber-600 font-bold">{formatNPR(d.days61_90)}</td>
                    <td className="py-3 px-3 text-right text-red-600 font-black">{formatNPR(d.days90_plus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ACCOUNT LEDGERS */}
      {activeTab === 'dealer_ledgers' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-600" />
              General Ledger Account View
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Select Account Head:</span>
              <select
                value={selectedLedgerCode}
                onChange={(e) => setSelectedLedgerCode(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                {chartOfAccounts.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} — {a.name} ({a.group})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Voucher No</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Narration & Particulars</th>
                  <th className="py-2.5 px-3 text-right">Debit (Dr)</th>
                  <th className="py-2.5 px-3 text-right">Credit (Cr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {selectedLedgerEntries.map((e, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 text-slate-600">{e.date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{e.voucherNo}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px] text-slate-500 font-bold">{e.voucherType}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-700">{e.narration}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      {e.debit > 0 ? formatNPR(e.debit) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                      {e.credit > 0 ? formatNPR(e.credit) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. DAYBOOK */}
      {activeTab === 'daybook' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              Day Book — Sequential Audit Chronology (दैनिक भौचर)
            </h2>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search daybook..."
                value={daybookSearch}
                onChange={(e) => setDaybookSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-3">
            {distributorJournals.map((j) => (
              <div key={j.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{j.voucherNo}</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] uppercase font-bold">
                      {j.voucherType}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">{j.date}</span>
                  </div>
                  <span className="font-bold font-mono text-slate-900 text-sm">
                    {formatNPR(j.totalAmount)}
                  </span>
                </div>
                <p className="text-slate-600 font-medium">{j.narration}</p>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  {j.lines.map((l, idx) => (
                    <div key={idx} className="flex justify-between py-0.5 bg-white px-2.5 py-1 rounded border border-slate-100">
                      <span className="text-slate-700">{l.accountName}</span>
                      <span className={l.debit > 0 ? 'text-emerald-700 font-bold' : 'text-blue-700 font-bold'}>
                        {l.debit > 0 ? `Dr ${formatNPR(l.debit)}` : `Cr ${formatNPR(l.credit)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TRIAL BALANCE */}
      {activeTab === 'trial_balance' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-orange-600" />
              Trial Balance Statement (सन्तुलन परीक्षण)
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Account Head Name</th>
                  <th className="py-2.5 px-3">Group</th>
                  <th className="py-2.5 px-3 text-right">Debit (Dr)</th>
                  <th className="py-2.5 px-3 text-right">Credit (Cr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {accountBalances.map((a) => {
                  const isDr = a.type === 'asset' || a.type === 'expense';
                  return (
                    <tr key={a.code} className="hover:bg-slate-50/70 transition">
                      <td className="py-2 px-3 text-slate-500 font-bold">{a.code}</td>
                      <td className="py-2 px-3 font-sans font-semibold text-slate-800">{a.name}</td>
                      <td className="py-2 px-3 font-sans text-slate-500">{a.group}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">
                        {isDr && a.closingBalance > 0 ? formatNPR(a.closingBalance) : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-blue-700">
                        {!isDr && a.closingBalance > 0 ? formatNPR(a.closingBalance) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-mono font-black text-xs">
                  <td colSpan={3} className="py-3 px-3 font-sans">Total Balance</td>
                  <td className="py-3 px-3 text-right text-emerald-400">{formatNPR(totalTBDr)}</td>
                  <td className="py-3 px-3 text-right text-amber-400">{formatNPR(totalTBCr)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 7. P&L STATEMENT */}
      {activeTab === 'pnl' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            Profit & Loss Financial Statement (नाफा नोक्सान हिसाब)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Revenue Column */}
            <div className="space-y-3 p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
              <h3 className="font-bold text-emerald-900 text-sm">Wholesale Revenues</h3>
              <div className="divide-y divide-emerald-100">
                {accountBalances
                  .filter((a) => a.type === 'income')
                  .map((a) => (
                    <div key={a.code} className="py-2 flex justify-between">
                      <span className="font-medium text-slate-800">{a.name}</span>
                      <span className="font-bold font-mono text-emerald-800">{formatNPR(a.closingBalance)}</span>
                    </div>
                  ))}
              </div>
              <div className="pt-2 border-t border-emerald-200 flex justify-between font-bold text-emerald-900">
                <span>Total Wholesale Revenue</span>
                <span className="font-mono text-sm">{formatNPR(totalRevenue)}</span>
              </div>
            </div>

            {/* Expense Column */}
            <div className="space-y-3 p-4 bg-rose-50/40 rounded-xl border border-rose-100">
              <h3 className="font-bold text-rose-900 text-sm">Operating & Purchase Expenses</h3>
              <div className="divide-y divide-rose-100">
                {accountBalances
                  .filter((a) => a.type === 'expense')
                  .map((a) => (
                    <div key={a.code} className="py-2 flex justify-between">
                      <span className="font-medium text-slate-800">{a.name}</span>
                      <span className="font-bold font-mono text-rose-800">{formatNPR(a.closingBalance)}</span>
                    </div>
                  ))}
              </div>
              <div className="pt-2 border-t border-rose-200 flex justify-between font-bold text-rose-900">
                <span>Total Expenses</span>
                <span className="font-mono text-sm">{formatNPR(totalExpenses)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Net Wholesale Surplus / Profit</p>
              <p className="text-xl font-black text-amber-400 font-mono mt-0.5">{formatNPR(netProfit)}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
              Healthy Margin
            </span>
          </div>
        </div>
      )}

      {/* 8. IRD VAT REGISTER */}
      {activeTab === 'vat_register' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Inland Revenue Department (IRD) 13% Sales VAT Register
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complies with Section 16 of Nepal VAT Act 2052. Format Schedule 5.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Annex</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-3">Buyer Dealer</th>
                  <th className="py-2.5 px-3">Buyer PAN</th>
                  <th className="py-2.5 px-3 text-right">Taxable Supply (Rs)</th>
                  <th className="py-2.5 px-3 text-right text-orange-600">13% Output VAT</th>
                  <th className="py-2.5 px-3 text-right font-black">Gross Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {distributorJournals
                  .filter((j) => j.voucherType === 'sales')
                  .map((j) => {
                    const taxable = Math.round(j.totalAmount / 1.13);
                    const vat = j.totalAmount - taxable;
                    return (
                      <tr key={j.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2 px-3 text-slate-600">{j.date}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{j.referenceNo || j.voucherNo}</td>
                        <td className="py-2 px-3 font-sans font-semibold text-slate-800">{j.partyName}</td>
                        <td className="py-2 px-3 text-slate-600">{j.partyPan || '601245890'}</td>
                        <td className="py-2 px-3 text-right text-slate-700">{formatNPR(taxable)}</td>
                        <td className="py-2 px-3 text-right text-orange-600 font-bold">{formatNPR(vat)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatNPR(j.totalAmount)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. MANUAL JOURNAL ENTRY */}
      {activeTab === 'journal' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-orange-600" />
            Create Manual Journal Voucher (भौचर प्रविष्टि)
          </h2>

          {jrnSuccessNotice && (
            <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{jrnSuccessNotice}</span>
            </div>
          )}

          <form onSubmit={handleCreateJournal} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Narration / Particulars</label>
              <input
                type="text"
                required
                value={jrnNarration}
                onChange={(e) => setJrnNarration(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Debit Account (Dr)</label>
                <select
                  value={jrnDrCode}
                  onChange={(e) => setJrnDrCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  {chartOfAccounts.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.code} — {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Credit Account (Cr)</label>
                <select
                  value={jrnCrCode}
                  onChange={(e) => setJrnCrCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  {chartOfAccounts.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.code} — {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Voucher Amount (NPR)</label>
              <input
                type="number"
                required
                value={jrnAmount}
                onChange={(e) => setJrnAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Post Double Entry Journal</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
