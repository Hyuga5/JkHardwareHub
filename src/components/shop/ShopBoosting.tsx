import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatNPR } from '../../utils/formatters';
import { EsewaModal, KhaltiModal } from '../common/PaymentModals';
import {
  Sparkles,
  TrendingUp,
  Eye,
  MousePointerClick,
  CheckCircle2,
  Zap,
  CreditCard,
  Target,
  BarChart3,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ShopBoosting: React.FC = () => {
  const { activeShopId, boostCampaigns, addBoostCampaign, products, shops } = useApp();
  const currentShop = shops.find((s) => s.id === activeShopId) || shops[0];
  const shopProducts = products.filter((p) => p.shopId === activeShopId && !p.isWholesale);

  const [campaignType, setCampaignType] = useState<'store' | 'product'>('store');
  const [selectedProductId, setSelectedProductId] = useState<string>(shopProducts[0]?.id || '');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [dailyBudget, setDailyBudget] = useState<number>(300);
  const [paymentGateway, setPaymentGateway] = useState<'esewa' | 'khalti'>('esewa');
  const [showEsewa, setShowEsewa] = useState(false);
  const [showKhalti, setShowKhalti] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const totalCost = durationDays * dailyBudget;

  const handleStartBoost = () => {
    if (paymentGateway === 'esewa') {
      setShowEsewa(true);
    } else {
      setShowKhalti(true);
    }
  };

  const executeCampaignCreation = () => {
    const selectedProd = products.find((p) => p.id === selectedProductId);
    const title = campaignType === 'store'
      ? `${currentShop.name} Top Spotlight (${durationDays} Days)`
      : `Boost: ${selectedProd?.name || 'Product'} (${durationDays} Days)`;

    addBoostCampaign({
      shopId: activeShopId,
      productId: campaignType === 'product' ? selectedProductId : undefined,
      title,
      type: campaignType,
      budgetNpr: totalCost,
      durationDays,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      impressions: 0,
      clicks: 0,
      conversions: 0,
    });

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}

    setSuccessMsg(`🚀 Boost Campaign "${title}" is now LIVE! Appearing top of Kathmandu searches.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-white rounded-full text-xs font-black">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Storefront & SKU Boosting Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Reach 50,000+ Nepali Builders & Contractors
          </h1>
          <p className="text-xs font-semibold text-amber-950 leading-relaxed">
            Get 4x more orders by pinning your hardware shop and high-margin products to the top of category feeds and local search results.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Campaign Creation Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          Launch New Visibility Campaign
        </h2>

        {/* Campaign Type Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCampaignType('store')}
            className={`p-4 rounded-xl border text-left transition cursor-pointer ${
              campaignType === 'store'
                ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <p className="text-xs font-bold text-slate-900">Featured Hardware Store</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Pins entire shop to "Nearby Verified Shops" homepage carousel</p>
          </button>

          <button
            type="button"
            onClick={() => setCampaignType('product')}
            className={`p-4 rounded-xl border text-left transition cursor-pointer ${
              campaignType === 'product'
                ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <p className="text-xs font-bold text-slate-900">Boost Specific Product SKU</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Top placement in category feeds (Cement, Pipes, Tools)</p>
          </button>
        </div>

        {campaignType === 'product' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Hardware SKU to Boost</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
            >
              {shopProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — Rs {p.price} ({p.brand})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value) || 7)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
            >
              <option value={3}>3 Days (Weekend Blast)</option>
              <option value={7}>7 Days (1 Full Week)</option>
              <option value={15}>15 Days (Bi-weekly)</option>
              <option value={30}>30 Days (Monthly Sponsor)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Daily Budget (NPR)</label>
            <select
              value={dailyBudget}
              onChange={(e) => setDailyBudget(parseInt(e.target.value) || 300)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
            >
              <option value={200}>NPR 200 / day (~1,500 views)</option>
              <option value={300}>NPR 300 / day (~3,000 views)</option>
              <option value={500}>NPR 500 / day (~6,500 views)</option>
              <option value={1000}>NPR 1,000 / day (~15,000 views)</option>
            </select>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Payment Wallet for Boost</label>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setPaymentGateway('esewa')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                paymentGateway === 'esewa' ? 'border-[#60bb46] bg-emerald-50' : 'border-slate-200'
              }`}
            >
              <span className="text-xs font-bold text-slate-900">eSewa Mobile Wallet</span>
              <input type="radio" checked={paymentGateway === 'esewa'} onChange={() => setPaymentGateway('esewa')} className="accent-[#60bb46]" />
            </div>

            <div
              onClick={() => setPaymentGateway('khalti')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                paymentGateway === 'khalti' ? 'border-[#5c2d91] bg-purple-50' : 'border-slate-200'
              }`}
            >
              <span className="text-xs font-bold text-slate-900">Khalti Digital Wallet</span>
              <input type="radio" checked={paymentGateway === 'khalti'} onChange={() => setPaymentGateway('khalti')} className="accent-[#5c2d91]" />
            </div>
          </div>
        </div>

        {/* Total & Action */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Total Campaign Budget:</p>
            <p className="text-xl font-black text-slate-900">{formatNPR(totalCost)}</p>
          </div>

          <button
            onClick={handleStartBoost}
            className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Pay & Activate Campaign</span>
          </button>
        </div>
      </div>

      {/* Active Boost Campaigns Analytics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-600" />
          Active Campaign Analytics & ROI
        </h2>

        <div className="space-y-3">
          {boostCampaigns.map((camp) => (
            <div key={camp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-slate-900">{camp.title}</p>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold uppercase">
                      {camp.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Budget: {formatNPR(camp.budgetNpr)} • Started: {camp.startDate}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px]">
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>Impressions</span>
                  </div>
                  <p className="font-black text-slate-900 mt-1">{camp.impressions.toLocaleString()}</p>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px]">
                    <MousePointerClick className="w-3.5 h-3.5 text-amber-500" />
                    <span>Clicks</span>
                  </div>
                  <p className="font-black text-slate-900 mt-1">{camp.clicks.toLocaleString()}</p>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px]">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Invoices</span>
                  </div>
                  <p className="font-black text-slate-900 mt-1">{camp.conversions}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modals */}
      {showEsewa && (
        <EsewaModal
          amount={totalCost}
          onSuccess={() => {
            setShowEsewa(false);
            executeCampaignCreation();
          }}
          onClose={() => setShowEsewa(false)}
        />
      )}

      {showKhalti && (
        <KhaltiModal
          amount={totalCost}
          onSuccess={() => {
            setShowKhalti(false);
            executeCampaignCreation();
          }}
          onClose={() => setShowKhalti(false)}
        />
      )}
    </div>
  );
};
