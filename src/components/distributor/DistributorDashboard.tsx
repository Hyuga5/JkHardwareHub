import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatNPR } from '../../utils/formatters';
import {
  Building2,
  Truck,
  TrendingUp,
  Package,
  Users,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface DistributorDashboardProps {
  onNavigate: (tab: 'wholesale_catalog' | 'purchase_orders' | 'retailer_ledgers') => void;
}

export const DistributorDashboard: React.FC<DistributorDashboardProps> = ({ onNavigate }) => {
  const { activeDistributorId, distributors, distributorOrders, products } = useApp();

  const currentDistributor = distributors.find((d) => d.id === activeDistributorId) || distributors[0];
  const wholesaleProducts = products.filter((p) => p.isWholesale);
  const myOrders = distributorOrders.filter((o) => o.distributorId === activeDistributorId);

  const totalTurnover = myOrders.reduce((sum, o) => sum + o.totalAmount, 0) + 1250000;
  const pendingOrders = myOrders.filter((o) => o.status === 'submitted' || o.status === 'accepted');

  return (
    <div className="space-y-5 pb-16">
      {/* Top Banner in Bento Style */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentDistributor.logoImage}
            alt={currentDistributor.name}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-800 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{currentDistributor.name}</h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                PAN Verified ({currentDistributor.panVatNumber})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {currentDistributor.address} • Contact: {currentDistributor.contactPerson} ({currentDistributor.phone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('purchase_orders')}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/20 transition"
          >
            <Truck className="w-4 h-4" />
            <span>Manage Freight Orders</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="text-[10px] uppercase font-bold tracking-wider">Wholesale Supply Turnover</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{formatNPR(totalTurnover)}</p>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">B2B supply contracts</p>
        </div>

        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="text-[10px] uppercase font-bold tracking-wider">Requisition POs to Dispatch</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{pendingOrders.length}</p>
          <button
            onClick={() => onNavigate('purchase_orders')}
            className="text-[11px] text-orange-400 font-bold hover:underline mt-1 block"
          >
            Review Incoming POs →
          </button>
        </div>

        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="text-[10px] uppercase font-bold tracking-wider">Factory Wholesale SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{wholesaleProducts.length} Lines</p>
          <button
            onClick={() => onNavigate('wholesale_catalog')}
            className="text-[11px] text-blue-400 font-bold hover:underline mt-1 block"
          >
            View Factory Catalog →
          </button>
        </div>

        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="text-[10px] uppercase font-bold tracking-wider">Supplied Retailer Network</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">12 Stores</p>
          <button
            onClick={() => onNavigate('retailer_ledgers')}
            className="text-[11px] text-purple-400 font-bold hover:underline mt-1 block"
          >
            View Retailer Khata →
          </button>
        </div>
      </div>

      {/* Recent PO Requisitions in Bento Style */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-orange-400" />
            Recent Retailer Purchase Orders
          </h2>
          <button
            onClick={() => onNavigate('purchase_orders')}
            className="text-xs text-orange-400 hover:text-orange-300 font-bold"
          >
            View All POs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3 font-semibold">PO Number</th>
                <th className="py-2 px-3 font-semibold">Retail Hardware Shop</th>
                <th className="py-2 px-3 font-semibold">Terms</th>
                <th className="py-2 px-3 font-semibold">Status</th>
                <th className="py-2 px-3 font-semibold text-right">Amount (Rs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {myOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-bold text-orange-400">{o.poNumber}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-200 font-semibold">{o.shopName}</td>
                  <td className="py-2.5 px-3 uppercase text-[10px] text-slate-400 font-bold">{o.paymentTerms.replace('_', ' ')}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-bold uppercase">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-white">
                    {formatNPR(o.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
