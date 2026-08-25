import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNPR } from '../../utils/formatters';
import {
  Users,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowDownRight,
  TrendingDown,
} from 'lucide-react';

export const DistributorRetailerLedger: React.FC = () => {
  const { activeDistributorId, shops, distributorOrders } = useApp();

  const [paymentAmount, setPaymentAmount] = useState<number>(50000);
  const [selectedShop, setSelectedShop] = useState<string>(shops[0]?.id || '');
  const [successNotice, setSuccessNotice] = useState('');

  // Retailers and their simulated B2B balances
  const retailerAccounts = shops.map((s, idx) => {
    const shopPOs = distributorOrders.filter((o) => o.shopId === s.id);
    const totalPurchases = shopPOs.reduce((sum, o) => sum + o.totalAmount, 0) + (idx === 0 ? 320000 : 185000);
    const totalPaid = idx === 0 ? 150000 : 75000;
    const balance = totalPurchases - totalPaid;

    return {
      shop: s,
      totalPurchases,
      totalPaid,
      outstandingBalance: balance,
      aging: {
        current: Math.round(balance * 0.5),
        days30: Math.round(balance * 0.3),
        days60: Math.round(balance * 0.15),
        days90Plus: Math.round(balance * 0.05),
      },
    };
  });

  const totalOutstanding = retailerAccounts.reduce((s, r) => s + r.outstandingBalance, 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetShop = shops.find((s) => s.id === selectedShop);
    setSuccessNotice(`Payment of Rs ${paymentAmount.toLocaleString()} recorded from ${targetShop?.name}. Bank Ledger credited.`);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold tracking-tight">
              Retailer Credit Ledgers & Aging (उधारो खाता तथा असुली)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track hardware store receivables, credit aging buckets, and record bank collections.
          </p>
        </div>

        <div className="text-right bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
          <p className="text-[11px] text-slate-400">Total B2B Outstanding Receivables</p>
          <p className="text-xl font-black text-amber-400">{formatNPR(totalOutstanding)}</p>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Grid: Aging Table + Record Payment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aging Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            Retail Hardware Store Credit Aging Buckets
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y border-slate-200 text-slate-700">
                  <th className="py-2.5 px-3 font-semibold">Store / Owner</th>
                  <th className="py-2.5 px-3 font-semibold text-right">0–30 Days</th>
                  <th className="py-2.5 px-3 font-semibold text-right">31–60 Days</th>
                  <th className="py-2.5 px-3 font-semibold text-right">61–90 Days</th>
                  <th className="py-2.5 px-3 font-semibold text-right text-red-600">90+ Overdue</th>
                  <th className="py-2.5 px-3 font-semibold text-right font-black">Total Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {retailerAccounts.map((acc) => (
                  <tr key={acc.shop.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{acc.shop.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">PAN: {acc.shop.panVatNumber}</p>
                    </td>
                    <td className="py-3 px-3 text-right">{formatNPR(acc.aging.current)}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{formatNPR(acc.aging.days30)}</td>
                    <td className="py-3 px-3 text-right text-amber-700 font-semibold">{formatNPR(acc.aging.days60)}</td>
                    <td className="py-3 px-3 text-right text-red-600 font-bold">{formatNPR(acc.aging.days90Plus)}</td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      {formatNPR(acc.outstandingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Payment Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Record Retailer Payment
          </h2>

          <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Hardware Store</label>
              <select
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Amount (Rs)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Settlement Channel</label>
              <select className="w-full p-2 border border-slate-300 rounded-lg font-semibold">
                <option>Nabil Bank RTGS / IPS</option>
                <option>NIC Asia Corporate Cheque</option>
                <option>Account Transfer (Fund Transfer)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Credit Retailer Khata</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
