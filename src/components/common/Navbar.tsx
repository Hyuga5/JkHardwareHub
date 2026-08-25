import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { translations } from '../../utils/translations';
import {
  ShoppingCart,
  Languages,
  Store,
  Building2,
  User,
  Search,
  Receipt,
  FileSpreadsheet,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  Truck,
  Award,
  BookOpen,
  Menu,
  Settings,
} from 'lucide-react';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenSettings: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  customerTab: 'home' | 'orders' | 'loyalty';
  onSelectCustomerTab: (t: 'home' | 'orders' | 'loyalty') => void;
  shopTab: 'dashboard' | 'accounting' | 'orders' | 'catalog' | 'boosting' | 'kyc';
  onSelectShopTab: (t: 'dashboard' | 'accounting' | 'orders' | 'catalog' | 'boosting' | 'kyc') => void;
  distributorTab: 'dashboard' | 'wholesale_catalog' | 'purchase_orders' | 'retailer_ledgers';
  onSelectDistributorTab: (t: 'dashboard' | 'wholesale_catalog' | 'purchase_orders' | 'retailer_ledgers') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCart,
  onOpenSettings,
  searchQuery,
  onSearchChange,
  customerTab,
  onSelectCustomerTab,
  shopTab,
  onSelectShopTab,
  distributorTab,
  onSelectDistributorTab,
}) => {
  const {
    currentRole,
    setCurrentRole,
    language,
    toggleLanguage,
    shops,
    activeShopId,
    setActiveShopId,
    distributors,
    activeDistributorId,
    setActiveDistributorId,
    cart,
    loyaltyProfile,
  } = useApp();

  const t = translations[language];
  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md text-slate-900 shadow-xs">
      {/* Top Tier: Brand, Role Switcher, System Status, Tools */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Active Mode Indicator */}
        <div
          onClick={() => {
            if (currentRole === 'customer') {
              onSelectCustomerTab('home');
            }
          }}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 font-black text-lg group-hover:scale-105 transition">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition">
              JKHardware<span className="text-orange-500">Hub</span>
            </span>
          </div>

          {/* Active Mode Pill Indicator */}
          <div className="hidden md:flex items-center ml-2">
            {currentRole === 'customer' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200/80 rounded-full text-xs font-bold shadow-2xs">
                <User className="w-3.5 h-3.5 text-orange-600" />
                <span>Customer Marketplace</span>
              </span>
            )}
            {currentRole === 'shop_owner' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full text-xs font-bold shadow-2xs">
                <Store className="w-3.5 h-3.5 text-blue-600" />
                <span>Store Keeper Portal (POS)</span>
              </span>
            )}
            {currentRole === 'distributor' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200/80 rounded-full text-xs font-bold shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Distributor Wholesale B2B</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Tools: Live Indicator, Selectors, Language, Cart, Hamburger Settings */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* System Live Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">IRD Live</span>
          </div>

          {/* Shop Switcher when in Shop Owner mode */}
          {currentRole === 'shop_owner' && (
            <div className="flex items-center gap-1.5 bg-slate-100 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Store className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <select
                value={activeShopId}
                onChange={(e) => setActiveShopId(e.target.value)}
                className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer pr-1"
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white text-slate-900">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Distributor Switcher when in Distributor mode */}
          {currentRole === 'distributor' && (
            <div className="flex items-center gap-1.5 bg-slate-100 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <select
                value={activeDistributorId}
                onChange={(e) => setActiveDistributorId(e.target.value)}
                className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer pr-1"
              >
                {distributors.map((d) => (
                  <option key={d.id} value={d.id} className="bg-white text-slate-900">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 border border-slate-200 transition cursor-pointer shadow-2xs"
            title="Toggle Nepali / English"
          >
            <Languages className="w-3.5 h-3.5 text-orange-600" />
            <span>{language === 'ne' ? 'नेपाली' : 'EN'}</span>
          </button>

          {/* Cart Button */}
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            className="relative p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition cursor-pointer flex items-center justify-center font-bold shadow-md shadow-orange-500/20"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow-md">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* HAMBURGER MENU BUTTON (Right Beside Cart - Opens Daraz Settings Drawer) */}
          <button
            id="header-settings-hamburger-btn"
            onClick={onOpenSettings}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 rounded-xl border border-slate-200 transition cursor-pointer flex items-center justify-center shadow-2xs group"
            title="Settings & Daraz Account Menu"
            aria-label="Open Account Settings Menu"
          >
            <Menu className="w-5 h-5 text-slate-700 group-hover:text-orange-600 transition" />
          </button>
        </div>
      </div>

      {/* Sub-Navigation Bar Per Active Role in Bento Style */}
      <div className="bg-slate-50 px-4 sm:px-6 py-2 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Customer Subtabs */}
          {currentRole === 'customer' && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => onSelectCustomerTab('home')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  customerTab === 'home'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t.homeMarketplace}</span>
              </button>

              <button
                onClick={() => onSelectCustomerTab('orders')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  customerTab === 'orders'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{t.trackOrders}</span>
              </button>

              <button
                onClick={() => onSelectCustomerTab('loyalty')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  customerTab === 'loyalty'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{t.rewardsClub} ({loyaltyProfile.pointsBalance} pts)</span>
              </button>
            </div>
          )}

          {/* Shop Owner Subtabs */}
          {currentRole === 'shop_owner' && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => onSelectShopTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  shopTab === 'dashboard'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => onSelectShopTab('accounting')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  shopTab === 'accounting'
                    ? 'bg-orange-500 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>BusyWin Accounting Suite</span>
              </button>

              <button
                onClick={() => onSelectShopTab('orders')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  shopTab === 'orders'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Orders & Tax Invoices</span>
              </button>

              <button
                onClick={() => onSelectShopTab('catalog')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  shopTab === 'catalog'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Inventory & Stock</span>
              </button>

              <button
                onClick={() => onSelectShopTab('boosting')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  shopTab === 'boosting'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Boost Campaigns</span>
              </button>

              <button
                onClick={() => onSelectShopTab('kyc')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  shopTab === 'kyc'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>PAN / Trade KYC</span>
              </button>
            </div>
          )}

          {/* Distributor Subtabs */}
          {currentRole === 'distributor' && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => onSelectDistributorTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  distributorTab === 'dashboard'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Wholesale Hub</span>
              </button>

              <button
                onClick={() => onSelectDistributorTab('wholesale_catalog')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  distributorTab === 'wholesale_catalog'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Factory Catalog (MOQ)</span>
              </button>

              <button
                onClick={() => onSelectDistributorTab('purchase_orders')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  distributorTab === 'purchase_orders'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Incoming Retailer POs</span>
              </button>

              <button
                onClick={() => onSelectDistributorTab('retailer_ledgers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  distributorTab === 'retailer_ledgers'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Retailer Credit & Aging</span>
              </button>
            </div>
          )}

          {/* Search bar when browsing Marketplace */}
          {currentRole === 'customer' && customerTab === 'home' && (
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search cement, steel, pipes, Bosch..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

