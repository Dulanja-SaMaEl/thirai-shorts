"use client";

import { useState } from 'react';
import { Sparkles, Check, Crown, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
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
      usdPrice: '4.99',
      lkrPrice: '1,550',
      period: 'per month',
      badge: 'Popular',
      badgeClass: 'bg-zinc-800 text-gold-300 border border-gold-500/30',
      features: [
        'Unlimited short movie streaming',
        'Instant access to all festival selections',
        'Ultra HD cinema video playback',
        'Festival community voting pass',
        'Zero token deduction on film watches'
      ]
    },
    {
      id: 'yearly',
      name: 'Annual VIP Cinema Pass',
      usdPrice: '39.99',
      lkrPrice: '12,400',
      period: 'per year',
      badge: 'Best Value • Save 33%',
      badgeClass: 'bg-gold-gradient text-black font-extrabold shadow-gold-glow',
      features: [
        '12 months of unlimited movie streaming',
        'Priority access to Award Winner showcases',
        'Exclusive director statements & press kits',
        'Grand Jury Choice community voting rights',
        'Save 33% over monthly billing (~$20 saved)'
      ]
    }
  ];

  const handleSubscribe = async (pkgId) => {
    if (!user) {
      window.location.href = '/login?redirect=/dashboard';
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
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-gold-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold-400" />
            <h2 className="text-xl font-extrabold text-white">VIP Audience Packages & Passes</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Upgrade your audience account for unlimited streaming across all festival films.
          </p>
        </div>

        {/* Currency Conversion Note Pill */}
        <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Estimated LKR calculated at approx. <strong>1 USD ≈ 310 LKR</strong></span>
        </div>
      </div>

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
                  ? 'bg-surface-card border-2 border-gold-500/60 shadow-gold-glow-lg'
                  : 'bg-surface-card border border-zinc-800 hover:border-gold-500/40'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${pkg.badgeClass}`}>
                  {pkg.badge}
                </span>

                {isCurrentPlan && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                    ✓ Current Active Plan
                  </span>
                )}
              </div>

              {/* Package Title & Price */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white font-mono">${pkg.usdPrice}</span>
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

              {/* Action Button */}
              <button
                onClick={() => handleSubscribe(pkg.id)}
                disabled={isCurrentPlan || loadingPkg === pkg.id}
                className={`w-full py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isCurrentPlan
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : pkg.id === 'yearly'
                      ? 'gold-btn shadow-gold-glow hover:opacity-90'
                      : 'bg-zinc-900 border border-gold-500/50 hover:bg-gold-500/20 text-gold-300 hover:text-white'
                }`}
              >
                {loadingPkg === pkg.id ? (
                  'Activating Package...'
                ) : isCurrentPlan ? (
                  'Active Pass'
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Subscribe for ${pkg.usdPrice} (~Rs. {pkg.lkrPrice} LKR)
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
