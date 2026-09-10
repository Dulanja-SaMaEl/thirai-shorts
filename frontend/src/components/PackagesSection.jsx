"use client";

import { useState } from 'react';
import { Sparkles, Check, Crown, Zap, AlertCircle, CheckCircle2, Flame, Tag, Gift, Clock, Clapperboard, Film } from 'lucide-react';
import Link from 'next/link';
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

      {/* 50% OFF Early Bird Launch Offer Banner - ENLARGED & PROMINENT */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gold-950 via-black to-zinc-950 border-2 border-gold-500/70 p-6 sm:p-8 shadow-gold-glow-lg">
        {/* Decorative ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/20 border border-gold-400/60 text-gold-300 text-xs font-black uppercase tracking-wider shadow-gold-glow">
              <Flame className="w-4 h-4 text-gold-400 fill-gold-400 animate-pulse" /> Limited Early Bird Launch Offer
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              First 1–50 Members Get <span className="text-gold-400 underline decoration-gold-400 decoration-4">50% OFF</span> on Any VIP Pass
            </h3>

            {/* Prominent Dec 31 Deadline Highlight Badge */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-gold-500/20 to-amber-500/10 border-2 border-gold-400/80 text-white font-extrabold text-sm sm:text-base shadow-gold-glow">
                <Clock className="w-5 h-5 text-gold-400 animate-spin-slow shrink-0" />
                <span>Annual Pass: <strong className="text-gold-300 font-mono text-lg">$39.99</strong> only until <span className="text-gold-400 underline">December 31st</span>!</span>
              </div>
              <span className="text-xs text-zinc-400">Regular price $79.99/year after promo</span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
              Celebrate the premiere season of Thirai+ Shorts. Lock in your 50% discount and enjoy unlimited access to every festival selection, award winner, and director statement.
            </p>
          </div>

          {/* Spots Remaining Indicator */}
          <div className="bg-black/90 border border-gold-500/50 rounded-2xl p-5 text-center shrink-0 w-full lg:w-64 space-y-3 shadow-gold-glow">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-zinc-400 uppercase tracking-wider">Early Spots:</span>
              <span className="text-gold-400 font-mono text-sm">38 / 50 Claimed</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700">
              <div className="h-full bg-gold-gradient rounded-full w-[76%] transition-all shadow-gold-glow" />
            </div>
            <span className="block text-xs font-black text-rose-400 animate-pulse uppercase tracking-wider">
              🔥 Only 12 Passes Left at this rate!
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

      {/* Pricing Cards Grid (3 Columns: Free Pass vs Monthly VIP vs Annual VIP) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Free Audience Pass Card (Comparison) */}
        <div className="relative rounded-3xl p-6 md:p-8 flex flex-col justify-between bg-surface-card border border-zinc-800 hover:border-zinc-700 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-zinc-800 text-zinc-300 border border-zinc-700">
                Included Free
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase">
                Standard Tier
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Free Audience Pass</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono">$0</span>
                <span className="text-xs text-zinc-400 font-semibold">Free Forever</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-medium">
                <span>Registration gift with account</span>
              </div>
            </div>

            {/* Free Pass Features */}
            <ul className="space-y-2.5 my-6 py-4 border-y border-zinc-800/80">
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>2 Free Viewing Tokens</strong> granted on signup</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Unlock any 2 short films of your choice</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Festival Community public voting rights</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Access to trailers & Award Winner showcase</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Standard HD cinema playback</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-500 line-through">
                <span>Unlimited streaming (Tokens required after 2)</span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center text-xs text-zinc-400 font-semibold">
            {user ? '✓ Currently Active with Your Account' : 'Included automatically when you sign up'}
          </div>
        </div>

        {/* 2. Monthly VIP Pass */}
        {packages.filter(p => p.id === 'monthly').map((pkg) => {
          const isCurrentPlan = isSubActive && currentTier === pkg.id;
          return (
            <div
              key={pkg.id}
              className="relative rounded-3xl p-6 md:p-8 flex flex-col justify-between bg-surface-card border border-zinc-800 hover:border-gold-500/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold ${pkg.badgeClass}`}>
                    {pkg.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                    <Tag className="w-3 h-3" /> {pkg.discount}
                  </span>
                </div>

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

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300 font-semibold">
                    <span>Approx.</span>
                    <span className="text-gold-400 font-bold font-mono">Rs. {pkg.lkrPrice} LKR</span>
                    <span className="text-zinc-400 font-light text-[10px]">({pkg.period})</span>
                  </div>
                </div>

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

              <button
                onClick={() => handleSubscribe(pkg.id)}
                disabled={isCurrentPlan || loadingPkg === pkg.id}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isCurrentPlan
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : 'bg-zinc-900 border border-gold-500/50 hover:bg-gold-500/20 text-gold-300 hover:text-white'
                }`}
              >
                {loadingPkg === pkg.id ? (
                  'Activating...'
                ) : isCurrentPlan ? (
                  'Current Active Pass'
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" /> Claim Monthly Pass — ${pkg.usdPrice}
                  </>
                )}
              </button>
            </div>
          );
        })}

        {/* 3. Annual VIP Pass (Best Value & Dec 31st Callout) */}
        {packages.filter(p => p.id === 'yearly').map((pkg) => {
          const isCurrentPlan = isSubActive && currentTier === pkg.id;
          return (
            <div
              key={pkg.id}
              className="relative rounded-3xl p-6 md:p-8 flex flex-col justify-between bg-surface-card border-2 border-gold-500 shadow-gold-glow-lg transition-all"
            >
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gold-gradient text-black text-[10px] font-black uppercase tracking-wider shadow-gold-glow">
                Dec 31st Special • Save 50%
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold ${pkg.badgeClass}`}>
                    {pkg.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase">
                    <Clock className="w-3 h-3" /> Until Dec 31st
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white">{pkg.name}</h3>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-base text-zinc-500 line-through font-mono">
                      ${pkg.originalUsd}
                    </span>
                    <span
                      style={{ color: '#FACC15', textShadow: '0 0 20px rgba(250,204,21,0.5)' }}
                      className="text-4xl sm:text-5xl font-black font-mono text-gold-400"
                    >
                      ${pkg.usdPrice}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">{pkg.period}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gold-500/20 border border-gold-500/50 text-xs text-gold-300 font-bold">
                    <span>Approx.</span>
                    <span className="text-gold-400 font-mono">Rs. {pkg.lkrPrice} LKR</span>
                    <span className="text-zinc-400 font-normal text-[10px]">({pkg.period})</span>
                  </div>
                </div>

                <ul className="space-y-2.5 my-6 py-4 border-y border-gold-500/30">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-200 font-medium">
                      <div className="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(pkg.id)}
                disabled={isCurrentPlan || loadingPkg === pkg.id}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isCurrentPlan
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : 'gold-btn shadow-gold-glow hover:scale-105 active:scale-95'
                }`}
              >
                {loadingPkg === pkg.id ? (
                  'Activating VIP Pass...'
                ) : isCurrentPlan ? (
                  'Current Active Pass'
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" /> Claim Annual Pass — ${pkg.usdPrice}
                  </>
                )}
              </button>
            </div>
          );
        })}

      </div>

      {/* Film Submitter Special Privilege Note Box */}
      <div className="p-5 rounded-3xl bg-zinc-950/80 border border-gold-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-400 shrink-0">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Film Submitter Exclusive Pass Available</h4>
            <p className="text-xs text-zinc-400">
              Have you submitted a short film? Filmmakers enjoy our lowest VIP pass rate at just <strong className="text-gold-400">$2.99/mo</strong> or <strong className="text-gold-400">$29.99/yr</strong>.
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/50 text-gold-300 hover:text-white text-xs font-bold transition-colors"
        >
          Sign In with Submitter Email →
        </Link>
      </div>

    </section>
  );
}
