import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, WholesaleItem, DistributorOrder } from '../../types';
import { formatNPR } from '../../utils/formatters';
import {
  Truck,
  Building2,
  Package,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DistributorWholesaleCatalog: React.FC = () => {
  const {
    activeDistributorId,
    activeShopId,
    distributors,
    shops,
    products,
    createDistributorOrder,
    language,
  } = useApp();

  const currentDistributor = distributors.find((d) => d.id === activeDistributorId) || distributors[0];
  const currentShop = shops.find((s) => s.id === activeShopId) || shops[0];
  const wholesaleProducts = products.filter((p) => p.isWholesale);

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [paymentTerms, setPaymentTerms] = useState<'credit_30' | 'credit_60' | 'advance_bank' | 'cod'>('credit_30');
  const [notes, setNotes] = useState('Deliver via mini-truck to shop warehouse in Kathmandu.');
  const [successOrder, setSuccessOrder] = useState<DistributorOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = wholesaleProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleQtyChange = (productId: string, val: number, moq: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  const selectedItemsList = wholesaleProducts
    .filter((p) => (quantities[p.id] || 0) > 0)
    .map((p) => {
      const qty = quantities[p.id];
      const line = qty * p.price;
      const vat = p.isVatExempt ? 0 : line * 0.13;
      return {
        productId: p.id,
        productName: p.name,
        brand: p.brand,
        quantity: qty,
        unitPrice: p.price,
        unit: p.unit,
        isVatExempt: p.isVatExempt,
        taxableAmount: line,
        vatAmount: vat,
        totalAmount: line + vat,
      };
    });

  const grandTaxable = selectedItemsList.reduce((s, i) => s + i.taxableAmount, 0);
  const grandVat = selectedItemsList.reduce((s, i) => s + i.vatAmount, 0);
  const grandTotal = grandTaxable + grandVat;

  const handlePlaceB2BOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemsList.length === 0) {
      alert('Please select quantities for wholesale items above MOQ.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newOrder = createDistributorOrder({
        distributorId: currentDistributor.id,
        shopId: currentShop.id,
        paymentTerms,
        notes,
        items: selectedItemsList,
      });

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      setSuccessOrder(newOrder);
      setQuantities({});
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>National Hardware B2B Supply Network</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Wholesale Distributor Procurement (थोक खरिद)
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Order full-truckloads and bulk batches directly from national manufacturers (Shivam, Jagdamba, Astral, Bosch) with wholesale credit terms and 13% Input Tax Invoices.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Ordering as Retailer:</p>
          <p className="text-sm font-bold text-amber-400">{currentShop.name}</p>
          <p className="text-[11px] text-slate-400">PAN: {currentShop.panVatNumber}</p>
        </div>
      </div>

      {successOrder && (
        <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-300 flex flex-wrap items-center justify-between gap-3 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p>B2B Purchase Order #{successOrder.poNumber} Transmitted to {successOrder.distributorName}!</p>
              <p className="font-normal text-emerald-700 text-[11px] mt-0.5">
                Total: {formatNPR(successOrder.totalAmount)} • Terms: {successOrder.paymentTerms.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessOrder(null)}
            className="text-xs text-emerald-900 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Catalog + Order Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalog Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Wholesale Stock Offerings ({wholesaleProducts.length} Factory SKUs)
            </h2>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search factory SKUs..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((item) => {
              const curQty = quantities[item.id] || 0;
              const moq = item.moq || 10;

              return (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-contain bg-slate-50 border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {item.brand}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 mt-1">{item.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px]">
                        <span className="font-bold text-slate-900">
                          {formatNPR(item.price)} / {item.unit}
                        </span>
                        <span className="text-amber-800 font-semibold bg-amber-100/60 px-1.5 py-0.5 rounded">
                          MOQ: {moq} {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Adjustment */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => handleQtyChange(item.id, curQty - moq, moq)}
                        className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                        title={`Decrease by ${moq}`}
                      >
                        -{moq}
                      </button>
                      <input
                        type="number"
                        min={0}
                        step={moq}
                        value={curQty}
                        onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 0, moq)}
                        className="w-16 py-1 text-xs text-center font-bold bg-white border-x border-slate-300 focus:outline-none"
                      />
                      <button
                        onClick={() => handleQtyChange(item.id, curQty === 0 ? moq : curQty + moq, moq)}
                        className="px-2.5 py-1.5 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                        title={`Increase by ${moq}`}
                      >
                        +{moq}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PO Checkout Sidebar */}
        <div className="space-y-4">
          <form onSubmit={handlePlaceB2BOrder} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600" />
              B2B Purchase Order (PO)
            </h2>

            {/* Selected Items Breakdown */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedItemsList.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No wholesale items selected. Use the +/- MOQ buttons.
                </p>
              ) : (
                selectedItemsList.map((it) => (
                  <div key={it.productId} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-[170px]">{it.productName}</p>
                      <p className="text-[10px] text-slate-500">
                        {it.quantity} {it.unit} @ Rs {it.unitPrice}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">{formatNPR(it.totalAmount)}</span>
                  </div>
                ))
              )}
            </div>

            {/* Payment & Credit Terms */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                B2B Credit & Settlement Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as any)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg font-bold"
              >
                <option value="credit_30">30 Days Retailer Credit (३० दिने उधारो)</option>
                <option value="credit_60">60 Days Credit Line (६० दिने साहु खाता)</option>
                <option value="advance_bank">Advance Bank Wire (Nabil/NIC Bank)</option>
                <option value="cod">Cash on Truck Unloading (COD)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Warehouse Delivery Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Tax Math */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Factory Subtotal:</span>
                <span className="font-semibold text-slate-800">{formatNPR(grandTaxable)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>13% Claimable Input VAT:</span>
                <span className="font-semibold text-emerald-700">+{formatNPR(grandVat)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200 text-sm font-black text-slate-900">
                <span>Grand PO Amount:</span>
                <span>{formatNPR(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={selectedItemsList.length === 0 || isSubmitting}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Issue Official Purchase Order</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
