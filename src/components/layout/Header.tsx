import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { formatNPR } from '../../utils/formatters';
import {
  Store,
  Truck,
  ShieldAlert,
  ShoppingCart,
  Bell,
  Award,
  Globe,
  MapPin,
  Search,
  CheckCircle2,
  ChevronDown,
  Layers,
  Sparkles,
  HardHat,
  UserCheck,
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenLoyalty: () => void;
  onOpenOrders: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCustomerTab: 'shop' | 'orders' | 'rewards';
  setActiveCustomerTab: (tab: 'shop' | 'orders' | 'rewards') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenLoyalty,
  onOpenOrders,
  searchQuery,
  setSearchQuery,
  activeCustomerTab,
  setActiveCustomerTab,
}) => {
  const {
    role,
    setRole,
    language,
    setLanguage,
    cart,
    cartShopGroups,
    loyaltyProfile,
    notifications,
    markNotificationAsRead,
    fiscalYear,
    shops,
    activeShopId,
    setActiveShopId,
    distributors,
    activeDistributorId,
    setActiveDistributorId,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Kathmandu Valley');

  const t = translations[language];
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const currentShop = shops.find((s) => s.id === activeShopId) || shops[0];
  const currentDistributor = distributors.find((d) => d.id === activeDistributorId) || distributors[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner: Role Switcher & System Meta */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Role Switcher Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-slate-400 font-medium hidden sm:inline text-[11px] uppercase tracking-wider">
              {t.switchPortal}:
            </span>

            <button
              id="role-customer-btn"
              onClick={() => setRole('customer')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                role === 'customer'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{language === 'ne' ? 'ग्राहक बजार' : 'Customer'}</span>
            </button>

            <button
              id="role-shop-btn"
              onClick={() => setRole('shop_owner')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                role === 'shop_owner'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{language === 'ne' ? 'पसल धनी + लेखा' : 'Shop Owner (BusyWin)'}</span>
            </button>

            <button
              id="role-distributor-btn"
              onClick={() => setRole('distributor')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                role === 'distributor'
                  ? 'bg-blue-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{language === 'ne' ? 'डिस्ट्रीब्युटर B2B' : 'Distributor B2B'}</span>
            </button>

            <button
              id="role-admin-btn"
              onClick={() => setRole('admin')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                role === 'admin'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{language === 'ne' ? 'एडमिन' : 'Admin'}</span>
            </button>
          </div>

          {/* Right: Nepal Meta & Language */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Nepal Fiscal Year: <strong className="text-slate-200">{fiscalYear}</strong></span>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center bg-slate-800 rounded-md p-0.5 border border-slate-700">
              <button
                id="lang-en-btn"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  language === 'en' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                id="lang-ne-btn"
                onClick={() => setLanguage('ne')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  language === 'ne' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                नेपाली
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 font-black text-xl">
            <HardHat className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                JKHardware<span className="text-amber-600">Hub</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-900 font-bold rounded-sm border border-amber-300">
                NEPAL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none hidden sm:block">
              {role === 'customer'
                ? (language === 'ne' ? 'हार्डवेयर अनलाइन बजार' : 'Hardware Retail Marketplace')
                : role === 'shop_owner'
                ? (language === 'ne' ? `पसल: ${currentShop.name}` : `Store: ${currentShop.name}`)
                : role === 'distributor'
                ? (language === 'ne' ? `थोक डिपो: ${currentDistributor.name}` : `Distributor: ${currentDistributor.name}`)
                : 'Platform Oversight & KYC'}
            </p>
          </div>
        </div>

        {/* Center: Search & Location (For Customer Role) */}
        {role === 'customer' && (
          <div className="flex-1 max-w-xl mx-2 hidden md:flex items-center gap-2">
            {/* Location Selector */}
            <div className="relative">
              <div className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-200 transition cursor-pointer">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold pr-1"
                >
                  <option value="Kathmandu Valley">Kathmandu Valley</option>
                  <option value="Lalitpur">Lalitpur (पाटन)</option>
                  <option value="Bhaktapur">Bhaktapur (भक्तपुर)</option>
                  <option value="Pokhara">Pokhara (पोखरा)</option>
                  <option value="Butwal">Butwal (बुटवल)</option>
                  <option value="Biratnagar">Biratnagar (विराटनगर)</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="search-hardware-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Shop Switcher (For Shop Owner Role) */}
        {role === 'shop_owner' && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Active Store:</span>
            <select
              value={activeShopId}
              onChange={(e) => setActiveShopId(e.target.value)}
              className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.location.city})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Distributor Switcher (For Distributor Role) */}
        {role === 'distributor' && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Active Depot:</span>
            <select
              value={activeDistributorId}
              onChange={(e) => setActiveDistributorId(e.target.value)}
              className="px-3 py-1.5 bg-blue-50 border border-blue-300 text-blue-900 text-xs font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {distributors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.location.city})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Customer Sub-Navigation Tabs */}
          {role === 'customer' && (
            <div className="flex items-center gap-1 border-r border-slate-200 pr-3 mr-1">
              <button
                onClick={() => setActiveCustomerTab('shop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeCustomerTab === 'shop'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'ne' ? 'पसलहरू' : 'Marketplace'}
              </button>
              <button
                onClick={() => {
                  setActiveCustomerTab('orders');
                  onOpenOrders();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeCustomerTab === 'orders'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'ne' ? 'मेरा अर्डरहरू' : 'Orders'}
              </button>
              <button
                onClick={() => {
                  setActiveCustomerTab('rewards');
                  onOpenLoyalty();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  activeCustomerTab === 'rewards'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{loyaltyProfile.pointsBalance} pts</span>
              </button>
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs">Live System Notifications</span>
                  </div>
                  <span className="text-[10px] text-slate-300">Firebase FCM</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-400">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition ${
                          !n.read ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-800">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart Button (Always visible on Customer role) */}
          {role === 'customer' && (
            <button
              id="open-cart-btn"
              onClick={onOpenCart}
              className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-slate-950 text-amber-400 text-[10px] font-black rounded-full flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {cartShopGroups.length > 1
                  ? `${cartShopGroups.length} Shops`
                  : t.cart}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
