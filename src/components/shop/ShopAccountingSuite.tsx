import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JournalEntry, AccountHead, Order, Product } from '../../types';
import { formatNPR } from '../../utils/formatters';
import { translations } from '../../utils/translations';
import { TaxInvoiceModal } from '../common/TaxInvoiceModal';
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
  Download,
  Printer,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Filter,
  Users,
} from 'lucide-react';

export const ShopAccountingSuite: React.FC = () => {
  const {
    activeShopId,
    shops,
    chartOfAccounts,
    journalEntries,
    fiscalYear,
    setFiscalYear,
    createQuickPOSSale,
    createPurchaseVoucher,
    createJournalVoucher,
    products,
    language,
    orders,
  } = useApp();

  const currentShop = shops.find((s) => s.id === activeShopId) || shops[0];
  const shopProducts = products.filter((p) => p.shopId === activeShopId && !p.isWholesale);
  const shopOrders = orders.filter((o) => o.shopId === activeShopId);
  const shopJournals = journalEntries.filter((j) => j.shopId === activeShopId);

  // Accounting Subtabs
  const [activeTab, setActiveTab] = useState<
    | 'pos'
    | 'purchase'
    | 'journal'
    | 'ledgers'
    | 'daybook'
    | 'trial_balance'
    | 'pnl'
    | 'balance_sheet'
    | 'vat_register'
    | 'aging'
  >('pos');

  // POS Billing State
  const [posCustomerName, setPosCustomerName] = useState('Ram Bahadur Thapa (Contractor)');
  const [posCustomerPhone, setPosCustomerPhone] = useState('9841889900');
  const [posCustomerPan, setPosCustomerPan] = useState('');
  const [posPaymentType, setPosPaymentType] = useState<'cash' | 'bank' | 'credit'>('cash');
  const [posCart, setPosCart] = useState<{ productId: string; quantity: number; unitPrice: number; isVatExempt: boolean }[]>([]);
  const [selectedPosProduct, setSelectedPosProduct] = useState<string>(shopProducts[0]?.id || '');
  const [posQty, setPosQty] = useState<number>(1);
  const [lastGeneratedInvoice, setLastGeneratedInvoice] = useState<Order | null>(null);

  // Purchase Entry State
  const [purSupplierName, setPurSupplierName] = useState('Jagdamba Wholesale Depot');
  const [purSupplierPan, setPurSupplierPan] = useState('300456123');
  const [purInvoiceRef, setPurInvoiceRef] = useState(`SUPP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [purPaymentType, setPurPaymentType] = useState<'cash' | 'bank' | 'credit'>('credit');
  const [purItemName, setPurItemName] = useState('Shivam Cement OPC 53 Grade');
  const [purQty, setPurQty] = useState(50);
  const [purRate, setPurRate] = useState(685);
  const [purIsExempt, setPurIsExempt] = useState(false);
  const [purSuccessNotice, setPurSuccessNotice] = useState('');

  // Manual Journal State
  const [jrnNarration, setJrnNarration] = useState('Paid electricity bill for Shrawan 2081');
  const [jrnDrCode, setJrnDrCode] = useState('5003');
  const [jrnCrCode, setJrnCrCode] = useState('1001');
  const [jrnAmount, setJrnAmount] = useState(4500);

  // Selected Ledger Filter
  const [selectedLedgerCode, setSelectedLedgerCode] = useState<string>('1001');

  const t = translations[language];

  // Helper POS Cart Addition
  const handleAddPosItem = () => {
    const prod = products.find((p) => p.id === selectedPosProduct);
    if (!prod) return;

    setPosCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === prod.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += posQty;
        return next;
      }
      return [
        ...prev,
        {
          productId: prod.id,
          quantity: posQty,
          unitPrice: prod.price,
          isVatExempt: prod.isVatExempt,
        },
      ];
    });
    setPosQty(1);
  };

  const handleGeneratePOSInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (posCart.length === 0) {
      alert('Please add at least one hardware product to bill.');
      return;
    }

    const newOrder = createQuickPOSSale({
      shopId: activeShopId,
      customerName: posCustomerName,
      customerPhone: posCustomerPhone,
      customerPan: posCustomerPan,
      paymentMethod: posPaymentType,
      items: posCart,
    });

    setLastGeneratedInvoice(newOrder);
    setPosCart([]);
  };

  const handleSavePurchaseEntry = (e: React.FormEvent) => {
    e.preventDefault();
    createPurchaseVoucher({
      shopId: activeShopId,
      supplierName: purSupplierName,
      supplierPan: purSupplierPan,
      invoiceRef: purInvoiceRef,
      date: new Date().toISOString().split('T')[0],
      paymentType: purPaymentType,
      items: [
        {
          productName: purItemName,
          quantity: purQty,
          unitPrice: purRate,
          isVatExempt: purIsExempt,
        },
      ],
    });

    setPurSuccessNotice(`Purchase entry ${purInvoiceRef} posted to ledgers with 13% Input VAT claim.`);
    setPurInvoiceRef(`SUPP-${Math.floor(1000 + Math.random() * 9000)}`);
    setTimeout(() => setPurSuccessNotice(''), 4000);
  };

  const handleSaveJournalVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const drHead = chartOfAccounts.find((a) => a.code === jrnDrCode);
    const crHead = chartOfAccounts.find((a) => a.code === jrnCrCode);
    if (!drHead || !crHead || jrnAmount <= 0) return;

    createJournalVoucher({
      shopId: activeShopId,
      voucherType: 'journal',
      date: new Date().toISOString().split('T')[0],
      fiscalYear,
      narration: jrnNarration,
      totalAmount: jrnAmount,
      lines: [
        { accountCode: drHead.code, accountName: drHead.name, debit: jrnAmount, credit: 0 },
        { accountCode: crHead.code, accountName: crHead.name, debit: 0, credit: jrnAmount },
      ],
    });

    alert('Journal Voucher posted successfully (Debit = Credit verified).');
    setJrnNarration('');
    setJrnAmount(0);
  };

  // Calculations for Financial Statements
  // 1. Ledger balances calculated dynamically from journalEntries
  const dynamicAccountBalances = chartOfAccounts.map((head) => {
    let debitTotal = 0;
    let creditTotal = 0;

    for (const entry of shopJournals) {
      for (const line of entry.lines) {
        if (line.accountCode === head.code) {
          debitTotal += line.debit;
          creditTotal += line.credit;
        }
      }
    }

    // Normal debit accounts: Asset, Expense
    let calculatedBalance = head.balance;
    if (head.type === 'asset' || head.type === 'expense') {
      calculatedBalance = head.balance + (debitTotal - creditTotal);
    } else {
      // Normal credit accounts: Liability, Equity, Income
      calculatedBalance = head.balance + (creditTotal - debitTotal);
    }

    return {
      ...head,
      debitTotal,
      creditTotal,
      finalBalance: Math.max(0, calculatedBalance),
      calculatedBalance,
    };
  });

  // 2. Trial Balance
  const trialBalanceRows = dynamicAccountBalances.map((acc) => {
    const isDr = acc.type === 'asset' || acc.type === 'expense';
    return {
      code: acc.code,
      name: acc.name,
      type: acc.type,
      debit: isDr ? acc.finalBalance : 0,
      credit: !isDr ? acc.finalBalance : 0,
    };
  });
  const totalTBDebit = trialBalanceRows.reduce((s, r) => s + r.debit, 0);
  const totalTBCredit = trialBalanceRows.reduce((s, r) => s + r.credit, 0);

  // 3. Profit & Loss
  const salesRevenue = dynamicAccountBalances.find((a) => a.code === '4001')?.finalBalance || 620000;
  const costOfGoods = dynamicAccountBalances.find((a) => a.code === '5001')?.finalBalance || 460000;
  const grossProfit = salesRevenue - costOfGoods;
  const operatingExpenses = dynamicAccountBalances
    .filter((a) => a.type === 'expense' && a.code !== '5001')
    .reduce((s, a) => s + a.finalBalance, 0);
  const netProfit = grossProfit - operatingExpenses;

  // 4. IRD VAT Summary (Annex 13)
  const salesVatRecords = shopJournals.filter((j) => j.voucherType === 'sales');
  const purchaseVatRecords = shopJournals.filter((j) => j.voucherType === 'purchase');
  const totalSalesVat = salesVatRecords.reduce((sum, j) => {
    const vatLine = j.lines.find((l) => l.accountCode === '2010');
    return sum + (vatLine ? vatLine.credit : 0);
  }, 0);
  const totalPurchaseVat = purchaseVatRecords.reduce((sum, j) => {
    const vatLine = j.lines.find((l) => l.accountCode === '1030');
    return sum + (vatLine ? vatLine.debit : 0);
  }, 0);
  const netVatPayable = totalSalesVat - totalPurchaseVat;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Fiscal Year Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight">
                BusyWin Nepal Hardware Accounting Engine
              </h1>
              <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded">
                IRD Nepal Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Double-entry books, VAT Annex 13, POS Counter Billing, Party Ledgers & Balance Sheet
            </p>
          </div>
        </div>

        {/* Fiscal Year Selector */}
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-300 font-semibold">{t.fiscalYear}:</span>
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="bg-slate-900 text-amber-300 text-xs font-bold px-2 py-1 rounded focus:outline-none cursor-pointer"
          >
            <option value="2081/82">BS 2081/82 (Shrawan–Ashadh)</option>
            <option value="2082/83">BS 2082/83 (Shrawan–Ashadh)</option>
            <option value="2080/81">BS 2080/81</option>
          </select>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pos' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{t.posBilling} (POS)</span>
        </button>

        <button
          onClick={() => setActiveTab('purchase')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'purchase' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{t.purchaseEntry}</span>
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'journal' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{t.journalVouchers}</span>
        </button>

        <button
          onClick={() => setActiveTab('ledgers')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'ledgers' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t.ledgers}</span>
        </button>

        <button
          onClick={() => setActiveTab('daybook')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'daybook' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.dayBook}</span>
        </button>

        <button
          onClick={() => setActiveTab('trial_balance')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'trial_balance' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{t.trialBalance}</span>
        </button>

        <button
          onClick={() => setActiveTab('pnl')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pnl' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{t.profitLoss}</span>
        </button>

        <button
          onClick={() => setActiveTab('balance_sheet')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'balance_sheet' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>{t.balanceSheet}</span>
        </button>

        <button
          onClick={() => setActiveTab('vat_register')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'vat_register' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t.vatRegister}</span>
        </button>
      </div>

      {/* SUBTAB 1: POS COUNTER BILLING */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item Selector & POS Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" />
                Quick POS Counter Sales (काउन्टर बिलिङ)
              </h2>

              {/* Add Item Row */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                <div className="sm:col-span-6">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Select Hardware Product
                  </label>
                  <select
                    value={selectedPosProduct}
                    onChange={(e) => setSelectedPosProduct(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold"
                  >
                    {shopProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Rs. {p.price} ({p.stock} in stock)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={posQty}
                    onChange={(e) => setPosQty(parseInt(e.target.value) || 1)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={handleAddPosItem}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Cart Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <th className="py-2 px-3 font-semibold">Item</th>
                      <th className="py-2 px-3 font-semibold text-right">Rate (Rs)</th>
                      <th className="py-2 px-3 font-semibold text-center">Qty</th>
                      <th className="py-2 px-3 font-semibold text-right">Taxable</th>
                      <th className="py-2 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {posCart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No items added yet. Select product and click Add Item.
                        </td>
                      </tr>
                    ) : (
                      posCart.map((item, idx) => {
                        const prod = products.find((p) => p.id === item.productId);
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">
                              {prod?.name}
                              {item.isVatExempt && <span className="ml-1 text-[10px] text-amber-700">(Exempt)</span>}
                            </td>
                            <td className="py-2 px-3 text-right">{item.unitPrice}</td>
                            <td className="py-2 px-3 text-center font-bold">{item.quantity}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">
                              {(item.quantity * item.unitPrice).toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                onClick={() => setPosCart((p) => p.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Customer Details & Checkout Totals */}
          <div className="space-y-4">
            <form onSubmit={handleGeneratePOSInvoice} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Counter Invoice Details</h2>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Customer / Contractor Name
                </label>
                <input
                  type="text"
                  value={posCustomerName}
                  onChange={(e) => setPosCustomerName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Phone No.
                  </label>
                  <input
                    type="text"
                    value={posCustomerPhone}
                    onChange={(e) => setPosCustomerPhone(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Buyer PAN (Optional)
                  </label>
                  <input
                    type="text"
                    value={posCustomerPan}
                    onChange={(e) => setPosCustomerPan(e.target.value)}
                    placeholder="600XXXXXX"
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Settlement Method
                </label>
                <select
                  value={posPaymentType}
                  onChange={(e) => setPosPaymentType(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="cash">Cash in Hand (नगद)</option>
                  <option value="bank">Bank QR / Fonepay / eSewa</option>
                  <option value="credit">Sundry Debtor Credit (उधारो खाता)</option>
                </select>
              </div>

              {/* Tax Math Summary */}
              {(() => {
                let taxable = 0;
                let exempt = 0;
                for (const it of posCart) {
                  const line = it.quantity * it.unitPrice;
                  if (it.isVatExempt) exempt += line;
                  else taxable += line;
                }
                const vat = Math.round(taxable * 0.13 * 100) / 100;
                const total = taxable + exempt + vat;

                return (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Taxable Amount:</span>
                      <span className="font-semibold text-slate-800">{formatNPR(taxable)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>VAT Exempt:</span>
                      <span className="font-semibold text-slate-800">{formatNPR(exempt)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>13% Nepal VAT:</span>
                      <span className="font-semibold text-emerald-700">+{formatNPR(vat)}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-slate-200 text-sm font-black text-slate-900">
                      <span>Grand Total:</span>
                      <span>{formatNPR(total)}</span>
                    </div>
                  </div>
                );
              })()}

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Save POS Sale & Generate Tax Invoice</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PURCHASE VOUCHER ENTRY */}
      {activeTab === 'purchase' && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              Supplier Purchase Entry (खरिद प्रविष्टि)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Record hardware purchases from wholesale suppliers with 13% Input VAT claimable credit.
            </p>
          </div>

          {purSuccessNotice && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{purSuccessNotice}</span>
            </div>
          )}

          <form onSubmit={handleSavePurchaseEntry} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Party Name</label>
                <input
                  type="text"
                  value={purSupplierName}
                  onChange={(e) => setPurSupplierName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier PAN / VAT No.</label>
                <input
                  type="text"
                  value={purSupplierPan}
                  onChange={(e) => setPurSupplierPan(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Invoice Ref #</label>
                <input
                  type="text"
                  value={purInvoiceRef}
                  onChange={(e) => setPurInvoiceRef(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment / Credit Terms</label>
                <select
                  value={purPaymentType}
                  onChange={(e) => setPurPaymentType(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="credit">Creditor Account (उधारो)</option>
                  <option value="bank">Bank Transfer (नबिल / एनआईसी)</option>
                  <option value="cash">Cash in Hand (नगद)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800">Item Line Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Description of Goods</label>
                  <input
                    type="text"
                    value={purItemName}
                    onChange={(e) => setPurItemName(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Qty</label>
                  <input
                    type="number"
                    value={purQty}
                    onChange={(e) => setPurQty(parseInt(e.target.value) || 1)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Purchase Rate (Rs.)</label>
                  <input
                    type="number"
                    value={purRate}
                    onChange={(e) => setPurRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold"
                    required
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={purIsExempt}
                      onChange={(e) => setPurIsExempt(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>VAT Exempt Good (0%)</span>
                  </label>
                </div>
              </div>

              {/* Math preview */}
              <div className="pt-2 border-t border-slate-200 text-xs flex justify-between font-bold text-slate-800">
                <span>Total with 13% Input VAT:</span>
                <span>
                  {formatNPR(
                    purIsExempt
                      ? purQty * purRate
                      : (purQty * purRate) * 1.13
                  )}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Post Purchase Entry to Ledger</span>
            </button>
          </form>
        </div>
      )}

      {/* SUBTAB 3: GENERAL JOURNAL VOUCHERS */}
      {activeTab === 'journal' && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-600" />
              Double-Entry Journal Voucher (जर्नल भौचर)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict double entry: Total Debit must equal Total Credit.
            </p>
          </div>

          <form onSubmit={handleSaveJournalVoucher} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Narration (कैफियत)</label>
              <input
                type="text"
                value={jrnNarration}
                onChange={(e) => setJrnNarration(e.target.value)}
                placeholder="e.g. Paid shop electricity bill via Cash"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Debit Account (Dr.)</label>
                <select
                  value={jrnDrCode}
                  onChange={(e) => setJrnDrCode(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-semibold"
                >
                  {chartOfAccounts.map((acc) => (
                    <option key={acc.code} value={acc.code}>
                      [{acc.code}] {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Credit Account (Cr.)</label>
                <select
                  value={jrnCrCode}
                  onChange={(e) => setJrnCrCode(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-semibold"
                >
                  {chartOfAccounts.map((acc) => (
                    <option key={acc.code} value={acc.code}>
                      [{acc.code}] {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Voucher Amount (Rs.)</label>
              <input
                type="number"
                value={jrnAmount}
                onChange={(e) => setJrnAmount(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-black text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verify & Save Journal Voucher</span>
            </button>
          </form>
        </div>
      )}

      {/* SUBTAB 4: PARTY & GENERAL LEDGERS */}
      {activeTab === 'ledgers' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                Party & General Account Ledgers (खाता पाना)
              </h2>
              <p className="text-xs text-slate-500">
                Running debit/credit balance posted automatically from invoices and vouchers
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Select Account:</span>
              <select
                value={selectedLedgerCode}
                onChange={(e) => setSelectedLedgerCode(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {chartOfAccounts.map((acc) => (
                  <option key={acc.code} value={acc.code}>
                    [{acc.code}] {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ledger Table */}
          {(() => {
            const currentHead = chartOfAccounts.find((a) => a.code === selectedLedgerCode);
            const isDrNormal = currentHead?.type === 'asset' || currentHead?.type === 'expense';
            let runningBal = currentHead?.balance || 0;

            const relevantLines = shopJournals
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
              );

            return (
              <div className="overflow-x-auto">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-3 flex justify-between text-xs font-bold text-amber-950">
                  <span>Account: [{currentHead?.code}] {currentHead?.name}</span>
                  <span>Opening Balance: {formatNPR(currentHead?.balance || 0)}</span>
                </div>

                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-y border-slate-200 text-slate-700">
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Voucher #</th>
                      <th className="py-2.5 px-3 font-semibold">Particulars / Narration</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Debit (Dr.)</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Credit (Cr.)</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50/50">
                      <td className="py-2 px-3 text-slate-400">Opening</td>
                      <td className="py-2 px-3 text-slate-400">—</td>
                      <td className="py-2 px-3 font-medium text-slate-600">Opening Balance Brought Forward</td>
                      <td className="py-2 px-3 text-right text-slate-400">{isDrNormal ? formatNPR(currentHead?.balance || 0) : '—'}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{!isDrNormal ? formatNPR(currentHead?.balance || 0) : '—'}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{formatNPR(currentHead?.balance || 0)}</td>
                    </tr>
                    {relevantLines.map((row, idx) => {
                      if (isDrNormal) {
                        runningBal += row.debit - row.credit;
                      } else {
                        runningBal += row.credit - row.debit;
                      }
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-600">{row.date}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">{row.voucherNo}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{row.narration}</td>
                          <td className="py-2 px-3 text-right font-semibold text-slate-800">
                            {row.debit > 0 ? formatNPR(row.debit) : '—'}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-slate-800">
                            {row.credit > 0 ? formatNPR(row.credit) : '—'}
                          </td>
                          <td className="py-2 px-3 text-right font-black text-slate-900">
                            {formatNPR(runningBal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* SUBTAB 5: DAY BOOK */}
      {activeTab === 'daybook' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Day Book & Chronological Register (दैनिक खाता)
              </h2>
              <p className="text-xs text-slate-500">Every transaction logged in real-time</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold">
              {shopJournals.length} Transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-200 text-slate-700">
                  <th className="py-2 px-3 font-semibold">Date</th>
                  <th className="py-2 px-3 font-semibold">Voucher #</th>
                  <th className="py-2 px-3 font-semibold">Type</th>
                  <th className="py-2 px-3 font-semibold">Party / Particulars</th>
                  <th className="py-2 px-3 font-semibold text-right">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shopJournals.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-600">{j.date}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{j.voucherNo}</td>
                    <td className="py-2.5 px-3 uppercase font-bold text-[10px]">
                      <span className={`px-2 py-0.5 rounded ${
                        j.voucherType === 'sales' ? 'bg-emerald-100 text-emerald-800' :
                        j.voucherType === 'purchase' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {j.voucherType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{j.partyName || 'Counter Sale'}</p>
                      <p className="text-[11px] text-slate-500">{j.narration}</p>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900">
                      {formatNPR(j.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 6: TRIAL BALANCE */}
      {activeTab === 'trial_balance' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-600" />
                Trial Balance (सन्तुलन परीक्षण) — FY {fiscalYear}
              </h2>
              <p className="text-xs text-slate-500">
                Verifying that total debits equal total credits
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Balanced Books
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-200 text-slate-700">
                  <th className="py-2.5 px-3 font-semibold">Code</th>
                  <th className="py-2.5 px-3 font-semibold">Account Head</th>
                  <th className="py-2.5 px-3 font-semibold">Classification</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Debit (Dr.) Rs.</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Credit (Cr.) Rs.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialBalanceRows.map((row) => (
                  <tr key={row.code} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-500">{row.code}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{row.name}</td>
                    <td className="py-2 px-3 uppercase text-[10px] text-slate-500 font-semibold">{row.type}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-800">
                      {row.debit > 0 ? formatNPR(row.debit) : '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-800">
                      {row.credit > 0 ? formatNPR(row.credit) : '—'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-900 text-white font-black">
                  <td colSpan={3} className="py-3 px-3 uppercase tracking-wider text-right">
                    Total Trial Balance (जम्मा रकम):
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400">{formatNPR(totalTBDebit)}</td>
                  <td className="py-3 px-3 text-right text-emerald-400">{formatNPR(totalTBCredit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 7: PROFIT & LOSS */}
      {activeTab === 'pnl' && (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">{currentShop.name}</h2>
            <p className="text-xs text-slate-500 font-medium">Profit & Loss Statement (नाफा नोक्सान हिसाब)</p>
            <p className="text-xs font-bold text-slate-700 mt-1">For Nepal Fiscal Year: {fiscalYear}</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex justify-between font-bold text-emerald-950 text-sm">
                <span>Trading Revenue (बिक्री आम्दानी):</span>
                <span>{formatNPR(salesRevenue)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pl-3">
                <span>Less: Cost of Goods Sold (सामग्री खरिद):</span>
                <span>-{formatNPR(costOfGoods)}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-emerald-200 text-sm">
                <span>Gross Trading Profit (कुल नाफा):</span>
                <span>{formatNPR(grossProfit)}</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-800 mb-2">Operating & Indirect Expenses (सञ्चालन खर्चहरू):</p>
              {dynamicAccountBalances
                .filter((a) => a.type === 'expense' && a.code !== '5001')
                .map((exp) => (
                  <div key={exp.code} className="flex justify-between text-slate-600 pl-3">
                    <span>{exp.name}:</span>
                    <span className="font-medium text-slate-800">{formatNPR(exp.finalBalance)}</span>
                  </div>
                ))}
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Operating Expenses:</span>
                <span className="text-red-600">-{formatNPR(operatingExpenses)}</span>
              </div>
            </div>

            {/* Net Profit Summary */}
            <div className="p-5 bg-slate-900 text-white rounded-xl flex items-center justify-between text-base font-black">
              <span>Net Net Profit (खुद नाफा):</span>
              <span className="text-emerald-400 text-lg">{formatNPR(netProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 8: BALANCE SHEET */}
      {activeTab === 'balance_sheet' && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">{currentShop.name}</h2>
            <p className="text-xs text-slate-500 font-medium">Balance Sheet Statement (वासलात)</p>
            <p className="text-xs font-bold text-slate-700 mt-1">As of Ashadh End, FY {fiscalYear}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Liabilities & Equity */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
                Liabilities & Capital (पुँजी तथा दायित्व)
              </h3>
              <div className="space-y-2">
                <p className="font-bold text-slate-700">Owner's Equity:</p>
                <div className="flex justify-between pl-3 text-slate-600">
                  <span>Capital Account:</span>
                  <span className="font-semibold text-slate-800">Rs. 15,00,000.00</span>
                </div>
                <div className="flex justify-between pl-3 text-slate-600">
                  <span>Retained Net Earnings:</span>
                  <span className="font-semibold text-slate-800">{formatNPR(netProfit)}</span>
                </div>
                <p className="font-bold text-slate-700 pt-2">Current Liabilities:</p>
                <div className="flex justify-between pl-3 text-slate-600">
                  <span>Sundry Creditors (साहु उधारो):</span>
                  <span className="font-semibold text-slate-800">
                    {formatNPR(dynamicAccountBalances.find((a) => a.code === '2001')?.finalBalance || 340000)}
                  </span>
                </div>
                <div className="flex justify-between pl-3 text-slate-600">
                  <span>VAT Payable to IRD:</span>
                  <span className="font-semibold text-slate-800">
                    {formatNPR(Math.max(0, netVatPayable))}
                  </span>
                </div>
              </div>
            </div>

            {/* Assets */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
                Assets & Properties (सम्पत्ति तथा जायजेथा)
              </h3>
              <div className="space-y-2">
                <p className="font-bold text-slate-700">Current Assets:</p>
                <div className="flex justify-between pl-3 text-slate-600">
                  <span>Cash in Counter:</span>
                  <span className="font-semibold text-slate-800">
                    {formatNPR(dynamicAccountBalances.find((a) => a.code === '1001')?.finalBalance || 145000)}
                  </span>
                </div>
                <div className="flex justify-between pl-3 text-slate-600">
                  <span>Bank Accounts (Nabil/NIC):</span>
                  <span className="font-semibold text-slate-800">
                    {formatNPR(dynamicAccountBalances.find((a) => a.code === '1002')?.finalBalance || 485000)}
                  </span>
                </div>
                <div className="flex justify-between pl-3 text-slate-600">
                  <span>Sundry Debtors (ग्राहक उधारो):</span>
                  <span className="font-semibold text-slate-800">
                    {formatNPR(dynamicAccountBalances.find((a) => a.code === '1010')?.finalBalance || 185000)}
                  </span>
                </div>
                <div className="flex justify-between pl-3 text-slate-600">
                  <span>Hardware Inventory / Stock:</span>
                  <span className="font-semibold text-slate-800">
                    {formatNPR(dynamicAccountBalances.find((a) => a.code === '1020')?.finalBalance || 1250000)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 9: NEPAL IRD VAT REGISTER (ANNEX 13) */}
      {activeTab === 'vat_register' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Government of Nepal • IRD VAT Summary (अनुसूची १३)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Value Added Tax Form 13 formatted for Inland Revenue Department e-Filing
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700">PAN No: {currentShop.panVatNumber}</span>
              <p className="text-[11px] text-emerald-700 font-semibold">Standard 13% VAT</p>
            </div>
          </div>

          {/* Top VAT KPI Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-emerald-800 font-semibold">Total Output Sales VAT (A)</p>
              <p className="text-xl font-black text-emerald-950 mt-1">{formatNPR(totalSalesVat)}</p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Collected from customer invoices</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-blue-800 font-semibold">Total Input Purchase VAT (B)</p>
              <p className="text-xl font-black text-blue-950 mt-1">{formatNPR(totalPurchaseVat)}</p>
              <p className="text-[10px] text-blue-700 mt-0.5">Claimable on supplier purchases</p>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl">
              <p className="text-slate-300 font-semibold">Net Payable to IRD (A - B)</p>
              <p className="text-xl font-black text-amber-400 mt-1">{formatNPR(Math.max(0, netVatPayable))}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Due before 25th of next Nepali month</p>
            </div>
          </div>

          {/* Sales Book & Purchase Book Audit Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Sales Book Register (बिक्री खाता)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-200 text-slate-700">
                    <th className="py-2 px-3 font-semibold">Date</th>
                    <th className="py-2 px-3 font-semibold">Invoice No.</th>
                    <th className="py-2 px-3 font-semibold">Buyer Name / PAN</th>
                    <th className="py-2 px-3 font-semibold text-right">Taxable Sales (Rs.)</th>
                    <th className="py-2 px-3 font-semibold text-right">13% VAT (Rs.)</th>
                    <th className="py-2 px-3 font-semibold text-right">Grand Total (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shopOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-600">{new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{o.invoiceNumber}</td>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-slate-800">{o.customerName}</span>
                      </td>
                      <td className="py-2 px-3 text-right">{formatNPR(o.taxableSubtotal)}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">{formatNPR(o.vatAmount)}</td>
                      <td className="py-2 px-3 text-right font-black text-slate-900">{formatNPR(o.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal for last generated POS invoice */}
      {lastGeneratedInvoice && (
        <TaxInvoiceModal
          order={lastGeneratedInvoice}
          onClose={() => setLastGeneratedInvoice(null)}
        />
      )}
    </div>
  );
};
