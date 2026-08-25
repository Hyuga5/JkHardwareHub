import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { loyaltyRewards } from '../../data/mockData';
import { formatNPR } from '../../utils/formatters';
import { translations } from '../../utils/translations';
import {
  Sparkles,
  Award,
  Gift,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Search,
  Filter,
  Copy,
  Check,
  Lock,
  Tag,
  ShoppingBag,
  Coins,
  Star,
  Crown,
  ChevronRight,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TierInfo {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  minPoints: number;
  maxPoints: number;
  multiplier: string;
  perks: string[];
  color: string;
  accent: string;
  icon: React.ReactNode;
}

const TIERS: TierInfo[] = [
  {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 199,
    multiplier: '1.0x',
    perks: [
      '1 Pt per Rs. 100 spent on all hardware',
      'Standard e-Invoice generated with IRD PAN',
      'Access to seasonal promo vouchers',
    ],
    color: 'from-amber-900/90 to-slate-900',
    accent: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    icon: <Award className="w-4 h-4 text-amber-400" />,
  },
  {
    name: 'Silver',
    minPoints: 200,
    maxPoints: 499,
    multiplier: '1.25x',
    perks: [
      '1.25x Points Booster on tools & sanitation',
      '5% Site Freight Subsidy on heavy cement loads',
      'Verified Builder Badge on product reviews',
      'Priority customer support via Daraz helpline',
    ],
    color: 'from-slate-800 to-slate-950',
    accent: 'text-slate-200 border-slate-400/40 bg-slate-400/10',
    icon: <Star className="w-4 h-4 text-slate-300" />,
  },
  {
    name: 'Gold',
    minPoints: 500,
    maxPoints: 999,
    multiplier: '1.5x',
    perks: [
      '1.5x Points Booster across all categories',
      'Free Heavy Site Drop inside Kathmandu Ring Road',
      'Fast-track 2-hour warehouse packing priority',
      'Exclusive invite to contractor wholesale bulk deals',
    ],
    color: 'from-amber-700 via-amber-800 to-amber-950',
    accent: 'text-amber-300 border-amber-400/50 bg-amber-400/15',
    icon: <Crown className="w-4 h-4 text-amber-300" />,
  },
  {
    name: 'Platinum',
    minPoints: 1000,
    maxPoints: Infinity,
    multiplier: '2.0x',
    perks: [
      '2.0x Double Points Booster on every rupee',
      'Dedicated Wholesale Relationship Manager',
      '0% Surcharge on 30-Day Trade Credit terms',
      'Annual Nepali New Year Hardware Gift Hamper',
    ],
    color: 'from-slate-900 via-indigo-950 to-slate-950',
    accent: 'text-indigo-300 border-indigo-400/50 bg-indigo-400/15',
    icon: <Crown className="w-4 h-4 text-indigo-300" />,
  },
];

export const LoyaltyView: React.FC = () => {
  const { loyaltyProfile, redeemLoyaltyReward, language, orders } = useApp();
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedVoucherId, setCopiedVoucherId] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<'all' | 'earned' | 'redeemed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierDetail, setSelectedTierDetail] = useState<'Bronze' | 'Silver' | 'Gold' | 'Platinum'>(
    loyaltyProfile.tier
  );

  const t = translations[language];

  // Dynamic Tier Calculation
  const currentTierIndex = TIERS.findIndex((t) => t.name === loyaltyProfile.tier);
  const currentTierData = TIERS[currentTierIndex] || TIERS[0];
  const nextTierData = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;

  const pointsNeeded = nextTierData
    ? Math.max(0, nextTierData.minPoints - loyaltyProfile.pointsBalance)
    : 0;

  const spendingNeededNpr = pointsNeeded * 100; // 1 pt = Rs. 100

  // Calculate percentage within current tier bracket
  const progressPercent = useMemo(() => {
    if (!nextTierData) return 100;
    const tierSpan = nextTierData.minPoints - currentTierData.minPoints;
    const currentPointsInTier = loyaltyProfile.pointsBalance - currentTierData.minPoints;
    const pct = (currentPointsInTier / tierSpan) * 100;
    return Math.min(100, Math.max(5, Math.round(pct)));
  }, [loyaltyProfile.pointsBalance, currentTierData, nextTierData]);

  const handleRedeem = (rewardId: string, title: string) => {
    const ok = redeemLoyaltyReward(rewardId);
    if (ok) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      setSuccessMessage(`Successfully redeemed: ${title}! Voucher code is ready below.`);
      setTimeout(() => setSuccessMessage(''), 4500);
    } else {
      alert('Insufficient points to redeem this reward.');
    }
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucherId(id);
    setTimeout(() => setCopiedVoucherId(null), 2000);
  };

  // Filtered Activity List
  const filteredHistory = useMemo(() => {
    return loyaltyProfile.history.filter((item) => {
      const matchesType =
        activityFilter === 'all'
          ? true
          : activityFilter === 'earned'
          ? item.type === 'earned'
          : item.type === 'redeemed';

      const matchesSearch =
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.date.includes(searchQuery);

      return matchesType && matchesSearch;
    });
  }, [loyaltyProfile.history, activityFilter, searchQuery]);

  return (
    <div className="space-y-7 pb-16 max-w-5xl mx-auto">
      {/* ================= 1. HERO TIER & BALANCE DASHBOARD ================= */}
      <div className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${currentTierData.color} border border-slate-800 shadow-2xl text-white relative overflow-hidden`}>
        {/* Subtle Decorative Background Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: User Tier Status & Points Balance */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold border border-white/15 shadow-2xs">
              <span className="p-1 rounded-full bg-amber-400 text-slate-950">
                {currentTierData.icon}
              </span>
              <span className="tracking-wide">JK Hardware Club • {loyaltyProfile.tier} Tier</span>
              <span className="px-1.5 py-0.5 bg-amber-400/20 text-amber-300 rounded text-[10px] font-extrabold uppercase">
                {currentTierData.multiplier} Booster
              </span>
            </div>

            <div className="pt-1">
              <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                Available Reward Points Balance
              </p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  {loyaltyProfile.pointsBalance.toLocaleString()}
                </span>
                <span className="text-sm sm:text-base font-semibold text-amber-300">
                  Pts (≈ Rs. {(loyaltyProfile.pointsBalance * 1.5).toLocaleString()} Voucher Value)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Earn 1 point per NPR 100 spent on any verified hardware dealer across Nepal. Points never expire as long as your account remains active.
            </p>
          </div>

          {/* Right: Lifetime Summary Bento Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:min-w-72 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-inner">
            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Lifetime Earned
              </p>
              <p className="text-lg font-black text-amber-400 mt-0.5">
                +{loyaltyProfile.totalEarned} pts
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">From {orders.length} Verified Bills</p>
            </div>

            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Redeemed
              </p>
              <p className="text-lg font-black text-slate-200 mt-0.5">
                -{loyaltyProfile.totalRedeemed} pts
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Discounts Claimed</p>
            </div>
          </div>
        </div>

        {/* ================= 2. VISUAL TIER PROGRESS TRACKER ================= */}
        <div className="mt-8 pt-6 border-t border-white/15 relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Tier Progress Tracker: <span className="text-amber-400 font-extrabold">{loyaltyProfile.tier}</span>
                {nextTierData ? ` → ${nextTierData.name}` : ' (Maximum Tier Reached)'}
              </span>
            </div>

            {nextTierData ? (
              <div className="text-xs text-amber-300 font-bold bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
                Need <span className="text-white font-extrabold underline">{pointsNeeded} more points</span> to unlock {nextTierData.name}
              </div>
            ) : (
              <div className="text-xs text-emerald-300 font-bold bg-emerald-400/10 px-3 py-1 rounded-xl border border-emerald-400/20">
                🌟 Top VIP Platinum Tier Unlocked!
              </div>
            )}
          </div>

          {/* Stepped Progress Bar */}
          <div className="relative pt-2 pb-1">
            {/* Background Track */}
            <div className="w-full h-3 bg-slate-950/80 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 rounded-full transition-all duration-700 shadow-md"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Stepped Milestone Checkpoints */}
            <div className="grid grid-cols-4 mt-3 gap-1 text-center">
              {TIERS.map((tier, idx) => {
                const isPassed = loyaltyProfile.pointsBalance >= tier.minPoints;
                const isCurrent = loyaltyProfile.tier === tier.name;

                return (
                  <div
                    key={tier.name}
                    onClick={() => setSelectedTierDetail(tier.name)}
                    className={`flex flex-col items-center cursor-pointer transition p-1.5 rounded-xl ${
                      isCurrent
                        ? 'bg-white/15 ring-1 ring-amber-400'
                        : 'hover:bg-white/5 opacity-85'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1 border ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 border-white shadow-md'
                          : isPassed
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span className="text-[11px] font-bold text-white flex items-center gap-0.5">
                      {tier.name}
                    </span>
                    <span className="text-[9px] text-slate-300 font-mono">
                      {tier.minPoints === 0 ? '0 pts' : `${tier.minPoints}+ pts`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points Needed Spending Helper Callout */}
          {nextTierData && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">
                    Unlock {nextTierData.name} Tier Perks
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Earn <span className="text-amber-300 font-bold">{pointsNeeded} pts</span> by placing hardware purchases of approx. <span className="text-amber-300 font-bold">{formatNPR(spendingNeededNpr)}</span>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTierDetail(nextTierData.name)}
                className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-xs transition cursor-pointer self-start sm:self-auto shrink-0 flex items-center gap-1"
              >
                <span>View {nextTierData.name} Perks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-3 text-xs font-bold shadow-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ================= 3. TIER BENEFITS COMPARISON MODAL/VIEW ================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Membership Tier Benefits & Multipliers</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click on any tier below to preview unlocked contractor and builder benefits.
            </p>
          </div>

          {/* Tier Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {TIERS.map((tier) => (
              <button
                key={tier.name}
                onClick={() => setSelectedTierDetail(tier.name)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedTierDetail === tier.name
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tier.name}</span>
                {loyaltyProfile.tier === tier.name && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Tier Detail Card */}
        {(() => {
          const detail = TIERS.find((t) => t.name === selectedTierDetail) || TIERS[0];
          const isUserCurrent = loyaltyProfile.tier === detail.name;

          return (
            <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-extrabold rounded-lg text-xs flex items-center gap-1">
                    {detail.icon}
                    <span>{detail.name} Tier</span>
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    Threshold: {detail.minPoints === 0 ? '0' : `${detail.minPoints}+`} Points
                  </span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    {detail.multiplier} Earn Multiplier
                  </span>
                  {isUserCurrent && (
                    <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Current Tier ✓
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {detail.perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!isUserCurrent && (
                <div className="shrink-0 bg-white p-3 rounded-xl border border-slate-200 text-right md:min-w-44">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Requirement</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {detail.minPoints} Total Points
                  </p>
                  <p className="text-[11px] text-orange-600 font-semibold mt-0.5">
                    {loyaltyProfile.pointsBalance >= detail.minPoints
                      ? 'Threshold Met'
                      : `${detail.minPoints - loyaltyProfile.pointsBalance} pts away`}
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ================= 4. REWARDS CATALOG ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Points Redemption Catalog
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Discounts applied instantly at cart checkout
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loyaltyRewards.map((reward) => {
            const canAfford = loyaltyProfile.pointsBalance >= reward.pointsCost;

            return (
              <div
                key={reward.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-orange-400 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-950 text-xs font-black rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                      {reward.pointsCost} Points
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Valid {reward.expiryDays}d
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-1">
                    {language === 'ne' ? reward.nepaliTitle : reward.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100">
                  <button
                    onClick={() => handleRedeem(reward.id, reward.title)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      canAfford
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>{canAfford ? 'Redeem Voucher' : `Need ${reward.pointsCost - loyaltyProfile.pointsBalance} more pts`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 5. ACTIVE VOUCHERS DRAWER/LIST ================= */}
      {loyaltyProfile.activeVouchers.length > 0 && (
        <div className="bg-emerald-50/60 rounded-3xl border border-emerald-200 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-emerald-950">
                Your Active Redeemed Vouchers ({loyaltyProfile.activeVouchers.length})
              </h2>
            </div>
            <span className="text-xs text-emerald-700 font-semibold">
              Ready to apply at checkout
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {loyaltyProfile.activeVouchers.map((v) => (
              <div
                key={v.id}
                className="p-4 bg-white rounded-2xl border border-emerald-300/80 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] uppercase">
                      {v.type === 'free_delivery' ? 'Freight Pass' : 'Discount Voucher'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Expires {v.expiryDate}
                    </span>
                  </div>
                  <p className="text-base font-black text-slate-900 mt-1.5 font-mono tracking-wider">
                    {v.code}
                  </p>
                  <p className="text-xs text-emerald-700 font-bold mt-0.5">
                    Worth {formatNPR(v.discountNpr)} Discount
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => copyToClipboard(v.code, v.id)}
                    className="flex-1 py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedVoucherId === v.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 6. RECENT POINTS EARNING & REDEEMING ACTIVITY ================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Recent Points Earning & Transaction Activity</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed audit trail of all points accrued from hardware purchases and redeemed vouchers.
            </p>
          </div>

          {/* Filter Tabs and Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActivityFilter('all')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activityFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({loyaltyProfile.history.length})
              </button>
              <button
                onClick={() => setActivityFilter('earned')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer text-emerald-700 ${
                  activityFilter === 'earned'
                    ? 'bg-white font-black shadow-xs'
                    : 'hover:text-emerald-800'
                }`}
              >
                + Earned
              </button>
              <button
                onClick={() => setActivityFilter('redeemed')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer text-amber-700 ${
                  activityFilter === 'redeemed'
                    ? 'bg-white font-black shadow-xs'
                    : 'hover:text-amber-800'
                }`}
              >
                - Redeemed
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 w-36 text-slate-800 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Activity Items Feed */}
        {filteredHistory.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredHistory.map((item) => {
              const isEarned = item.type === 'earned';

              return (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isEarned
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}
                    >
                      {isEarned ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <Gift className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <span>{item.description}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                            isEarned
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isEarned ? 'Hardware Purchase' : 'Voucher Claim'}
                        </span>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.date} (Fiscal Year 2081/82)
                        </span>
                        <span>• Certified e-Invoice</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-black ${
                        isEarned ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {isEarned ? `+${item.points}` : `-${item.points}`} pts
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {isEarned ? 'Credited' : 'Deducted'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            No activity records matching filter criteria.
          </div>
        )}
      </div>

      {/* ================= 7. HOW TO EARN MORE HARDWARE POINTS GUIDE ================= */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl border border-orange-200/80 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-600" />
          <h3 className="font-bold text-sm text-slate-900">
            How to Earn More Loyalty Points & Upgrade Tiers
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-orange-200/60 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-black mb-2">
              1
            </div>
            <p className="text-xs font-bold text-slate-900">Shop Certified Dealers</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Earn 1 point for every NPR 100 on cement, steel, CPVC pipes, sanitaryware, and paint.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-orange-200/60 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-black mb-2">
              2
            </div>
            <p className="text-xs font-bold text-slate-900">Pay via eSewa / Khalti QR</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Receive +25 bonus points on instant digital wallet payments with verified IRD receipts.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-orange-200/60 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center text-xs font-black mb-2">
              3
            </div>
            <p className="text-xs font-bold text-slate-900">Reach Gold & Platinum</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Unlock up to 2.0x points earn booster, free site freight, and 30-day wholesale credit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
