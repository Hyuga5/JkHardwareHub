import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UserRole, Product, Shop } from './types';
import { Navbar } from './components/common/Navbar';
import { CustomerHome } from './components/customer/CustomerHome';
import { CustomerOrdersView } from './components/customer/CustomerOrdersView';
import { LoyaltyView } from './components/customer/LoyaltyView';
import { CartDrawer } from './components/customer/CartDrawer';
import { ProductDetailView } from './components/customer/ProductDetailView';
import { StoreDetailView } from './components/customer/StoreDetailView';
import { SettingsDrawer } from './components/common/SettingsDrawer';
import { ShopDashboard } from './components/shop/ShopDashboard';
import { ShopAccountingSuite } from './components/shop/ShopAccountingSuite';
import { ShopOrderManager } from './components/shop/ShopOrderManager';
import { ShopCatalogManager } from './components/shop/ShopCatalogManager';
import { ShopBoosting } from './components/shop/ShopBoosting';
import { ShopKYCView } from './components/shop/ShopKYCView';
import { DistributorDashboard } from './components/distributor/DistributorDashboard';
import { DistributorWholesaleCatalog } from './components/distributor/DistributorWholesaleCatalog';
import { DistributorPurchaseOrders } from './components/distributor/DistributorPurchaseOrders';
import { DistributorRetailerLedger } from './components/distributor/DistributorRetailerLedger';

function MainApp() {
  const { currentRole } = useApp();

  // Navigation Subtab State per Role
  const [customerTab, setCustomerTab] = useState<'home' | 'orders' | 'loyalty'>('home');
  const [shopTab, setShopTab] = useState<'dashboard' | 'accounting' | 'orders' | 'catalog' | 'boosting' | 'kyc'>('dashboard');
  const [distributorTab, setDistributorTab] = useState<'dashboard' | 'wholesale_catalog' | 'purchase_orders' | 'retailer_ledgers'>('dashboard');

  // Search and Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [originShop, setOriginShop] = useState<Shop | null>(null);
  const [lastPlacedOrderIds, setLastPlacedOrderIds] = useState<string[]>([]);

  const handleSelectCustomerTab = (tab: 'home' | 'orders' | 'loyalty') => {
    setSelectedProduct(null);
    setSelectedShop(null);
    setOriginShop(null);
    setCustomerTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Universal Navbar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        customerTab={customerTab}
        onSelectCustomerTab={handleSelectCustomerTab}
        shopTab={shopTab}
        onSelectShopTab={setShopTab}
        distributorTab={distributorTab}
        onSelectDistributorTab={setDistributorTab}
      />

      {/* Main Role Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {/* ================= CUSTOMER PORTAL ================= */}
        {currentRole === 'customer' && (
          <>
            {selectedProduct ? (
              <ProductDetailView
                product={selectedProduct}
                originShop={originShop}
                onBack={() => {
                  if (originShop) {
                    setSelectedShop(originShop);
                    setSelectedProduct(null);
                    setOriginShop(null);
                  } else {
                    setSelectedProduct(null);
                  }
                }}
                onOpenCart={() => setIsCartOpen(true)}
                onSelectProduct={(prod) => {
                  setSelectedProduct(prod);
                }}
                onOpenStore={(shop) => {
                  setSelectedProduct(null);
                  setOriginShop(null);
                  setSelectedShop(shop);
                }}
              />
            ) : selectedShop ? (
              <StoreDetailView
                shop={selectedShop}
                onBack={() => setSelectedShop(null)}
                onSelectProduct={(prod) => {
                  setOriginShop(selectedShop);
                  setSelectedShop(null);
                  setSelectedProduct(prod);
                }}
                onOpenCart={() => setIsCartOpen(true)}
              />
            ) : (
              <>
                {customerTab === 'home' && (
                  <CustomerHome
                    onSelectProduct={(prod) => {
                      setOriginShop(null);
                      setSelectedProduct(prod);
                    }}
                    onSelectShop={(shop) => {
                      setSelectedShop(shop);
                    }}
                    searchQuery={searchQuery}
                    onOpenCart={() => setIsCartOpen(true)}
                  />
                )}
                {customerTab === 'orders' && <CustomerOrdersView />}
                {customerTab === 'loyalty' && <LoyaltyView />}
              </>
            )}
          </>
        )}

        {/* ================= SHOP OWNER PORTAL ================= */}
        {currentRole === 'shop_owner' && (
          <>
            {shopTab === 'dashboard' && <ShopDashboard onNavigate={setShopTab} />}
            {shopTab === 'accounting' && <ShopAccountingSuite />}
            {shopTab === 'orders' && <ShopOrderManager />}
            {shopTab === 'catalog' && <ShopCatalogManager />}
            {shopTab === 'boosting' && <ShopBoosting />}
            {shopTab === 'kyc' && <ShopKYCView />}
          </>
        )}

        {/* ================= DISTRIBUTOR PORTAL ================= */}
        {currentRole === 'distributor' && (
          <>
            {distributorTab === 'dashboard' && <DistributorDashboard onNavigate={setDistributorTab} />}
            {distributorTab === 'wholesale_catalog' && <DistributorWholesaleCatalog />}
            {distributorTab === 'purchase_orders' && <DistributorPurchaseOrders />}
            {distributorTab === 'retailer_ledgers' && <DistributorRetailerLedger />}
          </>
        )}
      </main>

      {/* Cart Drawer with Auto-Shop Splitting & Dynamic QR */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={(orderIds) => {
          setLastPlacedOrderIds(orderIds);
          setSelectedProduct(null);
          setSelectedShop(null);
          setCustomerTab('orders');
        }}
      />

      {/* Settings & Daraz Profile Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onNavigateToOrders={() => {
          setSelectedProduct(null);
          setSelectedShop(null);
          setCustomerTab('orders');
        }}
        onNavigateToLoyalty={() => {
          setSelectedProduct(null);
          setSelectedShop(null);
          setCustomerTab('loyalty');
        }}
      />

      {/* Bottom Sticky Status / Compliance Indicator in Bento Style */}
      <footer className="bg-white text-slate-600 text-[11px] py-4 border-t border-slate-200 mt-auto shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-700 font-bold tracking-wider uppercase">System Live</span>
            </div>
            <span className="text-slate-900 font-bold">JKHardware<span className="text-orange-500">Hub</span></span>
            <span className="text-slate-500 hidden sm:inline">• Inland Revenue Department (IRD) 13% Tax & BusyWin Architecture</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Kathmandu • Lalitpur • Pokhara • Birgunj</span>
            <span className="text-orange-600 font-mono font-bold bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">BS 2081/82</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

