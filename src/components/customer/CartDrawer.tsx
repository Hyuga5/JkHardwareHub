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
  Tag,
  AlertCircle,
  Percent,
  Calculator,
  Coins,
  Receipt,
  UserCheck,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface CheckoutPromoCode {
  code: string;
  title: string;
  creatorName?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  description: string;
  isInfluencer?: boolean;
}

const CHECKOUT_PROMOS: Record<string, CheckoutPromoCode> = {
  // Social Media Influencer Campaign Promo Codes
  SISAN10: {
    code: 'SISAN10',
    title: '10% Sisan Baniya Partner Discount',
    creatorName: 'Sisan Baniya (@sisanbaniya)',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 3000,
    description: '10% verified creator rebate from Sisan Baniya YouTube / Social collab.',
    isInfluencer: true,
  },
  SISAN5: {
    code: 'SISAN5',
    title: '5% Sisan Baniya Partner Discount',
    creatorName: 'Sisan Baniya (@sisanbaniya)',
    discountType: 'percentage',
    discountValue: 5,
    description: '5% creator discount on all building & hardware materials.',
    isInfluencer: true,
  },
  RONB10: {
    code: 'RONB10',
    title: '10% Routine of Nepal Banda Special',
    creatorName: 'Routine of Nepal Banda (RONB)',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 2500,
    description: '10% instant rebate on construction supplies for RONB community.',
    isInfluencer: true,
  },
  RONB: {
    code: 'RONB',
    title: '10% Routine of Nepal Banda Special',
    creatorName: 'Routine of Nepal Banda (RONB)',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 2500,
    description: '10% instant rebate on construction supplies for RONB community.',
    isInfluencer: true,
  },
  PARAS10: {
    code: 'PARAS10',
    title: '10% Paras Khadka Creator Code',
    creatorName: 'Paras Khadka Official',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 3000,
    description: '10% discount on high-grade cement, steel & hardware materials.',
    isInfluencer: true,
  },
  ROTTENGUYS: {
    code: 'ROTTENGUYS',
    title: '12% Rotten Guys YouTube Special',
    creatorName: 'The Rotten Guys',
    discountType: 'percentage',
    discountValue: 12,
    maxDiscount: 3500,
    description: '12% creator promo code on all hardware & interior fittings.',
    isInfluencer: true,
  },
  SHREEYA10: {
    code: 'SHREEYA10',
    title: '10% Shreeya Creator Discount',
    creatorName: 'Shreeya (@shreeyapokharel)',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 2500,
    description: '10% special discount on paint, electricals & plumbing.',
    isInfluencer: true,
  },
  BALEN10: {
    code: 'BALEN10',
    title: '10% Kathmandu Infrastructure Partner Code',
    creatorName: 'Urban Builders & Youth Network',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 3000,
    description: '10% promotional rebate for valley infrastructure & residential projects.',
    isInfluencer: true,
  },
  TIKTOK10: {
    code: 'TIKTOK10',
    title: '10% TikTok Creator Partner Offer',
    creatorName: 'TikTok Nepal Creator Program',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 2000,
    description: '10% discount from our TikTok influencer partnership promotions.',
    isInfluencer: true,
  },
  TIKTOK15: {
    code: 'TIKTOK15',
    title: '15% TikTok Super Creator Offer',
    creatorName: 'TikTok Nepal Creator Program',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 3000,
    maxDiscount: 4000,
    description: '15% creator discount on construction orders over Rs 3,000.',
    isInfluencer: true,
  },
  INSTA10: {
    code: 'INSTA10',
    title: '10% Instagram Influencer Collab',
    creatorName: 'Instagram Influencer Network',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 2000,
    description: '10% discount via Instagram hardware & architecture collabs.',
    isInfluencer: true,
  },
  YOUTUBE10: {
    code: 'YOUTUBE10',
    title: '10% YouTube Construction Partner Code',
    creatorName: 'YouTube Nepal Creator Guild',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 2500,
    description: '10% partner discount on all verified hardware supplies.',
    isInfluencer: true,
  },
  // Platform & Fiscal Promo Codes
  NEPAL2081: {
    code: 'NEPAL2081',
    title: 'NPR 500 New Fiscal Year Discount',
    discountType: 'fixed',
    discountValue: 500,
    minOrder: 1500,
    description: 'Flat Rs 500 off on hardware orders above Rs 1,500.',
  },
  DARAZ50: {
    code: 'DARAZ50',
    title: '5% Daraz Hardware Rebate',
    discountType: 'percentage',
    discountValue: 5,
    description: '5% instant cash discount on taxable hardware.',
  },
  HARDWARE10: {
    code: 'HARDWARE10',
    title: '10% Super Saver Coupon',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 2500,
    maxDiscount: 1500,
    description: '10% off up to NPR 1,500 on orders above NPR 2,500.',
  },
  BULK15: {
    code: 'BULK15',
    title: '15% Bulk Contractor Discount',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 10000,
    maxDiscount: 5000,
    description: '15% bulk discount on major construction orders over Rs 10,000.',
  },
  FESTIVE2026: {
    code: 'FESTIVE2026',
    title: 'NPR 750 Festive Voucher',
    discountType: 'fixed',
    discountValue: 750,
    minOrder: 3000,
    description: 'Flat Rs 750 festive coupon on orders over Rs 3,000.',
  },
  BUILDER500: {
    code: 'BUILDER500',
    title: 'NPR 500 Builder Credit',
    discountType: 'fixed',
    discountValue: 500,
    description: 'Flat Rs 500 instant builder credit.',
  },
  BOQ10: {
    code: 'BOQ10',
    title: '10% BOQ & Engineering Discount',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 3500,
    description: '10% direct discount on estimated hardware materials.',
  },
};

// Dynamic helper to resolve influencer or standard promo codes
export function parseInfluencerOrPromoCode(rawCode: string): CheckoutPromoCode | null {
  const clean = rawCode.trim().toUpperCase().replace(/^@/, '');
  if (!clean) return null;

  if (CHECKOUT_PROMOS[clean]) {
    return CHECKOUT_PROMOS[clean];
  }

  // Check if it's a dynamic influencer promo code (e.g. at least 3 chars)
  if (clean.length >= 3) {
    const numMatch = clean.match(/(\d+)$/);
    const percentVal = numMatch ? Math.min(30, Math.max(5, parseInt(numMatch[1], 10))) : 10;

    return {
      code: clean,
      title: `${percentVal}% Social Media Creator Partner Discount`,
      creatorName: `@${clean.toLowerCase()} Influencer Partner`,
      discountType: 'percentage',
      discountValue: percentVal,
      maxDiscount: 2500,
      description: `Verified social media influencer promo code (${percentVal}% instant creator rebate).`,
      isInfluencer: true,
    };
  }

  return null;
}

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
  
  // Promo Code State (Supports Social Media Influencer codes)
  const [promoInput, setPromoInput] = useState<string>('SISAN10');
  const [appliedPromo, setAppliedPromo] = useState<CheckoutPromoCode | null>(CHECKOUT_PROMOS['SISAN10']);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(
    '✓ Influencer Code "SISAN10" Applied: 10% Creator Discount (@sisanbaniya)!'
  );

  // Points for Discounts State (1 Point = NPR 1.00)
  const userAvailablePoints = Math.max(750, loyaltyProfile.pointsBalance || 750);
  const [redeemedPoints, setRedeemedPoints] = useState<number>(250);
  const [customPointsInput, setCustomPointsInput] = useState<string>('250');
  const [showVatDetails, setShowVatDetails] = useState<boolean>(true);

  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showEsewaModal, setShowEsewaModal] = useState(false);
  const [showKhaltiModal, setShowKhaltiModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrProvider, setQrProvider] = useState<'esewa' | 'khalti'>('esewa');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const t = translations[language];

  // 1. Gross Hardware Subtotal (Taxable Base before discounts)
  const grandTaxable = cartShopGroups.reduce((sum, g) => sum + g.subtotal, 0);

  // 2. Promo Code Discount Calculation
  let promoDiscount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'fixed') {
      promoDiscount = appliedPromo.discountValue;
    } else {
      promoDiscount = Math.round((grandTaxable * appliedPromo.discountValue) / 100);
      if (appliedPromo.maxDiscount && promoDiscount > appliedPromo.maxDiscount) {
        promoDiscount = appliedPromo.maxDiscount;
      }
    }
  }

  // 3. Points for Discounts Calculation
  const maxPossiblePointsDiscount = Math.max(0, grandTaxable - promoDiscount);
  const pointsDiscount = Math.min(redeemedPoints, maxPossiblePointsDiscount);

  // 4. Net Taxable Base Amount (कर योग्य रकम) under Nepal VAT Act 2052
  const totalDiscounts = promoDiscount + pointsDiscount;
  const netTaxableBase = Math.max(0, grandTaxable - totalDiscounts);

  // 5. Real-Time 13% VAT Calculation explicitly computed on Net Taxable Base
  const realtimeVat = Math.round(netTaxableBase * 0.13);

  // 6. Delivery & Freight
  const grandDelivery = deliveryType === 'pickup' ? 0 : cartShopGroups.reduce((sum, g) => sum + g.deliveryFee, 0);

  // 7. Grand Total Payable
  const grandTotal = netTaxableBase + realtimeVat + grandDelivery;

  // Real-Time VAT Savings Shield (how much 13% VAT the user saved because of the discounts)
  const vatSavings = Math.round(totalDiscounts * 0.13);
  const totalCustomerSavings = totalDiscounts + vatSavings;

  const handleApplyPromoCode = (codeToApply?: string) => {
    const code = (codeToApply || promoInput).trim();
    setPromoError(null);
    setPromoSuccessMsg(null);

    if (!code) {
      setPromoError('Please enter a promo code or influencer partner code');
      return;
    }

    const config = parseInfluencerOrPromoCode(code);
    if (!config) {
      setPromoError(`Promo code "${code}" is invalid. Please check the spelling or enter a valid creator code.`);
      setAppliedPromo(null);
      return;
    }

    if (config.minOrder && grandTaxable < config.minOrder) {
      setPromoError(
        `Code "${config.code}" requires a minimum hardware subtotal of ${formatNPR(
          config.minOrder,
          language
        )}. Current: ${formatNPR(grandTaxable, language)}.`
      );
      return;
    }

    setAppliedPromo(config);
    setPromoInput(config.code);
    if (config.isInfluencer) {
      setPromoSuccessMsg(
        `✓ Influencer Partner Code "${config.code}" Applied! ${config.title} (${config.creatorName || 'Verified Partner'})`
      );
    } else {
      setPromoSuccessMsg(`✓ Promo Code "${config.code}" Applied! ${config.title}`);
    }

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch {}
  };

  const handleRemovePromoCode = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
    setPromoSuccessMsg(null);
  };

  const handleSelectPointsPreset = (points: number) => {
    const clamped = Math.min(points, userAvailablePoints, grandTaxable);
    setRedeemedPoints(clamped);
    setCustomPointsInput(clamped.toString());
  };

  const handleCustomPointsChange = (val: string) => {
    setCustomPointsInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      const clamped = Math.min(parsed, userAvailablePoints, grandTaxable);
      setRedeemedPoints(clamped);
    } else if (val === '') {
      setRedeemedPoints(0);
    }
  };

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
      const promoInfo = appliedPromo
        ? `${appliedPromo.code}${appliedPromo.isInfluencer ? `(@${appliedPromo.creatorName || 'Influencer'})` : ''}`
        : '';
      const pointsInfo = pointsDiscount > 0 ? `+POINTS-${redeemedPoints}` : '';

      const orders = await placeCustomerOrder({
        deliveryType,
        customerAddress,
        paymentMethod,
        appliedVoucherCode: `${promoInfo}${pointsInfo}`.trim() || undefined,
      });

      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {}

      onOrderSuccess(orders.map((o) => o.id));
      onClose();
    } catch (e) {
      console.error(e);
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

                {/* ================= 1. PROMO & INFLUENCER CODE IN CHECKOUT ================= */}
                <div className="p-4 bg-slate-900/95 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-white flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-orange-400" />
                      <span>Promo & Influencer Code (प्रोमो / इन्फ्लुएन्सर कोड)</span>
                    </label>
                    {appliedPromo && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-md flex items-center gap-1">
                        {appliedPromo.isInfluencer && <UserCheck className="w-3 h-3 text-orange-400" />}
                        {appliedPromo.code} Active
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Enter any official promotional coupon or social media creator code (e.g. from YouTube, TikTok, or Instagram campaigns).
                  </p>

                  {/* Promo Input + Action Button */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        id="checkout-promo-input"
                        type="text"
                        placeholder="Enter code (e.g. SISAN10, RONB10, PARAS10, DARAZ50)"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyPromoCode();
                          }
                        }}
                        className="w-full uppercase font-mono text-xs font-bold px-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-orange-500 focus:outline-none rounded-xl text-white placeholder:text-slate-500 placeholder:normal-case placeholder:font-sans"
                      />
                    </div>

                    {appliedPromo ? (
                      <button
                        type="button"
                        onClick={handleRemovePromoCode}
                        className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-black transition cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        id="checkout-apply-promo-btn"
                        onClick={() => handleApplyPromoCode()}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer shrink-0 shadow-sm"
                      >
                        Apply Code
                      </button>
                    )}
                  </div>

                  {/* Promo Feedback Alerts */}
                  {promoError && (
                    <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/40 border border-red-800/60 p-2.5 rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                      <span>{promoError}</span>
                    </div>
                  )}

                  {promoSuccessMsg && appliedPromo && (
                    <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                      <div className="leading-tight space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{promoSuccessMsg}</span>
                          {appliedPromo.isInfluencer && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 font-black">
                              VERIFIED CREATOR
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-emerald-300/80">{appliedPromo.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ================= 2. USE POINTS FOR DISCOUNTS ================= */}
                <div className="p-4 bg-slate-900/95 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <label className="text-xs font-black text-white">
                        Use Points for Discounts (अङ्क प्रयोग गर्नुहोस्)
                      </label>
                    </div>
                    <span className="text-[11px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {userAvailablePoints} Pts Available
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <span>Reward Value:</span>
                    <span className="font-bold text-amber-300">1 Reward Point = NPR 1.00 Instant Cash Discount</span>
                  </div>

                  {/* Quick Preset Points Buttons */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Points to Redeem:
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { label: '0 Pts', val: 0, desc: 'None' },
                        { label: '100 Pts', val: 100, desc: '-Rs 100' },
                        { label: '250 Pts', val: 250, desc: '-Rs 250' },
                        { label: '500 Pts', val: 500, desc: '-Rs 500' },
                        { label: 'Max', val: userAvailablePoints, desc: `-Rs ${userAvailablePoints}` },
                      ].map((item) => {
                        const isSelected = redeemedPoints === item.val;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => handleSelectPointsPreset(item.val)}
                            className={`py-2 px-1 rounded-xl text-center transition cursor-pointer border flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                            }`}
                          >
                            <span className="text-[11px] font-bold leading-none">{item.label}</span>
                            <span className="text-[9px] opacity-80 mt-0.5">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Points Input Slider */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Custom Points Amount:</span>
                      <span className="font-bold text-white font-mono">{redeemedPoints} Points (-NPR {formatNPR(pointsDiscount, language)})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max={userAvailablePoints}
                        step="10"
                        value={redeemedPoints}
                        onChange={(e) => handleSelectPointsPreset(parseInt(e.target.value, 10))}
                        className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <input
                        type="number"
                        min="0"
                        max={userAvailablePoints}
                        value={customPointsInput}
                        onChange={(e) => handleCustomPointsChange(e.target.value)}
                        className="w-16 text-center text-xs font-bold font-mono py-1.5 px-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {pointsDiscount > 0 && (
                    <div className="p-2 bg-amber-950/30 border border-amber-800/40 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-amber-300 flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        {redeemedPoints} Points Applied
                      </span>
                      <span className="font-black text-amber-400 font-mono">
                        -{formatNPR(pointsDiscount, language)}
                      </span>
                    </div>
                  )}
                </div>

                {/* ================= 3. REAL-TIME 13% VAT CALCULATOR & TAX BREAKDOWN ================= */}
                <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl border-2 border-emerald-500/30 space-y-3.5 shadow-lg shadow-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>Real-Time 13% VAT Calculator (१३% मू.अ.कर)</span>
                        </h4>
                        <p className="text-[10px] text-emerald-400/90 font-medium">
                          Nepal IRD VAT Act 2052 Compliant
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black rounded-lg">
                      13.00% VAT
                    </span>
                  </div>

                  {/* Interactive Real-Time Formula Table */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                    {/* Line 1: Gross Subtotal */}
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center gap-1">
                        <span>1. Gross Hardware Subtotal</span>
                      </span>
                      <span className="font-mono font-bold text-white">
                        {formatNPR(grandTaxable, language)}
                      </span>
                    </div>

                    {/* Line 2: Promo Discount */}
                    {appliedPromo && promoDiscount > 0 && (
                      <div className="flex justify-between items-center text-emerald-400">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>2. Promo / Creator Discount ({appliedPromo.code}):</span>
                        </span>
                        <span className="font-mono font-bold">
                          -{formatNPR(promoDiscount, language)}
                        </span>
                      </div>
                    )}

                    {/* Line 3: Points Discount */}
                    {pointsDiscount > 0 && (
                      <div className="flex justify-between items-center text-amber-400">
                        <span className="flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          <span>3. Points Redeemed ({redeemedPoints} pts):</span>
                        </span>
                        <span className="font-mono font-bold">
                          -{formatNPR(pointsDiscount, language)}
                        </span>
                      </div>
                    )}

                    {/* Line 4: Net Taxable Base */}
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-800/80 text-amber-300 bg-amber-500/5 px-2 py-1 rounded-lg">
                      <div>
                        <span className="font-bold">Net Taxable Base Amount (कर योग्य रकम):</span>
                        <p className="text-[9px] text-slate-400">(Gross Subtotal - Total Discounts)</p>
                      </div>
                      <span className="font-mono font-black text-amber-300 text-sm">
                        {formatNPR(netTaxableBase, language)}
                      </span>
                    </div>

                    {/* Line 5: 13% VAT Calculation */}
                    <div className="flex justify-between items-center text-emerald-400 bg-emerald-500/10 px-2 py-1.5 rounded-lg border border-emerald-500/20">
                      <div>
                        <div className="flex items-center gap-1 font-black">
                          <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                          <span>13% Nepal VAT (१३% मू.अ.कर):</span>
                        </div>
                        <p className="text-[9px] text-emerald-300/80 font-mono">
                          {formatNPR(netTaxableBase, language)} × 13% = +{formatNPR(realtimeVat, language)}
                        </p>
                      </div>
                      <span className="font-mono font-black text-emerald-300 text-sm">
                        +{formatNPR(realtimeVat, language)}
                      </span>
                    </div>

                    {/* Line 6: Delivery Fee */}
                    <div className="flex justify-between items-center text-slate-300 pt-0.5">
                      <span>Site Freight & Logistics:</span>
                      <span className="font-mono font-bold text-white">
                        {grandDelivery === 0 ? 'FREE DELIVERY' : `+${formatNPR(grandDelivery, language)}`}
                      </span>
                    </div>

                    {/* Grand Total Row */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-white font-black text-sm">
                      <span>Net Payable Order Total:</span>
                      <span className="text-orange-400 font-mono text-base">
                        {formatNPR(grandTotal, language)}
                      </span>
                    </div>
                  </div>

                  {/* Real-Time Tax Shield / Customer Savings Banner */}
                  {totalDiscounts > 0 && (
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="leading-snug">
                        <span className="font-bold text-white">Real-Time Tax & Price Shield:</span>
                        <p className="text-slate-300 mt-0.5">
                          Your discounts saved you <strong className="text-emerald-400">{formatNPR(totalDiscounts, language)}</strong> on materials plus <strong className="text-emerald-400">{formatNPR(vatSavings, language)}</strong> in reduced 13% VAT liability! Total Savings: <strong className="text-emerald-300">{formatNPR(totalCustomerSavings, language)}</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Official Tax Invoice with IRD PAN/VAT QR code generated immediately upon payment.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Totals & CTA */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Gross Hardware Subtotal:</span>
                  <span className="font-semibold text-white">{formatNPR(grandTaxable, language)}</span>
                </div>
                {appliedPromo && promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      Promo / Influencer ({appliedPromo.code}):
                    </span>
                    <span>-{formatNPR(promoDiscount, language)}</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      Points Discount ({redeemedPoints} pts):
                    </span>
                    <span>-{formatNPR(pointsDiscount, language)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>Net Taxable Base (कर योग्य रकम):</span>
                  <span className="font-semibold font-mono text-slate-200">{formatNPR(netTaxableBase, language)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Calculator className="w-3 h-3 text-emerald-400" />
                    13% Real-Time Nepal VAT:
                  </span>
                  <span className="font-mono">+{formatNPR(realtimeVat, language)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Site Delivery & Freight:</span>
                  <span className="font-semibold text-white">
                    {grandDelivery === 0 ? 'FREE' : `+${formatNPR(grandDelivery, language)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black text-white">
                  <span>Grand Total ({cartShopGroups.length} Shops):</span>
                  <span className="text-base text-orange-400 font-mono">{formatNPR(grandTotal, language)}</span>
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
            vatAmount: realtimeVat,
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
