import React, { useState, useMemo } from 'react';
import { Shop, Product, HardwareCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatNPR } from '../../utils/formatters';
import { translations, categoryLabels } from '../../utils/translations';
import {
  X,
  Store,
  MapPin,
  Phone,
  Clock,
  Star,
  ShieldCheck,
  Truck,
  Sparkles,
  Search,
  ShoppingCart,
  Plus,
  CheckCircle2,
  Share2,
  Building,
  Check,
  FileText,
  CreditCard,
  QrCode,
  Tag,
  ArrowRight,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StoreDetailModalProps {
  shop: Shop | null;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenCart: () => void;
}

export const StoreDetailModal: React.FC<StoreDetailModalProps> = ({
  shop,
  onClose,
  onSelectProduct,
  onOpenCart,
}) => {
  const { language, products, addToCart } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'documents'>('products');

  // All products belonging to this specific store (retail only)
  const storeProducts = useMemo(() => {
    if (!shop) return [];
    return products.filter((p) => p.shopId === shop.id && !p.isWholesale);
  }, [products, shop]);

  // Extract categories available in this store
  const availableCategories = useMemo(() => {
    const cats = new Set<HardwareCategory>();
    storeProducts.forEach((p) => cats.add(p.category));
    return Array.from(cats);
  }, [storeProducts]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return storeProducts
      .filter((p) => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q) || p.nepaliName.includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchSku) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0);
      });
  }, [storeProducts, selectedCategory, searchQuery, sortBy]);

  if (!shop) return null;

  const t = translations[language];

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedAnimationId(product.id);
    try {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
    } catch {}
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1200);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(shop.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-slate-900/60 hover:bg-slate-950 text-white rounded-full backdrop-blur-md transition cursor-pointer shadow-lg"
          title="Close store"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 scrollbar-thin">
          {/* ================= 1. STORE HERO BANNER & IDENTITY ================= */}
          <div className="relative bg-slate-900 text-white">
            {/* Cover Photo */}
            <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-slate-950">
              <img
                src={shop.bannerImage}
                alt={shop.name}
                className="w-full h-full object-cover opacity-60 filter brightness-90"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>

            {/* Store Profile Info Overlay */}
            <div className="px-5 sm:px-8 pb-6 -mt-16 sm:-mt-20 relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                {/* Logo & Core Identity */}
                <div className="flex items-end gap-4">
                  <img
                    src={shop.logoImage}
                    alt={shop.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white bg-slate-800 shadow-xl shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {shop.name}
                      </h1>
                      {shop.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full text-xs font-bold shadow-2xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          PAN Verified
                        </span>
                      )}
                      {shop.isBoosted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-500 text-slate-950 rounded-full text-[11px] font-black shadow-2xs">
                          <Sparkles className="w-3 h-3" />
                          Featured Hardware Hub
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 font-medium">
                      {shop.nepaliName}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-4 h-4 fill-amber-400" />
                        {shop.rating} ({shop.reviewCount} customer reviews)
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {shop.openingHours}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Contact Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={handleCopyPhone}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition cursor-pointer"
                  >
                    {copiedPhone ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 text-orange-400" />
                        <span>Call {shop.phone}</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={onOpenCart}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-orange-500/25 transition cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>View Cart</span>
                  </button>
                </div>
              </div>

              {/* Badges / Highlights Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Address</p>
                    <p className="text-xs font-semibold text-white truncate">{shop.address}</p>
                  </div>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Delivery Radius</p>
                    <p className="text-xs font-semibold text-white">Up to {shop.location.deliveryRadiusKm} km</p>
                  </div>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Inland Revenue</p>
                    <p className="text-xs font-semibold text-white">PAN: {shop.panVatNumber}</p>
                  </div>
                </div>

                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Free Freight</p>
                    <p className="text-xs font-semibold text-white">Orders &gt; {formatNPR(shop.minOrderForFreeDelivery)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 2. STORE NAVIGATION TABS ================= */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'products'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Store Catalog ({storeProducts.length} Items)</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'about'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>About & Dealer Info</span>
              </button>

              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'documents'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>IRD & Compliance</span>
              </button>
            </div>

            {/* Quick In-Store Search */}
            {activeTab === 'products' && (
              <div className="relative min-w-48 sm:min-w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${shop.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ================= 3. TAB CONTENTS ================= */}
          <div className="p-5 sm:p-8 space-y-6">
            {/* ---------------- A. PRODUCTS CATALOG TAB ---------------- */}
            {activeTab === 'products' && (
              <div className="space-y-5">
                {/* Category Pills & Sorting Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({storeProducts.length})
                    </button>
                    {availableCategories.map((catKey) => {
                      const info = categoryLabels[catKey];
                      const count = storeProducts.filter((p) => p.category === catKey).length;
                      return (
                        <button
                          key={catKey}
                          onClick={() => setSelectedCategory(catKey)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
                            selectedCategory === catKey
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>{language === 'ne' ? info.ne : info.en}</span>
                          <span className="text-[10px] opacity-75">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span className="text-xs text-slate-500 font-medium">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                    >
                      <option value="featured">Featured Picks</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Top Customer Rated</option>
                    </select>
                  </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <Search className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="font-bold text-sm text-slate-800">No hardware products found</p>
                    <p className="text-xs text-slate-500">
                      Try clearing search query or selecting another category.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => {
                      const isAdded = addedAnimationId === product.id;

                      return (
                        <div
                          key={product.id}
                          onClick={() => {
                            onSelectProduct(product);
                          }}
                          className="group bg-white rounded-2xl border border-slate-200 hover:border-orange-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
                        >
                          {/* Image Container */}
                          <div className="relative bg-slate-50 p-4 h-44 flex items-center justify-center border-b border-slate-100 overflow-hidden">
                            <img
                              src={product.images[0] || 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80'}
                              alt={product.name}
                              className="max-h-36 object-contain group-hover:scale-105 transition duration-300"
                              referrerPolicy="no-referrer"
                            />
                            {product.isBoosted && (
                              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black rounded-md shadow-2xs">
                                Top Pick
                              </span>
                            )}
                            {product.isVatExempt ? (
                              <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">
                                VAT 0%
                              </span>
                            ) : (
                              <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded">
                                13% IRD VAT
                              </span>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                <span className="font-bold text-orange-600 uppercase tracking-wider">
                                  {product.brand}
                                </span>
                                {product.rating && (
                                  <span className="flex items-center gap-0.5 font-bold text-slate-800">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {product.rating}
                                  </span>
                                )}
                              </div>

                              <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition">
                                {language === 'ne' ? product.nepaliName : product.name}
                              </h3>

                              {/* Specs Pill Summary */}
                              <div className="mt-2 flex flex-wrap gap-1">
                                {Object.entries(product.specs).slice(0, 2).map(([k, v]) => (
                                  <span key={k} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                    {k}: {v}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Price & Add to Cart */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <div>
                                <p className="text-base font-black text-slate-900">
                                  {formatNPR(product.price, language)}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  per {language === 'ne' ? product.nepaliUnit : product.unit}
                                </p>
                              </div>

                              <button
                                onClick={(e) => handleQuickAdd(e, product)}
                                disabled={product.stock === 0}
                                className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                  isAdded
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-900 hover:bg-orange-500 text-white'
                                } disabled:opacity-40`}
                                title="Quick add to cart"
                              >
                                {isAdded ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ---------------- B. ABOUT & DEALER INFO TAB ---------------- */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shop Details */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Store className="w-4 h-4 text-orange-500" />
                      <span>Dealer Profile & Ownership</span>
                    </h3>

                    <div className="space-y-3 text-xs text-slate-700 divide-y divide-slate-200/60">
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-slate-500">Registered Enterprise:</span>
                        <span className="font-bold text-slate-900">{shop.name}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-slate-500">Authorized Operator:</span>
                        <span className="font-bold text-slate-900">{shop.ownerName}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-slate-500">Physical Address:</span>
                        <span className="font-bold text-slate-900 text-right">{shop.address}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-slate-500">District / Municipality:</span>
                        <span className="font-bold text-slate-900">{shop.location.district}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-slate-500">Total Lifetime Invoices:</span>
                        <span className="font-bold text-emerald-700">{shop.totalSalesCount}+ Completed</span>
                      </div>
                    </div>
                  </div>

                  {/* Freight & Logistics Capabilities */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Logistics & Freight Services</span>
                    </h3>

                    <div className="space-y-3 text-xs text-slate-700">
                      <p className="text-slate-600 leading-relaxed">
                        This store maintains dedicated logistics fleets for immediate job-site dropoff across {shop.location.city} and surrounding districts.
                      </p>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600">Standard Delivery Fee:</span>
                          <span className="font-bold text-slate-900">{formatNPR(shop.deliveryFee)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600">Free Site Freight:</span>
                          <span className="font-bold text-emerald-700">On orders above {formatNPR(shop.minOrderForFreeDelivery)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600">Max Dispatch Radius:</span>
                          <span className="font-bold text-slate-900">{shop.location.deliveryRadiusKm} Kilometers</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Supports Tata Ace mini-trucks, tractor tippers & motorbike courier drops.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accepted Payment Gateways */}
                <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-orange-600" />
                      <span>Accepted Payment Methods</span>
                    </h4>
                    <p className="text-xs text-slate-600">
                      Direct digital settlement with verified IRD QR bill integration.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1.5 bg-white text-[#60bb46] font-bold rounded-xl border border-slate-200 text-xs shadow-2xs">
                      eSewa Wallet & QR
                    </span>
                    <span className="px-3 py-1.5 bg-white text-[#5c2d91] font-bold rounded-xl border border-slate-200 text-xs shadow-2xs">
                      Khalti Digital Wallet
                    </span>
                    <span className="px-3 py-1.5 bg-white text-rose-600 font-bold rounded-xl border border-slate-200 text-xs shadow-2xs">
                      Fonepay Interbank QR
                    </span>
                    <span className="px-3 py-1.5 bg-white text-slate-800 font-bold rounded-xl border border-slate-200 text-xs shadow-2xs">
                      Cash on Site Delivery
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- C. IRD & COMPLIANCE TAB ---------------- */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Inland Revenue Department (IRD) Verified Dealer</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      All hardware sales from this store comply with Government of Nepal VAT Act 2052 and include official 13% tax invoices.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAN / VAT Number</p>
                    <p className="text-base font-black text-slate-900 font-mono">{shop.panVatNumber}</p>
                    <p className="text-[11px] text-emerald-700 font-bold">Status: Active Taxpayer</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Municipal Trade License</p>
                    <p className="text-base font-black text-slate-900 font-mono">REG-2080-KTM-44</p>
                    <p className="text-[11px] text-slate-600 font-semibold">Ward Office Verified</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accounting System</p>
                    <p className="text-base font-black text-slate-900 font-mono">BusyWin / Tally ERP</p>
                    <p className="text-[11px] text-blue-700 font-semibold">IRD e-Billing Sync</p>
                  </div>
                </div>

                {/* Document Previews */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Verified Business Certificates:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                      <img
                        src={shop.documents.panDocUrl}
                        alt="PAN Certificate"
                        className="w-full h-24 object-cover rounded-lg border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-[11px] font-bold text-slate-800">PAN Certificate</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                      <img
                        src={shop.documents.tradeLicenseUrl}
                        alt="Trade License"
                        className="w-full h-24 object-cover rounded-lg border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-[11px] font-bold text-slate-800">Trade License</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                      <img
                        src={shop.documents.shopPhotoUrl}
                        alt="Shopfront Photo"
                        className="w-full h-24 object-cover rounded-lg border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-[11px] font-bold text-slate-800">Verified Shopfront</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-2">
                      <img
                        src={shop.documents.citizenshipUrl}
                        alt="Proprietor Identity"
                        className="w-full h-24 object-cover rounded-lg border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-[11px] font-bold text-slate-800">Proprietor KYC</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
