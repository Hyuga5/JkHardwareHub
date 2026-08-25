import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatNPR } from '../../utils/formatters';
import { translations } from '../../utils/translations';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Receipt,
  Store,
  Truck,
  Sparkles,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Users,
  CreditCard,
  BarChart3,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface ShopDashboardProps {
  onNavigate: (tab: 'orders' | 'catalog' | 'accounting' | 'boosting' | 'kyc') => void;
}

export const ShopDashboard: React.FC<ShopDashboardProps> = ({ onNavigate }) => {
  const { activeShopId, shops, orders, products, language, boostCampaigns, ledgerEntries } = useApp();

  const currentShop = shops.find((s) => s.id === activeShopId) || shops[0];
  const shopOrders = orders.filter((o) => o.shopId === activeShopId);
  const shopProducts = products.filter((p) => p.shopId === activeShopId && !p.isWholesale);
  const lowStockItems = shopProducts.filter((p) => p.stock <= p.lowStockThreshold);

  const pendingOrders = shopOrders.filter((o) => o.orderStatus === 'placed' || o.orderStatus === 'accepted');
  const totalSalesRevenue = shopOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalVatLiability = shopOrders.reduce((sum, o) => sum + o.vatAmount, 0);

  const t = translations[language];

  // Micro chart dummy heights for weekly sales cadence
  const weeklyBars = [
    { day: 'Sun', height: 'h-12', amt: '45k' },
    { day: 'Mon', height: 'h-18', amt: '82k' },
    { day: 'Tue', height: 'h-14', amt: '64k' },
    { day: 'Wed', height: 'h-24', amt: '110k' },
    { day: 'Thu', height: 'h-28', amt: '145k', highlight: true },
    { day: 'Fri', height: 'h-20', amt: '92k' },
    { day: 'Sat', height: 'h-10', amt: '38k' },
  ];

  return (
    <div className="space-y-5 pb-16">
      {/* Top Bento Notification Strip: Fiscal Tax Filing Reminder & Quick POS CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/40 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Fiscal Year 2081/82 (Q3)
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> IRD Compliant
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">
              {currentShop.name} — PAN: <span className="font-mono text-orange-300">{currentShop.panVatNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('accounting')}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Counter POS Billing</span>
          </button>
          <button
            onClick={() => onNavigate('boosting')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Boost Store</span>
          </button>
        </div>
      </div>

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Bento Cell 1 (Span 2 cols, 2 rows on lg): Live Revenue & Micro-Bar Chart */}
        <div className="md:col-span-2 lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Counter & Online Revenue
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-3xl font-black text-white tracking-tight">
                    {formatNPR(totalSalesRevenue)}
                  </h2>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +14.8%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-orange-400">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Generated across {shopOrders.length} online marketplace & offline counter tax invoices.
            </p>
          </div>

          {/* Micro Visual Bar Chart for Sales Trend */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold text-slate-300">7-Day Sales Volume Rhythm</span>
              <span className="text-orange-400 font-mono text-[11px]">Peak: NPR 145,000</span>
            </div>
            <div className="flex items-end justify-between gap-2 h-28 pt-2 px-2 bg-slate-950/40 rounded-xl border border-slate-800/50">
              {weeklyBars.map((b) => (
                <div key={b.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group/bar">
                  <div
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                      b.highlight
                        ? 'bg-orange-500 shadow-md shadow-orange-500/30'
                        : 'bg-slate-700 group-hover/bar:bg-slate-600'
                    } ${b.height}`}
                  />
                  <span className="text-[10px] font-mono text-slate-400 font-medium">{b.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-[#60bb46]" /> eSewa: 48%
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-[#5d2e8e]" /> Khalti: 32%
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> Cash: 20%
              </span>
            </div>
            <button
              onClick={() => onNavigate('accounting')}
              className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
            >
              Full Ledger <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Cell 2: 13% IRD VAT Liability & Tax Compliance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider">13% IRD Sales VAT</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white mt-2">
              {formatNPR(totalVatLiability)}
            </h3>
            <p className="text-[11px] text-blue-400 font-semibold mt-1">
              Annex 13 Ledger Synchronized
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Taxable Sales:</span>
                <span className="font-mono text-slate-200">{formatNPR(totalSalesRevenue - totalVatLiability)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Zero-VAT Goods:</span>
                <span className="font-mono text-slate-200">NPR 0</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('accounting')}
              className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-1"
            >
              <span>View VAT Return (CBMS)</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bento Cell 3: Orders to Dispatch Pipeline */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider">Orders to Dispatch</span>
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white mt-2">
              {pendingOrders.length}
            </h3>
            <p className="text-[11px] text-orange-400 font-semibold mt-1">
              Awaiting site delivery packing
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="space-y-2 text-[11px]">
              {pendingOrders.slice(0, 2).map((po) => (
                <div key={po.id} className="flex items-center justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                  <span className="font-mono font-bold text-slate-200">{po.invoiceNumber}</span>
                  <span className="text-orange-400 font-bold">{formatNPR(po.totalAmount)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('orders')}
              className="w-full mt-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-orange-500/20"
            >
              <span>Process Pipeline ({pendingOrders.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bento Cell 4 (Span 2 cols): Recent Double-Entry Ledger Postings */}
        <div className="md:col-span-2 lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Recent Double-Entry Ledger Postings
              </h3>
            </div>
            <button
              onClick={() => onNavigate('accounting')}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold"
            >
              Open BusyWin Suite →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3 font-semibold">Voucher #</th>
                  <th className="py-2 px-3 font-semibold">Account Head</th>
                  <th className="py-2 px-3 font-semibold">Type</th>
                  <th className="py-2 px-3 font-semibold text-right">Debit (NPR)</th>
                  <th className="py-2 px-3 font-semibold text-right">Credit (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {ledgerEntries.slice(0, 4).map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-bold text-orange-400">{entry.voucherNumber}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-200">{entry.accountHead}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-bold uppercase">
                        {entry.voucherType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                      {entry.debit > 0 ? formatNPR(entry.debit) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 font-bold">
                      {entry.credit > 0 ? formatNPR(entry.credit) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bento Cell 5 (Span 2 cols): Low Stock & MOQ Reorder Watchlist */}
        <div className="md:col-span-2 lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Inventory Watchlist (Low Stock)
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] font-bold">
                {lowStockItems.length} SKUs Alert
              </span>
            </div>

            <div className="space-y-2">
              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  All hardware stock inventory thresholds healthy!
                </div>
              ) : (
                lowStockItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-200 truncate max-w-[200px]">{item.name}</p>
                      <p className="text-[11px] text-red-400 font-mono mt-0.5">
                        Stock: {item.stock} {item.unit} (Threshold: {item.lowStockThreshold})
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('catalog')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer"
                    >
                      Restock PO
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Direct factory supply from Himalayan & Jagdamba</span>
            <button
              onClick={() => onNavigate('catalog')}
              className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
            >
              Open Catalog <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
