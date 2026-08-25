import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNPR } from '../../utils/formatters';
import { translations } from '../../utils/translations';
import {
  X,
  User,
  Settings,
  CreditCard,
  MapPin,
  ShieldCheck,
  Bell,
  Languages,
  LogOut,
  LogIn,
  Store,
  Building2,
  Receipt,
  Truck,
  Heart,
  Tag,
  HelpCircle,
  PhoneCall,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Edit3,
  Lock,
  Moon,
  Sun,
  Award,
  FileText,
  Clock,
  Smartphone,
  ExternalLink,
  Shield,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToLoyalty?: () => void;
  onNavigateTab?: (role: 'customer' | 'shop_owner' | 'distributor', tab?: string) => void;
  onOpenCart?: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToOrders,
  onNavigateToLoyalty,
  onNavigateTab,
  onOpenCart,
}) => {
  const {
    currentRole,
    setCurrentRole,
    language,
    toggleLanguage,
    loyaltyProfile,
    orders,
    cart,
    shops,
    activeShopId,
    setActiveShopId,
    distributors,
    activeDistributorId,
    setActiveDistributorId,
  } = useApp();

  const t = translations[language];

  // User Profile State (Simulating Multi-Role Accounts)
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [selectedLoginRole, setSelectedLoginRole] = useState<'customer' | 'shop_owner' | 'distributor'>('customer');
  
  const [profile, setProfile] = useState({
    name: 'Jenish Magar',
    phone: '+977 9841234567',
    email: 'jenishmagar276@gmail.com',
    panNumber: '601994821',
    address: 'Baneshwor Height, Ward 10, Kathmandu',
    landmark: 'Near Civil Hospital',
    city: 'Kathmandu',
    tier: 'Gold Hardware Member',
  });

  // Modal Sub-views inside settings
  const [activeModal, setActiveModal] = useState<
    'none' | 'edit_profile' | 'addresses' | 'payment_methods' | 'security' | 'vouchers' | 'support' | 'login' | 'switch_portal'
  >('none');

  // Form states
  const [editName, setEditName] = useState(profile.name);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editAddress, setEditAddress] = useState(profile.address);
  const [editPan, setEditPan] = useState(profile.panNumber);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Login form state (when logged out)
  const [loginPhone, setLoginPhone] = useState('9841234567');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Address book list
  const [addresses, setAddresses] = useState([
    {
      id: 'addr_1',
      title: 'Home (Default)',
      recipient: 'Jenish Magar',
      phone: '+977 9841234567',
      address: 'Baneshwor Height, Ward 10, Kathmandu',
      landmark: 'Near Civil Hospital',
      isDefault: true,
    },
    {
      id: 'addr_2',
      title: 'Construction Site / Project Depot',
      recipient: 'Site Engineer Bikash',
      phone: '+977 9851098765',
      address: 'Sanepa, Ring Road, Lalitpur',
      landmark: 'Opposite Star Hospital',
      isDefault: false,
    },
  ]);

  // Saved Payment Methods
  const [paymentMethods] = useState([
    { id: 'esewa', name: 'eSewa ID (Primary)', identifier: '9841234567', provider: 'esewa', isDefault: true },
    { id: 'khalti', name: 'Khalti Digital Wallet', identifier: '9841234567', provider: 'khalti', isDefault: false },
    { id: 'card', name: 'Nabil Bank SCT Debit Card', identifier: '**** **** **** 4891', provider: 'bank', isDefault: false },
  ]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      ...profile,
      name: editName,
      phone: editPhone,
      email: editEmail,
      address: editAddress,
      panNumber: editPan,
    });
    setSavedSuccessMsg('Profile information updated successfully!');
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch {}
    setTimeout(() => {
      setSavedSuccessMsg('');
      setActiveModal('none');
    }, 1200);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveModal('none');
  };

  const handleLoginAsRole = (role: 'customer' | 'shop_owner' | 'distributor') => {
    setCurrentRole(role);
    setIsLoggedIn(true);
    setOtpSent(false);
    setActiveModal('none');

    // Update profile based on role for realistic demonstration
    if (role === 'customer') {
      setProfile({
        name: 'Jenish Magar',
        phone: '+977 9841234567',
        email: 'jenishmagar276@gmail.com',
        panNumber: '601994821',
        address: 'Baneshwor Height, Ward 10, Kathmandu',
        landmark: 'Near Civil Hospital',
        city: 'Kathmandu',
        tier: 'Gold Hardware Member',
      });
    } else if (role === 'shop_owner') {
      setProfile({
        name: 'Ram Krishna Shrestha',
        phone: '+977 9851012345',
        email: 'kathmanduhardware@gmail.com',
        panNumber: '601245890',
        address: 'Teku Road, Ward 12, Kathmandu',
        landmark: 'Near Inland Revenue Tax Office',
        city: 'Kathmandu',
        tier: 'Verified Shop Owner (POS Manager)',
      });
      if (shops.length > 0) {
        setActiveShopId(shops[0].id);
      }
    } else if (role === 'distributor') {
      setProfile({
        name: 'Bikram Karki',
        phone: '+977 9801234567',
        email: 'orders@jagdambadepot.com.np',
        panNumber: '300456123',
        address: 'Balkhu Ring Road Wholesale Depot, Kathmandu',
        landmark: 'Heavy Yard Gate 3',
        city: 'Kathmandu',
        tier: 'National Tier-1 Distributor',
      });
      if (distributors.length > 0) {
        setActiveDistributorId(distributors[0].id);
      }
    }

    try {
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.6 } });
    } catch {}

    if (onNavigateTab) {
      onNavigateTab(role);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setOtpSent(true);
      return;
    }
    handleLoginAsRole(selectedLoginRole);
  };

  const handleRoleSwitch = (role: 'customer' | 'shop_owner' | 'distributor') => {
    handleLoginAsRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Drawer Header with Daraz Orange Gradient */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-5 py-4.5 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white shadow-xs">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base tracking-tight text-white">
                  Account & Settings
                </h2>
                <p className="text-[11px] text-orange-100 font-medium">
                  JKHardwareHub • Daraz Nepal Hub
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">
            {/* 1. USER PROFILE CARD (Daraz Style) */}
            {isLoggedIn ? (
              <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs relative overflow-hidden">
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-orange-500/20">
                      {profile.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {profile.name}
                      </h3>
                      <button
                        onClick={() => setActiveModal('edit_profile')}
                        className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {profile.phone}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {profile.email}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3 text-orange-500" />
                        {profile.tier}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        PAN: {profile.panNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Loyalty / Wallet Quick Bar */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                  <div
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab('customer', 'loyalty');
                      onClose();
                    }}
                    className="p-2 bg-slate-50 hover:bg-orange-50/60 rounded-xl cursor-pointer transition border border-slate-100"
                  >
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Hardware Coins
                    </p>
                    <p className="text-sm font-black text-orange-600">
                      {loyaltyProfile.pointsBalance} pts
                    </p>
                  </div>
                  <div
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab('customer', 'orders');
                      onClose();
                    }}
                    className="p-2 bg-slate-50 hover:bg-orange-50/60 rounded-xl cursor-pointer transition border border-slate-100"
                  >
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      My Invoices
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {orders.length} IRD Bills
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">You are currently Logged Out</h3>
                  <p className="text-xs text-slate-500">
                    Select an account type to log in or switch portal:
                  </p>
                </div>

                {/* Direct Role Login Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleLoginAsRole('customer')}
                    className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100/80 text-left flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-orange-700">
                          Log in as Customer
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Retail buyer • Daraz points & loyalty
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition" />
                  </button>

                  <button
                    onClick={() => handleLoginAsRole('shop_owner')}
                    className="w-full p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-left flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                          Log in as Store Keeper (Shop Owner)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          POS billing • 13% IRD VAT & BusyWin
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition" />
                  </button>

                  <button
                    onClick={() => handleLoginAsRole('distributor')}
                    className="w-full p-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-left flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                          Log in as Factory Distributor
                        </p>
                        <p className="text-[11px] text-slate-500">
                          B2B wholesale • Purchase orders & credit
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setActiveModal('login')}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1 mx-auto"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Custom Mobile Number / OTP Login</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. DARAZ ORDER TRACKING HUB (To Pay, To Ship, To Receive, To Review) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    My Orders
                  </h3>
                </div>
                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('customer', 'orders');
                    onClose();
                  }}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>View All ({orders.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1 pt-1 text-center">
                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('customer', 'orders');
                    onClose();
                  }}
                  className="p-2 hover:bg-slate-50 rounded-xl transition cursor-pointer flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700">To Pay</span>
                  <span className="text-[9px] text-slate-400 font-bold">1 order</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('customer', 'orders');
                    onClose();
                  }}
                  className="p-2 hover:bg-slate-50 rounded-xl transition cursor-pointer flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700">To Ship</span>
                  <span className="text-[9px] text-slate-400 font-bold">2 orders</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('customer', 'orders');
                    onClose();
                  }}
                  className="p-2 hover:bg-slate-50 rounded-xl transition cursor-pointer flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700">To Receive</span>
                  <span className="text-[9px] text-slate-400 font-bold">1 active</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('customer', 'orders');
                    onClose();
                  }}
                  className="p-2 hover:bg-slate-50 rounded-xl transition cursor-pointer flex flex-col items-center"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700">Returns</span>
                  <span className="text-[9px] text-slate-400 font-bold">0 refund</span>
                </button>
              </div>
            </div>

            {/* 3. MY ACCOUNT MANAGEMENT (Addresses, Payment Methods, Security) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
              <div className="px-4 py-2.5 bg-slate-50/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Account Management
                </span>
              </div>

              <button
                onClick={() => setActiveModal('edit_profile')}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Profile & Tax Identification</p>
                    <p className="text-[10px] text-slate-400">Name, phone, email & Buyer PAN</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveModal('addresses')}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Delivery Address Book</p>
                    <p className="text-[10px] text-slate-400">Kathmandu, Lalitpur, Pokhara Sites</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveModal('payment_methods')}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Saved Payment Methods</p>
                    <p className="text-[10px] text-slate-400">eSewa, Khalti, SCT & FonePay</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveModal('security')}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Account Security & OTP</p>
                    <p className="text-[10px] text-slate-400">2-Factor Authentication & Passwords</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* 4. SERVICES & TOOLS (Vouchers, Loyalty Club, Tax Invoices) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
              <div className="px-4 py-2.5 bg-slate-50/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Services & Rewards
                </span>
              </div>

              <button
                onClick={() => {
                  if (onNavigateTab) onNavigateTab('customer', 'loyalty');
                  onClose();
                }}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Daraz Club & Loyalty Rewards</p>
                    <p className="text-[10px] text-slate-400">{loyaltyProfile.pointsBalance} Points Available</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveModal('vouchers')}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Vouchers & Promo Discounts</p>
                    <p className="text-[10px] text-slate-400">3 active store coupons available</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveModal('support')}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">24/7 Daraz Support & Helpline</p>
                    <p className="text-[10px] text-slate-400">Live Chat • 01-5970000</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* 5. SWITCH PORTAL ROLES */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Portal Role
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRoleSwitch('customer')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center ${
                    currentRole === 'customer'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold ring-1 ring-orange-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  <User className="w-4 h-4 mb-1" />
                  <span className="text-[11px]">Customer</span>
                </button>

                <button
                  onClick={() => handleRoleSwitch('shop_owner')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center ${
                    currentRole === 'shop_owner'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold ring-1 ring-orange-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  <Store className="w-4 h-4 mb-1" />
                  <span className="text-[11px]">Shop POS</span>
                </button>

                <button
                  onClick={() => handleRoleSwitch('distributor')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center ${
                    currentRole === 'distributor'
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold ring-1 ring-orange-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1" />
                  <span className="text-[11px]">Distributor</span>
                </button>
              </div>
            </div>

            {/* 6. APP PREFERENCES (Language, Fiscal Year, Notifications) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                App Preferences
              </span>

              <div className="flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-slate-400" />
                  <span>Language / भाषा</span>
                </div>
                <button
                  onClick={toggleLanguage}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg border border-slate-200 text-slate-800 transition cursor-pointer text-xs"
                >
                  {language === 'ne' ? 'नेपाली (Switch to EN)' : 'English (Switch to ने)'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-400" />
                  <span>Nepal Fiscal Year</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded text-xs">
                  BS 2081/82 (IRD)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span>Order Push Alerts</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600">Enabled ✓</span>
              </div>
            </div>

            {/* 7. AUTH LOGOUT / LOGIN ACTION BUTTON */}
            {isLoggedIn ? (
              <button
                id="drawer-logout-btn"
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl border border-red-200 text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveModal('login')}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-md text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>
            )}

            {/* Compliance Footer */}
            <div className="text-center text-[11px] text-slate-400 pt-2 pb-6 space-y-1">
              <p>JKHardwareHub Version 2.4.0 (Nepal Release)</p>
              <p>© 2026 Inland Revenue Dept Compliance • BusyWin Integration</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL SUB-VIEWS ================= */}

      {/* A. EDIT PROFILE MODAL */}
      {activeModal === 'edit_profile' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-base text-slate-900">Edit Profile & PAN</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name / Contact Person
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (Nepal +977)
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Buyer PAN / VAT Number (For Invoicing)
                </label>
                <input
                  type="text"
                  value={editPan}
                  onChange={(e) => setEditPan(e.target.value)}
                  placeholder="Optional 9-digit PAN"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Delivery Location
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                  required
                />
              </div>

              {savedSuccessMsg && (
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {savedSuccessMsg}
                </p>
              )}

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-orange-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. ADDRESS BOOK MODAL */}
      {activeModal === 'addresses' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Delivery Address Book</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-3.5 rounded-2xl border ${
                    addr.isDefault
                      ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{addr.title}</span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{addr.recipient} • {addr.phone}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{addr.address}</p>
                  <p className="text-[11px] text-slate-400">Landmark: {addr.landmark}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                alert('Add New Address pin selector opened.');
              }}
              className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>+ Add New Site / Home Address</span>
            </button>
          </div>
        </div>
      )}

      {/* C. PAYMENT METHODS MODAL */}
      {activeModal === 'payment_methods' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Saved Wallets & Cards</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs ${
                        pm.provider === 'esewa'
                          ? 'bg-[#60bb46]'
                          : pm.provider === 'khalti'
                          ? 'bg-[#5c2d91]'
                          : 'bg-blue-600'
                      }`}
                    >
                      {pm.provider === 'esewa' ? 'e' : pm.provider === 'khalti' ? 'K' : '💳'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{pm.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{pm.identifier}</p>
                    </div>
                  </div>
                  {pm.isDefault ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                      Primary
                    </span>
                  ) : (
                    <button className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer">
                      Make Primary
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('Connect new Nepal Payment wallet / card modal')}
              className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>+ Link New eSewa, Khalti, or Bank Account</span>
            </button>
          </div>
        </div>
      )}

      {/* D. VOUCHERS MODAL */}
      {activeModal === 'vouchers' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-base text-slate-900">Daraz Hardware Vouchers</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="font-black text-rose-700 text-xs">NEPALBUILD500</span>
                  <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                    Rs. 500 OFF
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Valid on orders above NPR 10,000 across all verified hardware shops.
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Expires: End of Bhadra 2081</p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-700 text-xs">FREESHIPKTM</span>
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                    Free Delivery
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Free site drop inside Ring Road Kathmandu on CPVC & paint supplies.
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Applicable on cart checkout</p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="w-full mt-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* E. 24/7 DARAZ SUPPORT MODAL */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-base text-slate-900">Daraz Support & Helpline</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">National Helpline Hotline</p>
                  <p className="text-slate-500 text-[11px]">Mon - Sun: 7:00 AM - 9:00 PM</p>
                </div>
                <a
                  href="tel:015970000"
                  className="px-3 py-1.5 bg-orange-500 text-white font-bold rounded-xl shadow-xs hover:bg-orange-600 cursor-pointer text-xs"
                >
                  01-5970000
                </a>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Hardware Expert Live Chat</p>
                  <p className="text-slate-500 text-[11px]">Instant engineering & site queries</p>
                </div>
                <button
                  onClick={() => alert('Starting live chat session with Daraz Hardware Support...')}
                  className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 cursor-pointer text-xs"
                >
                  Chat Now
                </button>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-800">
                <span className="font-bold">100% Tax & Quality Guarantee:</span> All products sold come with valid IRD Tax Invoices and manufacturer warranties.
              </div>
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* F. LOGIN MODAL (When Logged Out) */}
      {activeModal === 'login' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-base text-slate-900">
                  {otpSent ? 'Enter 6-Digit OTP' : 'Login / Register with Mobile'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              {!otpSent ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nepali Mobile Number (+977)
                  </label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700">
                      +977
                    </span>
                    <input
                      type="tel"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    We will send a 6-digit verification code via SMS.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SMS OTP Code sent to +977 {loginPhone}
                  </label>
                  <input
                    type="text"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                    placeholder="Enter 123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-black tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                    maxLength={6}
                    required
                  />
                  <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
                    Test OTP: Enter any 6 digits (e.g. 123456)
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-orange-500/20"
              >
                {!otpSent ? 'Send Verification OTP' : 'Verify & Continue'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* G. SECURITY MODAL */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900">Account Security</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Two-Factor OTP Verification</p>
                  <p className="text-slate-500 text-[11px]">Enabled via Nepal SMS gateway</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                  Active
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Payment MPIN Protection</p>
                  <p className="text-slate-500 text-[11px]">Required for wallet transactions</p>
                </div>
                <button
                  onClick={() => alert('Change MPIN prompt')}
                  className="text-orange-600 font-bold text-xs hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
