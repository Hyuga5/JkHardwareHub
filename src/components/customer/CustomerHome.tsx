import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Shop, HardwareCategory } from '../../types';
import { translations, categoryLabels } from '../../utils/translations';
import { formatNPR } from '../../utils/formatters';
import {
  Store,
  MapPin,
  Star,
  ShieldCheck,
  Sparkles,
  Search,
  ShoppingCart,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2,
  PhoneCall,
  Clock,
  Hammer,
  Wrench,
  Zap,
  Paintbrush,
  Shield,
  Home,
  Bath,
} from 'lucide-react';

interface CustomerHomeProps {
  onSelectProduct: (product: Product) => void;
  onSelectShop?: (shop: Shop) => void;
  searchQuery: string;
  onOpenCart: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onSelectProduct,
  onSelectShop,
  searchQuery,
  onOpenCart,
}) => {
  const { language, shops, products, addToCart } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory | 'all'>('all');
  const [selectedShopFilter, setSelectedShopFilter] = useState<string>('all');
  const [onlyVatExempt, setOnlyVatExempt] = useState(false);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const t = translations[language];

  // Filter products
  const filteredProducts = products.filter((p) => {
    // Exclude wholesale-only distributor products from standard retail marketplace
    if (p.isWholesale) return false;

    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedShopFilter !== 'all' && p.shopId !== selectedShopFilter) return false;
    if (onlyVatExempt && !p.isVatExempt) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q) || p.nepaliName.includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchCategory && !matchSku) return false;
    }

    return true;
  });

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedAnimationId(product.id);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1200);
  };

  const getCategoryIcon = (category: HardwareCategory) => {
    switch (category) {
      case 'cement_steel': return <Hammer className="w-4 h-4 text-amber-600" />;
      case 'pipes_fittings': return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'electrical_lighting': return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'paints_adhesives': return <Paintbrush className="w-4 h-4 text-rose-600" />;
      case 'sanitaryware': return <Bath className="w-4 h-4 text-cyan-600" />;
      case 'fasteners_safety': return <Shield className="w-4 h-4 text-emerald-600" />;
      default: return <Home className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Hero Bento Spotlight Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950/50 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nepal's Verified Hardware & Construction Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Order Genuine Hardware with <span className="text-orange-400">13% IRD Tax Invoices</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Directly from certified local shops in Kathmandu, Lalitpur, Pokhara & across Nepal. Cement, TMT rebar, CPVC plumbing, Bosch tools, and paints delivered straight to your site.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            <span className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              PAN / VAT Verified Stores
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200">
              <Store className="w-4 h-4 text-orange-400" />
              Auto-Split Store Cart
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#60bb46]" />
              eSewa & Khalti Supported
            </span>
          </div>
        </div>
      </div>

      {/* Nearby Verified Hardware Stores Bento Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t.nearbyShops}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing {shops.length} certified shops
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <div
              key={shop.id}
              onClick={() => {
                if (onSelectShop) {
                  onSelectShop(shop);
                } else {
                  setSelectedShopFilter(selectedShopFilter === shop.id ? 'all' : shop.id);
                }
              }}
              className={`p-4 rounded-2xl border transition cursor-pointer relative overflow-hidden bg-slate-900/90 group ${
                selectedShopFilter === shop.id
                  ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-lg'
                  : 'border-slate-800 hover:border-orange-500/60 hover:shadow-xl'
              }`}
            >
              {shop.isBoosted && (
                <div className="absolute top-0 right-0 px-3 py-0.5 bg-orange-500 text-slate-950 text-[10px] font-black rounded-bl-xl shadow-xs">
                  FEATURED STORE
                </div>
              )}

              <div className="flex items-start gap-3">
                <img
                  src={shop.logoImage}
                  alt={shop.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0 group-hover:scale-105 transition"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-xs text-white truncate group-hover:text-orange-400 transition">
                      {shop.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {shop.address}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[11px]">
                    <span className="flex items-center gap-1 font-bold text-slate-200">
                      <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                      {shop.rating} ({shop.reviewCount})
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> PAN: {shop.panVatNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {shop.openingHours.split('(')[0]}
                </span>
                <span className="text-orange-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>Open Store & Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            {t.allCategories}
          </h2>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs text-orange-400 font-bold hover:underline"
            >
              Reset Category
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>All Hardware ({products.filter((p) => !p.isWholesale).length})</span>
          </button>

          {(Object.keys(categoryLabels) as HardwareCategory[]).map((catKey) => {
            const info = categoryLabels[catKey];
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {getCategoryIcon(catKey)}
                <span>{language === 'ne' ? info.ne : info.en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Catalog Grid in Bento Style */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Hardware Items ({filteredProducts.length})
            </h2>
            {selectedShopFilter !== 'all' && (
              <span className="text-xs px-2.5 py-1 bg-orange-500/10 text-orange-400 font-bold rounded-lg border border-orange-500/20 flex items-center gap-1">
                Store: {shops.find((s) => s.id === selectedShopFilter)?.name}
                <button
                  onClick={() => setSelectedShopFilter('all')}
                  className="ml-1 text-orange-400 hover:text-red-400 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 font-medium cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800">
              <input
                type="checkbox"
                checked={onlyVatExempt}
                onChange={(e) => setOnlyVatExempt(e.target.checked)}
                className="accent-orange-500 rounded"
              />
              <span>VAT Exempt Only (0%)</span>
            </label>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/80 rounded-2xl border border-slate-800">
            <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-bold text-slate-300 text-sm">No hardware items found matching your filters</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting search query or categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const shop = shops.find((s) => s.id === product.shopId) || shops[0];
              const isAdded = addedAnimationId === product.id;

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden hover:border-orange-500/50 hover:shadow-xl transition flex flex-col justify-between cursor-pointer"
                >
                  {/* Image & Badges */}
                  <div className="relative bg-slate-950 p-4 h-48 flex items-center justify-center overflow-hidden border-b border-slate-800/80">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="max-h-40 object-contain group-hover:scale-105 transition duration-200"
                      referrerPolicy="no-referrer"
                    />

                    {product.isBoosted && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-slate-950 text-[10px] font-black rounded-md flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        Boosted
                      </span>
                    )}

                    <div
                      onClick={(e) => {
                        if (onSelectShop) {
                          e.stopPropagation();
                          onSelectShop(shop);
                        }
                      }}
                      className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/90 hover:bg-orange-500 hover:text-white border border-slate-700/80 backdrop-blur-xs text-slate-200 text-[10px] rounded font-medium truncate max-w-[85%] transition cursor-pointer flex items-center gap-1"
                      title={`View ${shop.name} profile`}
                    >
                      <Store className="w-2.5 h-2.5" />
                      <span>{shop.name.split(' ')[0]} {shop.name.split(' ')[1]}</span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-bold text-orange-400 uppercase tracking-wide">{product.brand}</span>
                        {product.rating && (
                          <span className="flex items-center gap-0.5 font-bold text-slate-200">
                            <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                            {product.rating}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-xs text-white line-clamp-2 leading-snug group-hover:text-orange-400 transition">
                        {language === 'ne' ? product.nepaliName : product.name}
                      </h3>

                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-base font-black text-white">
                            {formatNPR(product.price, language)}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            per {language === 'ne' ? product.nepaliUnit : product.unit}
                          </span>
                        </div>

                        {product.isVatExempt ? (
                          <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/10 text-orange-400 font-semibold rounded border border-orange-500/20">
                            0% VAT
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 font-semibold rounded border border-emerald-500/20">
                            13% VAT Incl.
                          </span>
                        )}
                      </div>

                      {/* Quick Add Button */}
                      <button
                        id={`quick-add-${product.id}`}
                        onClick={(e) => handleQuickAdd(e, product)}
                        disabled={product.stock === 0}
                        className={`w-full mt-3 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-md shadow-orange-500/20'
                        } disabled:opacity-40`}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
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
    </div>
  );
};
