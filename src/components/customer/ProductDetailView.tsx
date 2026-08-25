import React, { useState, useMemo } from 'react';
import { Product, Shop } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatNPR } from '../../utils/formatters';
import { translations, categoryLabels } from '../../utils/translations';
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Star,
  Sparkles,
  Truck,
  Building,
  ChevronRight,
  Store,
  Tag,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  ArrowUpDown,
  Check,
  Share2,
  Heart,
  Phone,
  RotateCcw,
  BadgeAlert,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onOpenCart: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenStore: (shop: Shop) => void;
  originShop?: Shop | null;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onBack,
  onOpenCart,
  onSelectProduct,
  onOpenStore,
  originShop,
}) => {
  const { language, shops, products, addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [addedAltId, setAddedAltId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'comparison' | 'dealer' | 'delivery'>('specs');

  // The primary listing store for this product
  const primaryShop = useMemo(() => {
    return shops.find((s) => s.id === product.shopId) || shops[0];
  }, [shops, product.shopId]);

  // Multi-store suggestions: matching SKU/brand or same category
  const { exactMatches, categorySuggestions } = useMemo(() => {
    const others = products.filter(
      (p) => !p.isWholesale && p.id !== product.id && p.shopId !== product.shopId
    );

    const exact = others.filter((p) => {
      const matchSku = p.sku.toLowerCase() === product.sku.toLowerCase();
      const matchBrand = p.brand.toLowerCase() === product.brand.toLowerCase();
      const nameOverlap =
        p.name.toLowerCase().includes(product.brand.toLowerCase()) ||
        product.name.toLowerCase().includes(p.brand.toLowerCase());
      return matchSku || (matchBrand && nameOverlap);
    });

    const categoryAlt = others.filter(
      (p) => p.category === product.category && !exact.some((e) => e.id === p.id)
    );

    return {
      exactMatches: exact,
      categorySuggestions: categoryAlt,
    };
  }, [products, product]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedAnimation(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onOpenCart();
  };

  const handleQuickAddAlt = (e: React.MouseEvent, altProduct: Product) => {
    e.stopPropagation();
    addToCart(altProduct, 1);
    setAddedAltId(altProduct.id);
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch {}
    setTimeout(() => {
      setAddedAltId(null);
    }, 1200);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const catLabel = categoryLabels[product.category] || { en: product.category, ne: product.category };
  const allImages = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ================= 1. BREADCRUMBS & TOP CONTROLS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Back Button & Breadcrumb */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {originShop ? `Back to ${originShop.name.split(' ')[0]}` : 'Back to Hardware Hub'}
            </span>
          </button>

          <span className="text-slate-300">/</span>

          <span className="text-xs text-slate-500 font-medium">
            {language === 'ne' ? catLabel.ne : catLabel.en}
          </span>

          <span className="text-slate-300">/</span>

          <span className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </div>

        {/* Action Controls: Share & View Cart */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>

          <button
            onClick={onOpenCart}
            className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm shadow-orange-500/25 transition cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open Cart</span>
          </button>
        </div>
      </div>

      {/* ================= 2. MAIN PRODUCT HERO SHOWCASE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* Left Column: Image Gallery (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative bg-slate-50 border border-slate-200 rounded-3xl p-6 flex items-center justify-center min-h-[340px] sm:min-h-[420px] overflow-hidden group">
            <img
              src={allImages[selectedImageIndex] || allImages[0]}
              alt={product.name}
              className="max-h-[320px] sm:max-h-[380px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />

            {product.isBoosted && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-orange-500 text-white text-xs font-black rounded-full flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Pick</span>
              </div>
            )}

            <div className="absolute bottom-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-xs font-mono font-medium rounded-xl">
              SKU: {product.sku}
            </div>

            {product.isVatExempt ? (
              <div className="absolute top-4 right-4 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold rounded-full">
                0% VAT Aggregate
              </div>
            ) : (
              <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>13% IRD VAT Tax</span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl border-2 p-1 bg-slate-50 overflow-hidden transition cursor-pointer ${
                    selectedImageIndex === idx ? 'border-orange-500' : 'border-slate-200 opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

          {/* Official IRD & Nepal Quality Certification Box */}
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-emerald-950">
                {product.isVatExempt
                  ? 'Government 0% VAT Agriculture/Raw Materials Exemption'
                  : 'Certified Nepal Inland Revenue (IRD) 13% Tax Compliant'}
              </p>
              <p className="text-emerald-800 leading-relaxed">
                Purchases include a verified digital e-bill with QR code matching the seller&apos;s active PAN ({primaryShop.panVatNumber}).
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Product Core Info & Buying Section (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Brand Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 font-extrabold text-xs rounded-lg uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg">
                  {language === 'ne' ? catLabel.ne : catLabel.en}
                </span>
              </div>

              {product.rating && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-slate-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">
                    ({product.reviewsCount} customer reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Product Titles */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-sm sm:text-base font-semibold text-slate-500 mt-1">
                {product.nepaliName}
              </p>
            </div>

            {/* Price & Unit Box */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {formatNPR(product.price, language)}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-base text-slate-400 line-through font-semibold">
                      {formatNPR(product.mrp, language)}
                    </span>
                  )}
                  <span className="text-xs sm:text-sm text-slate-500 font-bold">
                    / {language === 'ne' ? product.nepaliUnit : product.unit}
                  </span>
                </div>

                {product.mrp > product.price && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      Save {formatNPR(product.mrp - product.price)} (
                      {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off MRP)
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Inclusive of all local taxes</span>
                  </div>
                )}
              </div>

              <div className="sm:text-right">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    {product.stock} {product.unit} Available in Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-rose-800 bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200">
                    Out of stock at this dealer
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* ================= PRIMARY LISTING DEALER CARD ================= */}
            <div className="p-4 bg-gradient-to-r from-orange-50/80 via-slate-50 to-amber-50/50 rounded-2xl border border-orange-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-black tracking-wider text-orange-800 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-orange-600" />
                  Fulfilled & Dispatched By:
                </span>
                <button
                  onClick={() => onOpenStore(primaryShop)}
                  className="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer transition"
                >
                  <span>Open Full Store Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div
                onClick={() => onOpenStore(primaryShop)}
                className="flex items-center justify-between gap-4 p-3 bg-white rounded-xl border border-slate-200 hover:border-orange-400 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={primaryShop.logoImage}
                    alt={primaryShop.name}
                    className="w-13 h-13 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition"
                    referrerPolicy="no-referrer"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-slate-900 truncate group-hover:text-orange-600 transition">
                        {primaryShop.name}
                      </h4>
                      {primaryShop.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {primaryShop.address}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {primaryShop.rating} ({primaryShop.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-950 font-bold rounded-xl text-xs group-hover:bg-orange-500 group-hover:text-white transition shadow-2xs">
                    View Catalog →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selector & Action CTA Bar */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Order Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 py-1.5 text-base font-black text-slate-900 min-w-14 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  {product.unit}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium">Calculated Subtotal: </span>
                <span className="text-lg font-black text-slate-900">
                  {formatNPR(product.price * quantity, language)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="page-add-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`py-3.5 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white shadow-md'
                } disabled:opacity-50`}
              >
                {addedAnimation ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Added {quantity} to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add {quantity} to Cart</span>
                  </>
                )}
              </button>

              <button
                id="page-buy-now-btn"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="py-3.5 px-6 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white rounded-2xl text-sm font-black transition cursor-pointer shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Instant Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Guarantees Footer */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-500 text-center">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-700">Site Tipper/Truck Drop</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center gap-1">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-700">100% Genuine Brand</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-slate-700">Damaged Goods Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. DETAILS TABS NAVIGATION ================= */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="border-b border-slate-200 px-6 py-3 bg-slate-50/50 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'specs'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Technical Specifications</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>
              Multi-Store Price Comparison ({exactMatches.length + categorySuggestions.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dealer')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dealer'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Seller Profile & Delivery Terms</span>
          </button>
        </div>

        {/* Tab 1: Full Technical Specifications */}
        {activeTab === 'specs' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900">
                Technical Data Sheet & Standards
              </h3>
              <p className="text-xs text-slate-500">
                Verified manufacturing standards and specifications conforming to Nepal Standard (NS) and IS protocols.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Manufacturing Brand:</span>
                <span className="font-black text-slate-900">{product.brand}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Hardware Category:</span>
                <span className="font-black text-slate-900 capitalize">
                  {product.category.replace('_', ' ')}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Sales Unit:</span>
                <span className="font-black text-slate-900">
                  {product.unit} ({product.nepaliUnit})
                </span>
              </div>

              {Object.entries(product.specs).map(([k, v]) => (
                <div
                  key={k}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <span className="text-slate-500 font-semibold">{k}:</span>
                  <span className="font-black text-slate-900">{v}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <BadgeAlert className="w-4 h-4 text-amber-600" />
                Job-Site Storage Instructions (नेपाल निर्माण मापदण्ड)
              </p>
              <p className="leading-relaxed text-amber-800">
                Store cement and chemical paints on raised wooden pallets at least 15cm off the ground. TMT steel bars should be sheltered from monsoon rains to prevent atmospheric oxidation before bar bending.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Multi-Store Comparison */}
        {activeTab === 'comparison' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-orange-500" />
                  <span>
                    {exactMatches.length > 0
                      ? `Compare Prices Across Certified Dealers in Nepal (${exactMatches.length})`
                      : `Other Certified Hardware Sellers in ${product.category.replace('_', ' ')} (${categorySuggestions.length})`}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live pricing, inventory count, and dispatch radius from verified stores in Kathmandu Valley & Gandaki.
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-xl">
                <ArrowUpDown className="w-3.5 h-3.5 text-orange-500" />
                <span>Instant Multi-Store Switch</span>
              </div>
            </div>

            {exactMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exactMatches.map((alt) => {
                  const altShop = shops.find((s) => s.id === alt.shopId) || shops[0];
                  const priceDiff = alt.price - product.price;
                  const isAltAdded = addedAltId === alt.id;

                  return (
                    <div
                      key={alt.id}
                      className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-orange-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <img
                            src={altShop.logoImage}
                            alt={altShop.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-black text-sm text-slate-900 truncate">
                                {altShop.name}
                              </h4>
                              {altShop.isVerified && (
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {altShop.address}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {altShop.rating}
                              </span>
                              <span>•</span>
                              <span>~{altShop.location.deliveryRadiusKm}km delivery radius</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-lg font-black text-slate-900">
                            {formatNPR(alt.price, language)}
                          </p>
                          {priceDiff < 0 ? (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                              {formatNPR(Math.abs(priceDiff))} Cheaper
                            </span>
                          ) : priceDiff > 0 ? (
                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                              +{formatNPR(priceDiff)}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                              Same Price
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500 font-semibold">
                          {alt.stock > 0 ? (
                            <span className="text-emerald-700 font-bold">
                              ● {alt.stock} {alt.unit} In Stock
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold">● Out of stock</span>
                          )}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenStore(altShop)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Store Profile
                          </button>

                          <button
                            onClick={() => onSelectProduct(alt)}
                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Switch to this Seller
                          </button>

                          <button
                            onClick={(e) => handleQuickAddAlt(e, alt)}
                            disabled={alt.stock === 0}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                              isAltAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 hover:bg-orange-500 text-white'
                            } disabled:opacity-40`}
                          >
                            {isAltAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : categorySuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorySuggestions.slice(0, 4).map((alt) => {
                  const altShop = shops.find((s) => s.id === alt.shopId) || shops[0];
                  const isAltAdded = addedAltId === alt.id;

                  return (
                    <div
                      key={alt.id}
                      className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-orange-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={alt.images[0] || altShop.logoImage}
                            alt={alt.name}
                            className="w-14 h-14 rounded-2xl object-contain bg-slate-50 border border-slate-200 shrink-0 p-1"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {alt.name}
                            </h4>
                            <p className="text-xs text-orange-600 font-bold truncate mt-0.5">
                              Store: {altShop.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {altShop.address} (~{altShop.location.deliveryRadiusKm}km delivery)
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-base font-black text-slate-900">
                            {formatNPR(alt.price, language)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            per {alt.unit}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onOpenStore(altShop)}
                          className="text-xs font-bold text-slate-600 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Store: {altShop.name.split(' ')[0]}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectProduct(alt)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            View Product Page
                          </button>
                          <button
                            onClick={(e) => handleQuickAddAlt(e, alt)}
                            disabled={alt.stock === 0}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                              isAltAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 hover:bg-orange-500 text-white'
                            } disabled:opacity-40`}
                          >
                            {isAltAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                This item is an exclusive catalog piece listed only by {primaryShop.name}.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Seller Profile & Delivery Terms */}
        {activeTab === 'dealer' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-orange-500" />
                  <span>Licensed Merchant Details</span>
                </h4>
                <div className="space-y-2 text-xs text-slate-700 divide-y divide-slate-200">
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500">Firm Name:</span>
                    <span className="font-bold text-slate-900">{primaryShop.name}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500">Proprietor:</span>
                    <span className="font-bold text-slate-900">{primaryShop.ownerName}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500">Inland Revenue PAN:</span>
                    <span className="font-mono font-bold text-emerald-800">{primaryShop.panVatNumber}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500">Support Contact:</span>
                    <span className="font-bold text-slate-900">{primaryShop.phone}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Freight & Logistics Terms</span>
                </h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <p className="text-slate-600 leading-relaxed">
                    This dealer operates crane trucks, tippers, and light utility vans capable of delivering direct to building construction sites across {primaryShop.location.city}.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600">Base Freight Charge:</span>
                      <span className="font-black text-slate-900">{formatNPR(primaryShop.deliveryFee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600">Free Freight Threshold:</span>
                      <span className="font-black text-emerald-700">Orders above {formatNPR(primaryShop.minOrderForFreeDelivery)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => onOpenStore(primaryShop)}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xs inline-flex items-center gap-2 shadow-md shadow-orange-500/25 transition cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Visit {primaryShop.name}&apos;s Complete Hardware Store Page</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
