import React, { useState, useMemo } from 'react';
import { Product, Shop } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatNPR } from '../../utils/formatters';
import { translations } from '../../utils/translations';
import {
  X,
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
  Info,
  ChevronRight,
  Store,
  Tag,
  Clock,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCart: () => void;
  onSelectProduct?: (product: Product) => void;
  onOpenStore?: (shop: Shop) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCart,
  onSelectProduct,
  onOpenStore,
}) => {
  const { language, shops, products, addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [addedAltId, setAddedAltId] = useState<string | null>(null);

  // The primary listing store for this product
  const primaryShop = useMemo(() => {
    if (!product) return shops[0] || null;
    return shops.find((s) => s.id === product.shopId) || shops[0];
  }, [shops, product]);

  // Find other store suggestions that sell either the exact same item (matching SKU / Brand) or same category
  const { exactMatches, categorySuggestions } = useMemo(() => {
    if (!product) return { exactMatches: [], categorySuggestions: [] };

    const others = products.filter(
      (p) => !p.isWholesale && p.id !== product.id && p.shopId !== product.shopId
    );

    // Exact or close match: matching SKU or same brand & name keywords
    const exact = others.filter((p) => {
      const matchSku = p.sku.toLowerCase() === product.sku.toLowerCase();
      const matchBrand = p.brand.toLowerCase() === product.brand.toLowerCase();
      const nameOverlap =
        p.name.toLowerCase().includes(product.brand.toLowerCase()) ||
        product.name.toLowerCase().includes(p.brand.toLowerCase());
      return matchSku || (matchBrand && nameOverlap);
    });

    // Category suggestions if exact matches are fewer
    const categoryAlt = others.filter(
      (p) => p.category === product.category && !exact.some((e) => e.id === p.id)
    );

    return {
      exactMatches: exact,
      categorySuggestions: categoryAlt,
    };
  }, [products, product]);

  if (!product || !primaryShop) return null;

  const t = translations[language];

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
    onClose();
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

  const handleSwitchToAltProduct = (altProduct: Product) => {
    if (onSelectProduct) {
      onSelectProduct(altProduct);
      setQuantity(1);
    }
  };

  const handleOpenStoreProfile = (shopToOpen: Shop) => {
    if (onOpenStore) {
      onOpenStore(shopToOpen);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full backdrop-blur-md transition cursor-pointer shadow-lg"
          title="Close product detail"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 scrollbar-thin p-5 sm:p-8 space-y-7">
          {/* ================= TOP SECTION: IMAGE + DETAILS & ACTION ================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            {/* Left: Product Image & Badges (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-center min-h-[280px] overflow-hidden group">
                <img
                  src={
                    product.images[0] ||
                    'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80'
                  }
                  alt={product.name}
                  className="max-h-64 object-contain rounded-xl transition duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {product.isBoosted && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white text-xs font-black rounded-full flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Featured Pick</span>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono font-medium rounded-lg">
                  SKU: {product.sku}
                </div>
              </div>

              {/* Verified IRD VAT Guarantee Strip */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950">
                    {product.isVatExempt ? '0% VAT Exempt Aggregate' : '13% Official IRD Tax Bill'}
                  </span>
                  <p className="text-[11px] text-emerald-800">
                    Complies with Nepal Tax Law 2052. Includes certified e-Invoice.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Product Details, Primary Store & Cart Actions (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                {/* Brand & Rating Header */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-extrabold text-orange-600 uppercase tracking-wider bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                    {product.brand}
                  </span>
                  {product.rating && (
                    <div className="flex items-center gap-1 text-slate-800 font-bold bg-slate-100 px-2.5 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400 font-normal">
                        ({product.reviewsCount} reviews)
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Name */}
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {product.nepaliName}
                </p>

                {/* Price & Unit Box */}
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-baseline justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {formatNPR(product.price, language)}
                      </span>
                      {product.mrp > product.price && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatNPR(product.mrp, language)}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-semibold">
                        / {language === 'ne' ? product.nepaliUnit : product.unit}
                      </span>
                    </div>

                    {product.mrp > product.price && (
                      <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Save {formatNPR(product.mrp - product.price)} (
                        {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off MRP)
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                        ● {product.stock} in stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                        ● Out of stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {product.description}
                </p>

                {/* ================= PRIMARY LISTING STORE CARD ================= */}
                <div className="mt-4 p-3.5 bg-gradient-to-r from-orange-50/70 to-slate-50 rounded-2xl border border-orange-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-orange-700">
                      Listed & Fulfilled By:
                    </span>
                    <button
                      onClick={() => handleOpenStoreProfile(primaryShop)}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Visit Store Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div
                    onClick={() => handleOpenStoreProfile(primaryShop)}
                    className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200/80 hover:border-orange-400 hover:shadow-xs transition cursor-pointer group"
                  >
                    <img
                      src={primaryShop.logoImage}
                      alt={primaryShop.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-orange-600 transition">
                          {primaryShop.name}
                        </h4>
                        {primaryShop.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {primaryShop.location.area}, {primaryShop.location.city}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {primaryShop.rating} ({primaryShop.reviewCount})
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 bg-orange-100 text-orange-950 font-bold rounded-lg text-[11px] group-hover:bg-orange-500 group-hover:text-white transition">
                        View Store →
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity Selector & Action Buttons */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-1 text-sm font-black text-slate-900 min-w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="p-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    id="modal-add-cart-btn"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      addedAnimation
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                    } disabled:opacity-50`}
                  >
                    {addedAnimation ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add {quantity} to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    id="modal-buy-now-btn"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="py-3 px-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-md shadow-orange-500/25 disabled:opacity-50"
                  >
                    Buy Now ({formatNPR(product.price * quantity, language)})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 2. TECHNICAL SPECIFICATIONS ================= */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>Full Technical Specifications</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Hardware Brand:</span>
                <span className="font-bold text-slate-900">{product.brand}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Hardware Category:</span>
                <span className="font-bold text-slate-900 capitalize">
                  {product.category.replace('_', ' ')}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Unit of Sale:</span>
                <span className="font-bold text-slate-900">
                  {product.unit} ({product.nepaliUnit})
                </span>
              </div>

              {Object.entries(product.specs).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <span className="text-slate-500">{key}:</span>
                  <span className="font-bold text-slate-900">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ================= 3. OTHER STORE SUGGESTIONS SELLING SAME ITEMS ================= */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-orange-500" />
                  <span>
                    {exactMatches.length > 0
                      ? `Other Stores Selling "${product.name.split('(')[0].trim()}" (${exactMatches.length})`
                      : `Other Verified Stores in ${product.category.replace('_', ' ')} (${categorySuggestions.length})`}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compare prices, stock availability, and delivery distances from other certified dealers in Nepal.
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <ArrowUpDown className="w-3.5 h-3.5 text-orange-500" />
                <span>Multi-dealer Price Comparison</span>
              </div>
            </div>

            {/* List of Other Stores Suggestions */}
            {exactMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {exactMatches.map((alt) => {
                  const altShop = shops.find((s) => s.id === alt.shopId) || shops[0];
                  const priceDiff = alt.price - product.price;
                  const isAltAdded = addedAltId === alt.id;

                  return (
                    <div
                      key={alt.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-orange-400 hover:shadow-md transition flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Store Info */}
                        <div className="flex items-start gap-3">
                          <img
                            src={altShop.logoImage}
                            alt={altShop.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h4 className="font-bold text-xs text-slate-900 truncate">
                                {altShop.name}
                              </h4>
                              {altShop.isVerified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {altShop.address}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                              <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {altShop.rating}
                              </span>
                              <span>•</span>
                              <span>~{altShop.location.deliveryRadiusKm}km radius</span>
                            </div>
                          </div>
                        </div>

                        {/* Store's Price & Difference Badge */}
                        <div className="text-right shrink-0">
                          <p className="text-base font-black text-slate-900">
                            {formatNPR(alt.price, language)}
                          </p>
                          {priceDiff < 0 ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              {formatNPR(Math.abs(priceDiff))} cheaper
                            </span>
                          ) : priceDiff > 0 ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              +{formatNPR(priceDiff)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              Same Price
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stock & Quick Action Buttons */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {alt.stock > 0 ? (
                            <span className="text-emerald-700 font-bold">● {alt.stock} {alt.unit} In Stock</span>
                          ) : (
                            <span className="text-rose-600 font-bold">● Out of stock</span>
                          )}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenStoreProfile(altShop)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            View Store
                          </button>

                          <button
                            onClick={() => handleSwitchToAltProduct(alt)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-orange-50 text-orange-600 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Switch Seller
                          </button>

                          <button
                            onClick={(e) => handleQuickAddAlt(e, alt)}
                            disabled={alt.stock === 0}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                              isAltAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 hover:bg-orange-500 text-white'
                            } disabled:opacity-40`}
                          >
                            {isAltAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : categorySuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {categorySuggestions.slice(0, 4).map((alt) => {
                  const altShop = shops.find((s) => s.id === alt.shopId) || shops[0];
                  const isAltAdded = addedAltId === alt.id;

                  return (
                    <div
                      key={alt.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-orange-400 hover:shadow-md transition flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={alt.images[0] || altShop.logoImage}
                            alt={alt.name}
                            className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-200 shrink-0 p-1"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {alt.name}
                            </h4>
                            <p className="text-[11px] text-orange-600 font-semibold truncate mt-0.5">
                              Store: {altShop.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
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

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenStoreProfile(altShop)}
                          className="text-xs font-bold text-slate-600 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Store: {altShop.name.split(' ')[0]}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSwitchToAltProduct(alt)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            View Item
                          </button>
                          <button
                            onClick={(e) => handleQuickAddAlt(e, alt)}
                            disabled={alt.stock === 0}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
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
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                This item is an exclusive catalog piece listed only by {primaryShop.name}.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
