import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNPR } from '../../utils/formatters';
import { translations } from '../../utils/translations';
import { PaymentMethod } from '../../types';
import { EsewaModal, KhaltiModal, OtpModal } from '../common/PaymentModals';
import { DynamicQrModal } from '../common/DynamicQrModal';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Store,
  Truck,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  Layers,
  MapPin,
  Sparkles,
  ArrowRight,
  Info,
  QrCode,
  Smartphone,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderIds: string[]) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    language,
    cart,
    cartShopGroups,
    removeFromCart,
    updateCartQuantity,
    placeCustomerOrder,
    customerPhone,
    setCustomerPhone,
    customerName,
    setCustomerName,
    loyaltyProfile,
  } = useApp();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerAddress, setCustomerAddress] = useState('New Baneshwor, Ward 10, Kathmandu');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('esewa');
  const [appliedVoucher, setAppliedVoucher] = useState<string>('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showEsewaModal, setShowEsewaModal] = useState(false);
  const [showKhaltiModal, setShowKhaltiModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrProvider, setQrProvider] = useState<'esewa' | 'khalti'>('esewa');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const t = translations[language];

  // Calculate grand totals across all split shops
  const grandTaxable = cartShopGroups.reduce((sum, g) => sum + g.subtotal, 0);
  const grandVat = cartShopGroups.reduce((sum, g) => sum + g.vatAmount, 0);
  const grandDelivery = deliveryType === 'pickup' ? 0 : cartShopGroups.reduce((sum, g) => sum + g.deliveryFee, 0);
  const voucherDiscount = appliedVoucher ? 500 : 0;
  const grandTotal = Math.max(0, grandTaxable + grandVat + grandDelivery - voucherDiscount);

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    setStep('checkout');
  };

  const handleOpenQrModal = (provider?: 'esewa' | 'khalti') => {
    if (!isPhoneVerified) {
      setShowOtpModal(true);
      return;
    }
    const selected = provider || (paymentMethod === 'khalti' ? 'khalti' : 'esewa');
    setQrProvider(selected);
    setShowQrModal(true);
  };

  const handleProceedPayment = () => {
    if (!isPhoneVerified) {
      setShowOtpModal(true);
      return;
    }

    if (paymentMethod === 'esewa') {
      setShowEsewaModal(true);
    } else if (paymentMethod === 'khalti') {
      setShowKhaltiModal(true);
    } else {
      // Cash on Delivery
      executeOrderCreation();
    }
  };

  const executeOrderCreation = async () => {
    setIsSubmitting(true);
    try {
      const orders = await placeCustomerOrder({
        deliveryType,
        customerAddress,
        paymentMethod,
        appliedVoucherCode: appliedVoucher,
      });

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}

      onClose();
      onOrderSuccess(orders.map((o) => o.id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
        <div className="w-full max-w-lg bg-[#0F172A] border-l border-slate-800 h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              <div>
                <h3 className="font-bold text-sm text-white">
                  {step === 'cart' ? t.cart : t.checkout}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {cartShopGroups.length} Separate Store Invoice(s)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <Store className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="font-bold text-slate-300">Your hardware cart is empty</p>
                <p className="text-xs text-slate-500 mt-1">Browse nearby hardware shops and add items.</p>
              </div>
            ) : step === 'cart' ? (
              <>
                {/* Shop Auto-Split Notice */}
                <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/30 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-300 leading-relaxed font-medium">
                    {t.cartSplitNotice}
                  </p>
                </div>

                {/* Split Cart by Shop Groups */}
                <div className="space-y-4">
                  {cartShopGroups.map((group, gIdx) => (
                    <div
                      key={group.shop.id}
                      className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-md"
                    >
                      {/* Shop Group Header */}
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-orange-400" />
                          <span className="font-bold text-xs text-white">
                            {group.shop.name}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-bold">
                          Tax Invoice #{gIdx + 1}
                        </span>
                      </div>

                      {/* Items in this shop */}
                      <div className="divide-y divide-slate-800">
                        {group.items.map((item) => (
                          <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-200 truncate">
                                {language === 'ne' ? item.product.nepaliName : item.product.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span>{formatNPR(item.product.price, language)} / {item.product.unit}</span>
                                {item.product.isVatExempt ? (
                                  <span className="text-orange-400 font-semibold">(0% VAT Exempt)</span>
                                ) : (
                                  <span className="text-emerald-400 font-semibold">(13% VAT)</span>
                                )}
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-slate-700 rounded-lg bg-slate-950">
                                <button
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                  className="p-1 px-1.5 hover:bg-slate-800 text-slate-300 cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-xs font-bold text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                  className="p-1 px-1.5 hover:bg-slate-800 text-slate-300 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Group Tax Subtotal */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
                        <span>Items Subtotal:</span>
                        <span className="font-semibold text-slate-200">{formatNPR(group.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                        <span>13% VAT for this shop:</span>
                        <span className="font-semibold text-emerald-400">+{formatNPR(group.vatAmount)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                        <span>Local Shop Delivery Fee:</span>
                        <span className="font-semibold text-slate-200">
                          {group.deliveryFee === 0 ? 'FREE' : `+${formatNPR(group.deliveryFee)}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Checkout Form Step */
              <div className="space-y-4">
                {/* Customer Identity / Phone */}
                <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-200">
                      Customer Details (Nepali Mobile)
                    </p>
                    {isPhoneVerified ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> OTP Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => setShowOtpModal(true)}
                        className="text-[10px] text-orange-400 font-bold underline cursor-pointer"
                      >
                        Verify with SMS OTP
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your Full Name / Contractor Name"
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-500"
                    />
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="w-full text-xs p-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Fulfillment Type */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-200">Fulfillment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        deliveryType === 'delivery'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-md'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-orange-400" />
                      <span>{t.homeDelivery}</span>
                    </button>
                    <button
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        deliveryType === 'pickup'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-md'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Store className="w-4 h-4 text-orange-400" />
                      <span>{t.pickupStore}</span>
                    </button>
                  </div>
                </div>

                {/* Address */}
                {deliveryType === 'delivery' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Delivery Address / Construction Site
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="e.g. Ward 10, New Baneshwor, Near Everest Hotel, Kathmandu"
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder-slate-500"
                      />
                    </div>
                  </div>
                )}

                {/* Payment Selection */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-200">
                      Nepal Payment Method (नेपाल भुक्तानी)
                    </p>
                    <button
                      id="generate-qr-header-btn"
                      type="button"
                      onClick={() => handleOpenQrModal()}
                      className="px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Generate QR</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* eSewa */}
                    <div
                      onClick={() => setPaymentMethod('esewa')}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'esewa'
                          ? 'border-[#60bb46] bg-[#60bb46]/10 shadow-md'
                          : 'border-slate-800 bg-slate-900 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#60bb46] text-white flex items-center justify-center font-bold text-xs">
                          e
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">eSewa Mobile Wallet</p>
                          <p className="text-[10px] text-slate-400">Instant digital wallet checkout & FonePay</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPaymentMethod('esewa');
                            handleOpenQrModal('esewa');
                          }}
                          className="px-2.5 py-1 bg-[#60bb46] hover:bg-[#52a03c] text-white text-[10px] font-black rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Generate QR</span>
                        </button>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'esewa'}
                          onChange={() => setPaymentMethod('esewa')}
                          className="accent-[#60bb46]"
                        />
                      </div>
                    </div>

                    {/* Khalti */}
                    <div
                      onClick={() => setPaymentMethod('khalti')}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'khalti'
                          ? 'border-[#5c2d91] bg-[#5c2d91]/10 shadow-md'
                          : 'border-slate-800 bg-slate-900 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#5c2d91] text-white flex items-center justify-center font-bold text-xs">
                          K
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Khalti Digital Wallet</p>
                          <p className="text-[10px] text-slate-400">Pay via Khalti app / SmartQR</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPaymentMethod('khalti');
                            handleOpenQrModal('khalti');
                          }}
                          className="px-2.5 py-1 bg-[#5c2d91] hover:bg-[#4d257a] text-white text-[10px] font-black rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Generate QR</span>
                        </button>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'khalti'}
                          onChange={() => setPaymentMethod('khalti')}
                          className="accent-[#5c2d91]"
                        />
                      </div>
                    </div>

                    {/* Cash on Delivery */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'cod'
                          ? 'border-orange-500 bg-orange-500/10 shadow-md'
                          : 'border-slate-800 bg-slate-900 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                          COD
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Cash on Delivery (नगद)</p>
                          <p className="text-[10px] text-slate-400">Pay upon goods inspection at site</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-orange-500"
                      />
                    </div>
                  </div>

                  {/* Dynamic QR Scan Feature Bento Highlight */}
                  <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          Quick Dynamic QR Payment
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Scan live SVG QR with eSewa, Khalti, or Mobile Banking
                        </p>
                      </div>
                    </div>
                    <button
                      id="generate-dynamic-qr-card-btn"
                      type="button"
                      onClick={() => handleOpenQrModal()}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-black rounded-xl transition cursor-pointer shrink-0 shadow-md shadow-orange-500/20"
                    >
                      Generate QR
                    </button>
                  </div>
                </div>

                {/* Loyalty Voucher Discount */}
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                      Apply Loyalty Voucher ({loyaltyProfile.pointsBalance} pts)
                    </span>
                    {appliedVoucher ? (
                      <button
                        onClick={() => setAppliedVoucher('')}
                        className="text-[11px] text-red-400 font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => setAppliedVoucher('LOYALTY-500')}
                        className="text-[11px] px-2.5 py-1 bg-orange-500 text-slate-950 font-black rounded-lg cursor-pointer"
                      >
                        Apply -Rs 500
                      </button>
                    )}
                  </div>
                  {appliedVoucher && (
                    <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                      ✓ NPR 500 Discount Voucher Applied!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Totals & CTA */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Taxable Hardware Subtotal:</span>
                  <span className="font-semibold text-white">{formatNPR(grandTaxable, language)}</span>
                </div>
                <div className="flex justify-between">
                  <span>13% Nepal VAT (All Invoices):</span>
                  <span className="font-semibold text-emerald-400">+{formatNPR(grandVat, language)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Site Delivery & Freight:</span>
                  <span className="font-semibold text-white">
                    {grandDelivery === 0 ? 'FREE' : `+${formatNPR(grandDelivery, language)}`}
                  </span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-red-400 font-semibold">
                    <span>Voucher Discount:</span>
                    <span>-{formatNPR(voucherDiscount, language)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black text-white">
                  <span>Grand Total ({cartShopGroups.length} Shops):</span>
                  <span className="text-base text-orange-400">{formatNPR(grandTotal, language)}</span>
                </div>
              </div>

              {step === 'cart' ? (
                <button
                  id="checkout-step-btn"
                  onClick={handleStartCheckout}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition cursor-pointer"
                >
                  <span>{t.proceedToCheckout}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('cart')}
                    className="py-2.5 px-3 bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-700 transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    id="checkout-footer-generate-qr-btn"
                    type="button"
                    onClick={() => handleOpenQrModal()}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title="Generate Dynamic QR Code for eSewa or Khalti"
                  >
                    <QrCode className="w-4 h-4 text-orange-400" />
                    <span>Generate QR</span>
                  </button>
                  <button
                    id="place-order-confirm-btn"
                    onClick={handleProceedPayment}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Pay {formatNPR(grandTotal, language)}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment, QR & OTP Modals */}
      {showOtpModal && (
        <OtpModal
          phone={customerPhone}
          onVerified={() => {
            setIsPhoneVerified(true);
            setShowOtpModal(false);
          }}
          onClose={() => setShowOtpModal(false)}
        />
      )}

      {showQrModal && (
        <DynamicQrModal
          amount={grandTotal}
          initialProvider={qrProvider}
          orderSummary={{
            shopCount: cartShopGroups.length,
            vatAmount: grandVat,
            subtotal: grandTaxable,
          }}
          onSuccess={() => {
            setShowQrModal(false);
            executeOrderCreation();
          }}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {showEsewaModal && (
        <EsewaModal
          amount={grandTotal}
          onSuccess={() => {
            setShowEsewaModal(false);
            executeOrderCreation();
          }}
          onClose={() => setShowEsewaModal(false)}
        />
      )}

      {showKhaltiModal && (
        <KhaltiModal
          amount={grandTotal}
          onSuccess={() => {
            setShowKhaltiModal(false);
            executeOrderCreation();
          }}
          onClose={() => setShowKhaltiModal(false)}
        />
      )}
    </>
  );
};
