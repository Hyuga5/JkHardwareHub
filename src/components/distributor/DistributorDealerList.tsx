import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shop } from '../../types';
import { formatNPR } from '../../utils/formatters';
import {
  Users,
  MapPin,
  Phone,
  ShieldCheck,
  Search,
  Store,
  CreditCard,
  Building2,
  Filter,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  ExternalLink,
  ChevronRight,
  Send,
} from 'lucide-react';

interface DistributorDealerListProps {
  onSelectDealer?: (shop: Shop) => void;
  onNavigateToAccounting?: () => void;
}

export const DistributorDealerList: React.FC<DistributorDealerListProps> = ({
  onSelectDealer,
  onNavigateToAccounting,
}) => {
  const { activeDistributorId, distributors, shops, distributorOrders } = useApp();

  const currentDistributor =
    distributors.find((d) => d.id === activeDistributorId) || distributors[0];

  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'active_orders' | 'credit_due'>('all');
  const [selectedShopDetail, setSelectedShopDetail] = useState<Shop | null>(null);
  const [statementSuccess, setStatementSuccess] = useState('');

  // Extract unique cities
  const cities = Array.from(new Set(shops.map((s) => s.location?.city || 'Kathmandu')));

  // Calculate stats per dealer/shop
  const dealersWithStats = shops.map((shop, idx) => {
    const orders = distributorOrders.filter((o) => o.shopId === shop.id);
    const totalOrderValue = orders.reduce((sum, o) => sum + o.totalAmount, 0) + (idx === 0 ? 320000 : idx === 1 ? 185000 : 95000);
    const orderCount = orders.length > 0 ? orders.length : (idx === 0 ? 4 : 2);
    const paidAmount = idx === 0 ? 150000 : idx === 1 ? 75000 : 40000;
    const outstandingCredit = totalOrderValue - paidAmount;
    const creditLimit = idx === 0 ? 500000 : 300000;
    const activeOrders = orders.filter((o) => o.status === 'submitted' || o.status === 'accepted' || o.status === 'dispatched');

    return {
      shop,
      orders,
      orderCount,
      totalOrderValue,
      paidAmount,
      outstandingCredit,
      creditLimit,
      activeOrdersCount: activeOrders.length,
      lastOrderDate: orders[0]?.createdAt || '2026-08-18',
    };
  });

  const filteredDealers = dealersWithStats.filter(({ shop, outstandingCredit, activeOrdersCount }) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(search.toLowerCase()) ||
      shop.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      shop.phone.includes(search) ||
      shop.panVatNumber.includes(search) ||
      shop.address.toLowerCase().includes(search.toLowerCase()) ||
      shop.location?.city.toLowerCase().includes(search.toLowerCase()) ||
      shop.location?.district.toLowerCase().includes(search.toLowerCase());

    const matchesCity = selectedCity === 'all' || shop.location?.city === selectedCity;

    let matchesStatus = true;
    if (statusFilter === 'verified') matchesStatus = shop.isVerified;
    if (statusFilter === 'active_orders') matchesStatus = activeOrdersCount > 0;
    if (statusFilter === 'credit_due') matchesStatus = outstandingCredit > 0;

    return matchesSearch && matchesCity && matchesStatus;
  });

  const totalDealerCount = shops.length;
  const totalReceivables = dealersWithStats.reduce((s, d) => s + d.outstandingCredit, 0);
  const totalWholesaleSales = dealersWithStats.reduce((s, d) => s + d.totalOrderValue, 0);

  const handleSendStatement = (shopName: string) => {
    setStatementSuccess(`Khata statement & payment link sent via SMS/WhatsApp to ${shopName}`);
    setTimeout(() => setStatementSuccess(''), 4000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Authorized Dealer & Retailer Network (डिलर तथा रिटेलर सूची)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Directory of hardware shops, location mapping, credit limits, and dealer order histories.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Dealers</p>
            <p className="text-lg font-black text-white">{totalDealerCount} Stores</p>
          </div>
          <div className="text-right bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Receivables</p>
            <p className="text-lg font-black text-amber-400">{formatNPR(totalReceivables)}</p>
          </div>
        </div>
      </div>

      {statementSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statementSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search dealer by store name, owner, PAN, phone, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* City Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Cities / Districts</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Dealers</option>
              <option value="verified">Verified Dealers Only</option>
              <option value="active_orders">With Active Orders</option>
              <option value="credit_due">With Outstanding Credit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dealer Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDealers.map(({ shop, orderCount, totalOrderValue, paidAmount, outstandingCredit, creditLimit, activeOrdersCount, lastOrderDate }) => (
          <div
            key={shop.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between overflow-hidden group"
          >
            <div>
              {/* Card Header with Shop Logo & Verification */}
              <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <img
                    src={shop.logoImage || shop.bannerImage}
                    alt={shop.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-orange-600 transition">
                      {shop.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{shop.nepaliName}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              </div>

              {/* Location & Contact Body */}
              <div className="p-4 space-y-3 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {shop.location?.area || shop.address}, {shop.location?.city}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        District: {shop.location?.district} • Delivery Zone: {shop.location?.deliveryRadiusKm || 15} km
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Proprietor: <strong className="text-slate-800">{shop.ownerName}</strong> ({shop.phone})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      PAN / VAT: <strong className="text-slate-800 font-mono">{shop.panVatNumber}</strong>
                    </span>
                  </div>
                </div>

                {/* Dealer Financials & Credit Meter */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Purchases</p>
                      <p className="text-xs font-bold text-slate-800">{formatNPR(totalOrderValue)}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{orderCount} Wholesale Orders</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Khata Receivable</p>
                      <p className={`text-xs font-bold ${outstandingCredit > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {formatNPR(outstandingCredit)}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Limit: {formatNPR(creditLimit)}</p>
                    </div>
                  </div>

                  {/* Credit Usage Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                      <span>Credit Utilization</span>
                      <span>{Math.min(100, Math.round((outstandingCredit / creditLimit) * 100))}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          outstandingCredit / creditLimit > 0.8
                            ? 'bg-red-500'
                            : outstandingCredit / creditLimit > 0.5
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.round((outstandingCredit / creditLimit) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedShopDetail(shop)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition cursor-pointer flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Dealer Profile</span>
              </button>

              <button
                onClick={() => handleSendStatement(shop.name)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5 text-orange-400" />
                <span>Send Khata</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDealers.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 text-sm">No dealers found matching your search</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or search term.</p>
        </div>
      )}

      {/* Dealer Detail Modal */}
      {selectedShopDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedShopDetail.logoImage || selectedShopDetail.bannerImage}
                  alt={selectedShopDetail.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedShopDetail.name}</h3>
                  <p className="text-xs text-slate-500">{selectedShopDetail.nepaliName}</p>
                  <p className="text-xs text-orange-600 font-semibold mt-0.5">
                    {selectedShopDetail.location?.area}, {selectedShopDetail.location?.city}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedShopDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Proprietor Name</span>
                  <span className="font-bold text-slate-800">{selectedShopDetail.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Contact Number</span>
                  <span className="font-bold text-slate-800">{selectedShopDetail.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">PAN / VAT Reg No.</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedShopDetail.panVatNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Warehouse Address</span>
                  <span className="font-bold text-slate-800">{selectedShopDetail.address}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs">
              <p className="font-bold flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>B2B Credit Terms: 30 Days Net</span>
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                Authorized wholesale freight supplies dispatched from Balkhu central warehouse directly to dealer address.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedShopDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSendStatement(selectedShopDetail.name);
                  setSelectedShopDetail(null);
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Send Statement via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
