import React, { useState } from 'react';
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
  Users,
  Boxes,
  Calculator,
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
  distributorTab:
    | 'dashboard'
    | 'dealers'
    | 'orders'
    | 'stock'
    | 'accounting'
    | 'wholesale_catalog'
    | 'purchase_orders'
    | 'retailer_ledgers';
  onSelectDistributorTab: (
    t:
      | 'dashboard'
      | 'dealers'
      | 'orders'
      | 'stock'
      | 'accounting'
      | 'wholesale_catalog'
      | 'purchase_orders'
      | 'retailer_ledgers'
  ) => void;
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
  } = useApp();

  const t = translations[language];
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo with Nepal Hardware Identity */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => {
                if (currentRole === 'customer') onSelectCustomerTab('home');
                else if (currentRole === 'shop_owner') onSelectShopTab('dashboard');
                else onSelectDistributorTab('dashboard');
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900">
                    JKHardware<span className="text-orange-500">Hub</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded font-bold uppercase tracking-wider">
                    नेपाल
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-none">
                  {currentRole === 'distributor'
                    ? 'B2B Wholesale & Supply ERP'
                    : currentRole === 'shop_owner'
                    ? 'Shop POS & IRD Accounting Suite'
                    : 'Wholesale & Retail Hardware Marketplace'}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Context Entity Switcher (Shop / Distributor Selectors) */}
          <div className="hidden md:flex items-center gap-2">
            {currentRole === 'shop_owner' && (
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <Store className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-500 font-medium">Active Store:</span>
                <select
                  value={activeShopId}
                  onChange={(e) => setActiveShopId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location?.city || 'Kathmandu'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentRole === 'distributor' && (
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs text-slate-500 font-medium">Active Distributor:</span>
                <select
                  value={activeDistributorId}
                  onChange={(e) => setActiveDistributorId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[240px] truncate"
                >
                  {distributors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right Action Icons & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Toggle English / नेपाली"
            >
              <Languages className="w-3.5 h-3.5 text-orange-500" />
              <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
            </button>

            {/* Role Switcher Pill Bar */}
            <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center gap-0.5">
              <button
                onClick={() => setCurrentRole('customer')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  currentRole === 'customer'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Buyer</span>
              </button>

              <button
                onClick={() => setCurrentRole('shop_owner')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  currentRole === 'shop_owner'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Shop POS</span>
              </button>

              <button
                onClick={() => setCurrentRole('distributor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  currentRole === 'distributor'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Distributor</span>
              </button>
            </div>

            {/* Cart Button (Buyer mode) */}
            {currentRole === 'customer' && (
              <button
                onClick={onOpenCart}
                className="relative p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-xs transition cursor-pointer"
                title="Open Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile / Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              title="Settings & Profile"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar per Role */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 py-2">
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
                <span>Marketplace</span>
              </button>

              <button
                onClick={() => onSelectCustomerTab('orders')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  customerTab === 'orders'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>My Orders & Invoices</span>
              </button>

              <button
                onClick={() => onSelectCustomerTab('loyalty')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  customerTab === 'loyalty'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Loyalty Points</span>
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
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>BusyWin Accounting & POS</span>
              </button>

              <button
                onClick={() => onSelectShopTab('orders')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  shopTab === 'orders'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Customer Orders</span>
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
                <span>Products & Stock</span>
              </button>

              <button
                onClick={() => onSelectShopTab('boosting')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  shopTab === 'boosting'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Daraz Boosting</span>
              </button>

              <button
                onClick={() => onSelectShopTab('kyc')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  shopTab === 'kyc'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>PAN / KYC Verification</span>
              </button>
            </div>
          )}

          {/* Distributor Subtabs: Clean, comprehensive B2B tabs */}
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
                onClick={() => onSelectDistributorTab('dealers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  distributorTab === 'dealers'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Dealer Lists (डिलर सूची)</span>
              </button>

              <button
                onClick={() => onSelectDistributorTab('orders')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  distributorTab === 'orders' || distributorTab === 'purchase_orders'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Order Lists & Location</span>
              </button>

              <button
                onClick={() => onSelectDistributorTab('stock')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  distributorTab === 'stock' || distributorTab === 'wholesale_catalog'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Current Available Stocks</span>
              </button>

              <button
                onClick={() => onSelectDistributorTab('accounting')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  distributorTab === 'accounting' || distributorTab === 'retailer_ledgers'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Distributor Accounting ERP</span>
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
                placeholder="Search products, brands, shops..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
