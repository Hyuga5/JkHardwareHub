import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { formatNPR } from '../../utils/formatters';
import { translations } from '../../utils/translations';
import { TaxInvoiceModal } from '../common/TaxInvoiceModal';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Building,
  FileText,
  Repeat,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const CustomerOrdersView: React.FC = () => {
  const { orders, language, addToCart, products } = useApp();
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const t = translations[language];

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">Placed (नयाँ अर्डर)</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">Accepted by Shop</span>;
      case 'packed':
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">Packed & Ready</span>;
      case 'dispatched':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> On the Way</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const getTimelineSteps = (currentStatus: OrderStatus) => {
    const steps: { key: OrderStatus; label: string }[] = [
      { key: 'placed', label: 'Order Placed' },
      { key: 'accepted', label: 'Confirmed' },
      { key: 'packed', label: 'Packed' },
      { key: 'dispatched', label: 'Dispatched' },
      { key: 'delivered', label: 'Delivered' },
    ];

    const orderIndex = steps.findIndex((s) => s.key === currentStatus);

    return steps.map((s, idx) => ({
      ...s,
      isCompleted: idx <= orderIndex,
      isCurrent: idx === orderIndex,
    }));
  };

  const handleReorder = (order: Order) => {
    for (const item of order.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        addToCart(prod, item.quantity);
      }
    }
    alert(`Added ${order.items.length} item(s) from Invoice #${order.invoiceNumber} to your cart.`);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.trackOrders}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status tracking and Nepal IRD official tax invoices
          </p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200">
          {orders.length} Orders Logged
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 text-sm">No hardware orders yet</p>
          <p className="text-xs text-slate-400 mt-1">When you place an order, individual shop invoices will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const timelineSteps = getTimelineSteps(order.orderStatus);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition"
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {order.invoiceNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (FY {order.fiscalYear})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {order.shopName} • {new Date(order.createdAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.orderStatus)}
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t.viewInvoice}</span>
                    </button>
                  </div>
                </div>

                {/* Animated Status Step Progress */}
                <div className="p-4 bg-slate-900 text-white">
                  <p className="text-[11px] text-slate-400 font-medium mb-3">
                    Delivery Status Pipeline:
                  </p>
                  <div className="flex items-center justify-between relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
                    
                    {timelineSteps.map((step, sIdx) => (
                      <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                            step.isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {step.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : sIdx + 1}
                        </div>
                        <span className={`text-[10px] mt-1 font-semibold ${
                          step.isCurrent ? 'text-amber-400' : step.isCompleted ? 'text-slate-200' : 'text-slate-500'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="p-4 divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-slate-800 truncate">{item.productName}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.quantity} × {formatNPR(item.unitPrice, language)} / {item.unit}
                          {item.isVatExempt && ' (VAT Exempt)'}
                        </p>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {formatNPR(item.totalAmount, language)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals & Reorder Bar */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 text-[11px] text-slate-500">
                    <p>Taxable: {formatNPR(order.taxableSubtotal)} • VAT (13%): +{formatNPR(order.vatAmount)}</p>
                    <p className="text-slate-800 font-bold">
                      Grand Total: <span className="text-sm text-slate-900">{formatNPR(order.totalAmount, language)}</span>
                      <span className="ml-2 font-normal text-slate-500">({order.paymentMethod.toUpperCase()})</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleReorder(order)}
                    className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Repeat className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reorder Items</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <TaxInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
