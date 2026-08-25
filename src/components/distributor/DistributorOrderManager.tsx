import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DistributorOrder } from '../../types';
import { formatNPR } from '../../utils/formatters';
import {
  Truck,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Phone,
  Package,
  Search,
  Filter,
  ArrowRight,
  Printer,
  Calendar,
  AlertCircle,
  Store,
} from 'lucide-react';

export const DistributorOrderManager: React.FC = () => {
  const {
    activeDistributorId,
    distributors,
    shops,
    distributorOrders,
    updateDistributorOrderStatus,
    language,
  } = useApp();

  const currentDistributor =
    distributors.find((d) => d.id === activeDistributorId) || distributors[0];

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'accepted' | 'dispatched' | 'delivered'>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [selectedPoModal, setSelectedPoModal] = useState<DistributorOrder | null>(null);

  // Orders for this distributor
  const orders = distributorOrders.filter(
    (o) => o.distributorId === activeDistributorId
  );

  // Enhance each order with dealer / shop location
  const ordersWithDealerLocation = orders.map((po) => {
    const shop = shops.find((s) => s.id === po.shopId);
    return {
      ...po,
      dealerLocation: shop?.location
        ? `${shop.location.area || shop.address}, ${shop.location.city} (${shop.location.district})`
        : shop?.address || 'Kathmandu Valley',
      dealerCity: shop?.location?.city || 'Kathmandu',
      dealerPhone: shop?.phone || '9851000000',
      dealerOwner: shop?.ownerName || 'Store Proprietor',
    };
  });

  const cities = Array.from(new Set(ordersWithDealerLocation.map((o) => o.dealerCity)));

  const handleNextStatus = (order: DistributorOrder) => {
    const sequence = ['submitted', 'accepted', 'dispatched', 'delivered'];
    const curIdx = sequence.indexOf(order.status);
    if (curIdx >= 0 && curIdx < sequence.length - 1) {
      updateDistributorOrderStatus(order.id, sequence[curIdx + 1] as any);
    }
  };

  const filteredOrders = ordersWithDealerLocation.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.shopName.toLowerCase().includes(search.toLowerCase()) ||
      po.dealerLocation.toLowerCase().includes(search.toLowerCase()) ||
      po.dealerOwner.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    const matchesCity = selectedCityFilter === 'all' || po.dealerCity === selectedCityFilter;

    return matchesSearch && matchesStatus && matchesCity;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700" /> New PO Requisition
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-full text-xs font-bold flex items-center gap-1">
            <Package className="w-3 h-3 text-blue-700" /> Stock Allocated / Yard Loading
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-900 border border-purple-300 rounded-full text-xs font-bold flex items-center gap-1">
            <Truck className="w-3 h-3 text-purple-700" /> Freight Dispatched
          </span>
        );
      case 'delivered':
      case 'fulfilled':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Delivered & Invoiced
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const totalOrderValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Wholesale Order Orders & Dealer Dispatches (अर्डर तथा ढुवानी व्यवस्थापन)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage B2B purchase requisitions with Dealer Name, exact warehouse location, dispatch pipeline, and IRD tax invoices.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Orders</p>
            <p className="text-lg font-black text-white">{orders.length} POs</p>
          </div>
          <div className="text-right bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Gross Order Value</p>
            <p className="text-lg font-black text-orange-400">{formatNPR(totalOrderValue)}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search order by PO #, Dealer Store Name, Location, or Contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* City / Location Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Dealer Cities</option>
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
              <option value="all">All Statuses</option>
              <option value="submitted">New Requisitions</option>
              <option value="accepted">Stock Allocated</option>
              <option value="dispatched">Freight In-Transit</option>
              <option value="delivered">Delivered & Invoiced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 text-sm">No wholesale purchase orders found</p>
          <p className="text-xs text-slate-400 mt-1">Retail hardware dealers can place orders from the Wholesale Catalog.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((po) => (
            <div
              key={po.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:border-slate-300 transition"
            >
              {/* Header Bar */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-xs font-mono border border-orange-500/20">
                    PO
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono">{po.poNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 font-bold rounded uppercase">
                        {po.paymentTerms ? po.paymentTerms.replace('_', ' ') : 'Credit 30 Days'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs">
                      <span className="text-slate-500 font-medium">Requisition Date:</span>
                      <span className="font-bold text-slate-700">{po.createdAt}</span>
                      {po.dueDate && (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200">
                          Due: {po.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(po.status)}

                  {po.status !== 'delivered' && po.status !== 'fulfilled' && (
                    <button
                      onClick={() => handleNextStatus(po)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                      <span>
                        {po.status === 'submitted'
                          ? 'Accept PO & Allocate'
                          : po.status === 'accepted'
                          ? 'Dispatch Freight Truck'
                          : 'Mark Delivered & Bill'}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedPoModal(po)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                    title="View Full PO Invoice"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* DEALER NAME & LOCATION SECTION (Highlighted) */}
              <div className="px-4 py-3 bg-amber-50/40 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-orange-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Dealer Name (पसल)</p>
                    <p className="font-bold text-slate-900">{po.shopName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">PAN: {po.shopPan}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Dealer Location & Address</p>
                    <p className="font-bold text-slate-800">{po.dealerLocation}</p>
                    <p className="text-[11px] text-slate-500">City: {po.dealerCity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Dealer Contact</p>
                    <p className="font-semibold text-slate-800">{po.dealerOwner}</p>
                    <p className="text-[11px] text-slate-600 font-mono">{po.dealerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Items in PO */}
              <div className="p-4 divide-y divide-slate-100 text-xs">
                {po.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{it.productName}</p>
                        <p className="text-[11px] text-slate-500">
                          Qty: <strong className="text-slate-800">{it.quantity} {it.unit}</strong> × {formatNPR(it.unitPrice)}
                          {it.isVatExempt ? ' (Exempt)' : ' (+13% VAT)'}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {formatNPR(it.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer Summary */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-[11px] text-slate-500">
                  <span>Dispatch Notes: </span>
                  <span className="text-slate-800 font-medium italic">
                    {po.notes || 'Dispatch directly via freight truck to dealer warehouse.'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {po.vatAmount ? (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">VAT (13%)</p>
                      <p className="font-bold text-slate-700 font-mono">{formatNPR(po.vatAmount)}</p>
                    </div>
                  ) : null}

                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Payable</p>
                    <p className="text-base font-black text-slate-900 font-mono">
                      {formatNPR(po.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PO Detail Invoice Modal */}
      {selectedPoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  B2B Wholesale Tax Invoice
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{selectedPoModal.poNumber}</h3>
                <p className="text-xs text-slate-500">Supplier: {selectedPoModal.distributorName} (PAN: {selectedPoModal.distributorPan})</p>
              </div>
              <button
                onClick={() => setSelectedPoModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Bill To Info */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Buyer Dealer (खरिदकर्ता)</p>
                <p className="font-bold text-slate-900 text-sm">{selectedPoModal.shopName}</p>
                <p className="text-slate-600 font-mono">PAN: {selectedPoModal.shopPan}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Delivery Destination</p>
                <p className="font-semibold text-slate-800">
                  {selectedPoModal.dealerLocation || selectedPoModal.shopName}
                </p>
                <p className="text-slate-500">Terms: {selectedPoModal.paymentTerms || 'Credit 30 Days'}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50">
                  <th className="py-2 px-2">SN</th>
                  <th className="py-2 px-2">Item</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Rate</th>
                  <th className="py-2 px-2 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedPoModal.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-2 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-2 font-bold text-slate-800">{it.productName}</td>
                    <td className="py-2 px-2 text-center font-semibold">{it.quantity} {it.unit}</td>
                    <td className="py-2 px-2 text-right font-mono">{formatNPR(it.unitPrice)}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold">{formatNPR(it.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Section */}
            <div className="p-3 bg-slate-900 text-white rounded-xl flex justify-between items-center text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Invoiced</p>
                <p className="text-base font-black text-amber-400 font-mono">
                  {formatNPR(selectedPoModal.totalAmount)}
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <p>Includes 13% IRD VAT</p>
                <p>Status: {selectedPoModal.status.toUpperCase()}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedPoModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
