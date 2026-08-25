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
  Boxes,
  Calculator,
  Receipt,
  MapPin,
} from 'lucide-react';

interface DistributorDashboardProps {
  onNavigate: (
    tab:
      | 'dealers'
      | 'orders'
      | 'stock'
      | 'accounting'
      | 'wholesale_catalog'
      | 'purchase_orders'
      | 'retailer_ledgers'
  ) => void;
}

export const DistributorDashboard: React.FC<DistributorDashboardProps> = ({ onNavigate }) => {
  const { activeDistributorId, distributors, distributorOrders, products, shops } = useApp();

  const currentDistributor =
    distributors.find((d) => d.id === activeDistributorId) || distributors[0];
  const wholesaleProducts = products.filter(
    (p) => p.shopId === activeDistributorId || p.isWholesale
  );
  const myOrders = distributorOrders.filter((o) => o.distributorId === activeDistributorId);

  const totalTurnover = myOrders.reduce((sum, o) => sum + o.totalAmount, 0) + 1250000;
  const pendingOrders = myOrders.filter((o) => o.status === 'submitted' || o.status === 'accepted');
  const totalStockValuation = wholesaleProducts.reduce(
    (sum, p) => sum + p.stock * (p.costPrice || p.price * 0.9),
    0
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner in Bento Style */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentDistributor.logoImage || currentDistributor.bannerImage}
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('dealers')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700 transition"
          >
            <Users className="w-3.5 h-3.5 text-orange-400" />
            <span>Dealer Network</span>
          </button>

          <button
            onClick={() => onNavigate('stock')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700 transition"
          >
            <Boxes className="w-3.5 h-3.5 text-blue-400" />
            <span>Stock Inventory</span>
          </button>

          <button
            onClick={() => onNavigate('accounting')}
            className="px-3.5 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/20 transition"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Distributor Accounting ERP</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Incoming Requisitions
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{myOrders.length} Dealer POs</p>
          <p className="text-[11px] text-orange-600 font-bold mt-1 group-hover:underline flex items-center gap-1">
            <span>{pendingOrders.length} pending dispatch</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Metric 2: Dealers Network */}
        <div
          onClick={() => onNavigate('dealers')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Dealer Network (पसलहरू)
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{shops.length} Retailers</p>
          <p className="text-[11px] text-purple-600 font-bold mt-1 group-hover:underline flex items-center gap-1">
            <span>View list & locations</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Metric 3: Current Stock */}
        <div
          onClick={() => onNavigate('stock')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Current Available Stock
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatNPR(totalStockValuation)}</p>
          <p className="text-[11px] text-blue-600 font-bold mt-1 group-hover:underline flex items-center gap-1">
            <span>{wholesaleProducts.length} Wholesale SKUs</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Metric 4: Accounting Suite */}
        <div
          onClick={() => onNavigate('accounting')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Wholesale ERP & VAT
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatNPR(totalTurnover)}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1 group-hover:underline flex items-center gap-1">
            <span>Double-entry Khata & Trial Balance</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Recent Dealer Orders with Locations */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-orange-600" />
            Recent Dealer Orders & Delivery Locations
          </h2>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs text-orange-600 hover:text-orange-700 font-bold cursor-pointer"
          >
            View All Order Lists →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-2.5 px-3">PO Number</th>
                <th className="py-2.5 px-3">Dealer Store Name</th>
                <th className="py-2.5 px-3">Location & City</th>
                <th className="py-2.5 px-3">Terms</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Payable (Rs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {myOrders.map((o) => {
                const shop = shops.find((s) => s.id === o.shopId);
                const location = shop?.location
                  ? `${shop.location.area || shop.address}, ${shop.location.city}`
                  : shop?.address || 'Kathmandu Valley';

                return (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-bold text-orange-600">{o.poNumber}</td>
                    <td className="py-3 px-3 font-sans text-slate-900 font-bold">
                      {o.shopName}
                      <span className="block text-[10px] text-slate-400 font-normal font-sans">
                        PAN: {o.shopPan}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-700 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                        <span>{location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] text-slate-500 font-bold">
                      {o.paymentTerms ? o.paymentTerms.replace('_', ' ') : 'Credit 30 Days'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full text-[10px] font-bold uppercase">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      {formatNPR(o.totalAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
