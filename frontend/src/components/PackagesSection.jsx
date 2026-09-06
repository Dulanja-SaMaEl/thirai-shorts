"use client";

import { useState } from 'react';
import { Sparkles, Check, Crown, Zap, AlertCircle, CheckCircle2, Flame, Tag } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function PackagesSection({ onSubscribed }) {
  const { user, refreshUser } = useAuth();
  const [loadingPkg, setLoadingPkg] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const packages = [
    {
      id: 'monthly',
      name: 'Monthly VIP Cinema Pass',
      originalUsd: '9.99',
      usdPrice: '4.99',
      lkrPrice: '1,550',
      period: 'per month',
      discount: '50% OFF',
      badge: 'Early Bird Special',
      badgeClass: 'bg-gold-500/20 text-gold-300 border border-gold-500/40',
      features: [
        'Unlimited short movie streaming',
        'Instant access to all festival selections',
        'Ultra HD 4K cinema playback',
        'Festival community voting rights',
        'Zero token deduction on any film',
        'Cancel anytime with 1-click'
      ]
    },
    {
      id: 'yearly',
      name: 'Annual VIP Cinema Pass',
      originalUsd: '79.99',
      usdPrice: '39.99',
      lkrPrice: '12,400',
      period: 'per year',
      discount: '50% OFF + 2 Mos Free',
      badge: 'Best Value • 50% OFF',
      badgeClass: 'bg-gold-gradient text-black font-extrabold shadow-gold-glow',
      features: [
        '12 months of unlimited movie streaming',
        'Priority access to Award Winner showcases',
        'Exclusive director statements & full press kits',
        'Grand Jury Choice community voting power',
        'Official Festival Digital Pass & Certificate',
        'Save $40.00 compared to standard yearly'
      ]
    }
  ];

  const handleSubscribe = async (pkgId) => {
    if (!user) {
      window.location.href = '/login?redirect=/#packages';
      return;
    }

    setLoadingPkg(pkgId);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/packages/subscribe', { package_id: pkgId });
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'VIP Pass activated successfully!');
        await refreshUser();
        if (onSubscribed) onSubscribed(res.data.user);
      } else {
        setErrorMsg(res.data.error || 'Failed to activate package.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to process package subscription.');
    } finally {
      setLoadingPkg(null);
    }
  };

  const currentTier = user?.subscription_tier || 'free';
  const isSubActive = user?.subscription_status === 'active';

  return (
    <section id="packages" className="space-y-6 scroll-mt-24">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-gold-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-gold-400" />
            <h2 className="text-2xl font-extrabold text-white">VIP Audience Packages & Passes</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Unlock unlimited short film streaming, 4K playback, and community jury voting privileges.
          </p>
        </div>

        {/* Currency Conversion Note Pill */}
        <div className="px-3.5 py-1.5 rounded-xl bg-black/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Estimated LKR calculated at approx. <strong>1 USD ≈ 310 LKR</strong></span>
        </div>
      </div>

      {/* 50% OFF Early Bird Launch Offer Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gold-950/80 via-black to-zinc-950 border border-gold-500/50 p-5 md:p-6 shadow-gold-glow">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-gold-400 fill-gold-400" /> Early Bird Launch Offer
            </div>
            <h3 className="text-lg md:text-xl font-black text-white">
              First 1–50 Members Get <span className="text-gold-400 underline decoration-gold-500 decoration-2">50% OFF</span> on Any VIP Pass
            </h3>
            <p className="text-xs text-zinc-300">
              Celebrate the launch of Thirai+ Shorts! Join as an early audience founder and lock in 50% lifetime discount pricing on monthly or annual streaming passes.
            </p>
          </div>

          {/* Spots Remaining Indicator */}
          <div className="bg-black/80 border border-gold-500/40 rounded-2xl p-4 text-center shrink-0 w-full md:w-56 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-400">Early Spots:</span>
              <span className="text-gold-400 font-mono">38 / 50 Claimed</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gold-gradient rounded-full w-[76%] transition-all" />
            </div>
            <span className="block text-[11px] font-extrabold text-rose-400 animate-pulse">
              🔥 Only 12 Early Bird Passes Left!
            </span>
          </div>
        </div>
      </div>

      {/* Success / Error Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-gold-glow">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => {
          const isCurrentPlan = isSubActive && currentTier === pkg.id;

          return (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 ${
                pkg.id === 'yearly'
                  ? 'bg-surface-card border-2 border-gold-500/70 shadow-gold-glow-lg'
                  : 'bg-surface-card border border-zinc-800 hover:border-gold-500/50'
              }`}
            >
              <div>
                {/* Badge & Discount Tag */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold ${pkg.badgeClass}`}>
                    {pkg.badge}
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                    <Tag className="w-3 h-3" /> {pkg.discount}
                  </span>
                </div>

                {/* Package Title & Strikethrough Pricing */}
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white">{pkg.name}</h3>
                  
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-base text-zinc-500 line-through font-mono">
                      ${pkg.originalUsd}
                    </span>
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                      ${pkg.usdPrice}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">{pkg.period}</span>
                  </div>

                  {/* Estimated LKR Display */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300 font-semibold">
                    <span>Approx.</span>
                    <span className="text-gold-400 font-bold font-mono">Rs. {pkg.lkrPrice} LKR</span>
                    <span className="text-zinc-400 font-light text-[10px]">({pkg.period})</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 my-6 py-4 border-y border-zinc-800/80">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                      <div className="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSubscribe(pkg.id)}
                disabled={isCurrentPlan || loadingPkg === pkg.id}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isCurrentPlan
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : pkg.id === 'yearly'
                      ? 'gold-btn shadow-gold-glow hover:scale-105 active:scale-95'
                      : 'bg-zinc-900 border border-gold-500/50 hover:bg-gold-500/20 text-gold-300 hover:text-white'
                }`}
              >
                {loadingPkg === pkg.id ? (
                  'Activating VIP Pass...'
                ) : isCurrentPlan ? (
                  'Current Active Pass'
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" /> Claim 50% Off Pass — ${pkg.usdPrice} (~Rs. {pkg.lkrPrice} LKR)
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

    </section>
  );
}
