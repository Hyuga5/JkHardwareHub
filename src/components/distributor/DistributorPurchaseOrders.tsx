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
} from 'lucide-react';

export const DistributorPurchaseOrders: React.FC = () => {
  const {
    activeDistributorId,
    distributorOrders,
    updateDistributorOrderStatus,
    language,
  } = useApp();

  const orders = distributorOrders.filter((o) => o.distributorId === activeDistributorId);

  const handleNextStatus = (order: DistributorOrder) => {
    const sequence = ['submitted', 'accepted', 'dispatched', 'delivered'];
    const curIdx = sequence.indexOf(order.status);
    if (curIdx >= 0 && curIdx < sequence.length - 1) {
      updateDistributorOrderStatus(order.id, sequence[curIdx + 1] as any);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">New PO Submitted</span>;
      case 'accepted':
        return <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">PO Accepted / Allocating Stock</span>;
      case 'dispatched':
        return <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-bold flex items-center gap-1"><Truck className="w-3 h-3" /> Freight Truck Dispatched</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Delivered & Invoiced</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Wholesale Purchase Orders (थोक अर्डरहरू)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming stock requisition POs from retail hardware shops across Nepal.
          </p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg">
          {orders.length} Active Wholesale Requisitions
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700 text-sm">No wholesale purchase orders yet</p>
          <p className="text-xs text-slate-400 mt-1">Retail hardware shops can place orders from the Wholesale Catalog.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((po) => (
            <div
              key={po.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition"
            >
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs font-mono">
                    PO
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{po.poNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 font-bold rounded uppercase">
                        {po.paymentTerms.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Retailer: <strong className="text-slate-800">{po.shopName}</strong> • {new Date(po.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(po.status)}
                  {po.status !== 'delivered' && (
                    <button
                      onClick={() => handleNextStatus(po)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {po.status === 'submitted' ? 'Accept PO' : po.status === 'accepted' ? 'Dispatch Freight Truck' : 'Mark Delivered'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Items in PO */}
              <div className="p-4 divide-y divide-slate-100 text-xs">
                {po.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{it.productName}</p>
                      <p className="text-[11px] text-slate-500">
                        {it.quantity} {it.unit} × {formatNPR(it.unitPrice)}
                        {it.isVatExempt ? ' (0% VAT)' : ' (13% Input VAT)'}
                      </p>
                    </div>
                    <span className="font-semibold text-slate-900">{formatNPR(it.totalAmount)}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <p className="text-[11px] text-slate-500">
                  Notes: <span className="text-slate-700 italic">{po.notes || 'Standard freight delivery'}</span>
                </p>
                <p className="text-sm font-black text-slate-900">
                  Total PO Amount: {formatNPR(po.totalAmount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
