import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { formatNPR } from '../../utils/formatters';
import { translations } from '../../utils/translations';
import { TaxInvoiceModal } from '../common/TaxInvoiceModal';
import {
  Package,
  CheckCircle2,
  Truck,
  FileText,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Filter,
} from 'lucide-react';

export const ShopOrderManager: React.FC = () => {
  const { activeShopId, orders, updateOrderStatus, language } = useApp();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const shopOrders = orders.filter((o) => o.shopId === activeShopId);
  const filteredOrders = filterStatus === 'all'
    ? shopOrders
    : shopOrders.filter((o) => o.orderStatus === filterStatus);

  const t = translations[language];

  const handleNextStatus = (order: Order) => {
    const sequence: OrderStatus[] = ['placed', 'accepted', 'packed', 'dispatched', 'delivered'];
    const curIdx = sequence.indexOf(order.orderStatus);
    if (curIdx >= 0 && curIdx < sequence.length - 1) {
      updateOrderStatus(order.id, sequence[curIdx + 1]);
    }
  };

  const getNextActionLabel = (status: OrderStatus) => {
    switch (status) {
      case 'placed': return 'Accept Order';
      case 'accepted': return 'Mark as Packed';
      case 'packed': return 'Dispatch for Delivery';
      case 'dispatched': return 'Confirm Delivered';
      default: return 'Completed';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Order Fulfillment Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage incoming orders, update dispatch state, and print official IRD tax invoices.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'placed', 'accepted', 'packed', 'dispatched', 'delivered'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st} {st !== 'all' && `(${shopOrders.filter((o) => o.orderStatus === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid/List */}
      {filteredOrders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 text-sm">No orders in this status</p>
          <p className="text-xs text-slate-400 mt-1">Switch filter to view all hardware orders.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition"
            >
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold font-mono text-xs">
                    INV
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{order.invoiceNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 font-semibold rounded">
                        FY {order.fiscalYear}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded uppercase">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print Tax Invoice</span>
                  </button>

                  {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                    <button
                      onClick={() => handleNextStatus(order)}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{getNextActionLabel(order.orderStatus)}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="p-4 bg-slate-900/5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">{order.customerName}</span>
                    <span className="text-slate-500 ml-2 font-mono">{order.customerPhone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-slate-700 truncate">{order.customerAddress || 'Direct Counter Pickup'}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="p-4 divide-y divide-slate-100 text-xs">
                {order.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{it.productName}</p>
                      <p className="text-[11px] text-slate-500">
                        {it.quantity} {it.unit} × {formatNPR(it.unitPrice)} {it.isVatExempt ? '(VAT Exempt)' : '(13% VAT)'}
                      </p>
                    </div>
                    <span className="font-semibold text-slate-900">{formatNPR(it.totalAmount)}</span>
                  </div>
                ))}
              </div>

              {/* Order Footer Totals */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-500 space-x-3">
                  <span>Taxable: {formatNPR(order.taxableSubtotal)}</span>
                  <span>13% VAT: +{formatNPR(order.vatAmount)}</span>
                  <span>Delivery: {formatNPR(order.deliveryFee)}</span>
                </div>
                <div className="text-sm font-black text-slate-900">
                  Total: {formatNPR(order.totalAmount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedInvoiceOrder && (
        <TaxInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
