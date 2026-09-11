"use client";

import { useState, useEffect } from 'react';
import {
  Sparkles, Check, Crown, Zap, AlertCircle, CheckCircle2,
  Flame, Tag, Gift, Clock, Clapperboard, Film, Lock, Unlock, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function PackagesSection({ onSubscribed }) {
  const { user, refreshUser } = useAuth();
  const [loadingPkg, setLoadingPkg] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitterStatus, setSubmitterStatus] = useState(null);

  useEffect(() => {
    if (user) {
      checkSubmitterStatus();
    } else {
      setSubmitterStatus(null);
    }
  }, [user?.id]);

  const checkSubmitterStatus = async () => {
    try {
      const res = await api.get('/movies/my/is-submitter');
      if (res.data.success) {
        setSubmitterStatus(res.data);
      }
    } catch (e) {
      console.warn('Submitter check notice:', e);
    }
  };

  const isApprovedFilmmaker = Boolean(
    submitterStatus?.discount_eligible ||
    submitterStatus?.is_approved ||
    user?.role === 'director' ||
    user?.role === 'admin'
  );

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
        setSuccessMsg(res.data.message || 'Pass activated successfully!');
        await refreshUser();
        if (onSubscribed) onSubscribed(res.data.user);
      } else {
        setErrorMsg(res.data.error || 'Failed to activate package.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to process pass subscription.');
    } finally {
      setLoadingPkg(null);
    }
  };

  const currentTier = user?.subscription_tier || 'free';
  const isSubActive = user?.subscription_status === 'active';

  return (
    <section id="packages" className="space-y-8 scroll-mt-24">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-gold-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-gold-400" />
            <h2 className="text-2xl font-extrabold text-white">Festival Audience & Filmmaker Passes</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Unlock unlimited short film streaming, ultra-HD playback, and community jury voting privileges.
          </p>
        </div>

        {/* Currency Conversion Note Pill */}
        <div className="px-3.5 py-1.5 rounded-xl bg-black/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Estimated LKR calculated at approx. <strong>1 USD ≈ 310 LKR</strong></span>
        </div>
      </div>

      {/* 50% OFF Launch Offer Callout Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gold-950 via-black to-zinc-950 border-2 border-gold-500/70 p-6 sm:p-8 shadow-gold-glow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/20 border border-gold-400/60 text-gold-300 text-xs font-black uppercase tracking-wider shadow-gold-glow">
              <Flame className="w-4 h-4 text-gold-400 fill-gold-400 animate-pulse" /> Official Festival Passes 2026/2027
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Stream Unlimited Festival Cinema & Vote for Official Laurels
            </h3>

            {/* Price Callout Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-900/90 border border-gold-400/60 text-white font-bold text-xs sm:text-sm shadow-gold-glow">
                <span>Viewer Pass: <strong className="text-gold-300 font-mono text-base">$4.99/mo</strong></span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-gold-500/20 to-amber-500/10 border-2 border-gold-400/80 text-white font-extrabold text-xs sm:text-sm shadow-gold-glow">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>Submitter Pass: <strong className="text-gold-300 font-mono text-base">$2.99/mo</strong> (Approved Filmmakers)</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
              Trailers for all movies can be watched by anyone completely free without costing any tokens. Upgrade to an audience or filmmaker pass to unlock full uninterrupted short films and vote for the Audience Choice Award!
            </p>
          </div>

          {/* Submitter Quick Qualification Status */}
          <div className="bg-black/90 border border-gold-500/50 rounded-2xl p-5 shrink-0 w-full lg:w-72 space-y-3 shadow-gold-glow">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              Filmmaker Status Detector:
            </span>
            {user ? (
              isApprovedFilmmaker ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Approved Film Verified!</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    You qualify for the exclusive <strong>$2.99/mo Submitter Pass</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>No Approved Film Yet</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Submit your short film to unlock the $2.99 filmmaker pass.
                  </p>
                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-1 text-[11px] text-gold-400 font-bold hover:underline"
                  >
                    Submit Film Now <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )
            ) : (
              <div className="space-y-1.5">
                <span className="text-xs text-zinc-300 block">
                  Filmmakers with approved entries pay just <strong>$2.99/mo</strong>.
                </span>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-[11px] text-gold-400 font-bold hover:underline"
                >
                  Sign In to Check Eligibility →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
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

      {/* 3 Main Passes: Free Audience Pass, Viewer Pass ($4.99), Submitter Pass ($2.99) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Free Audience Pass */}
        <div className="relative rounded-3xl p-6 md:p-8 flex flex-col justify-between bg-surface-card border border-zinc-800 hover:border-zinc-700 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-zinc-800 text-zinc-300 border border-zinc-700">
                Included Free
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase">
                Standard
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Free Audience Pass</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono">$0</span>
                <span className="text-xs text-zinc-400 font-semibold">Free Forever</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-medium">
                <span>Registration gift with every account</span>
              </div>
            </div>

            <ul className="space-y-2.5 my-6 py-4 border-y border-zinc-800/80">
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>2 Free Viewing Tokens</strong> granted upon signup</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Free Movie Trailers:</strong> Watch trailers for any film without costing tokens</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Unlock any 2 full short films of your choice</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Festival community voting rights</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-500 line-through">
                <span>Unlimited streaming (Pass required after 2 tokens)</span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center text-xs text-zinc-400 font-semibold">
            {user ? '✓ Active with Your Account' : 'Included automatically when you sign up'}
          </div>
        </div>

        {/* 2. Only Viewer Pass - $4.99 / month */}
        <div className="relative rounded-3xl p-6 md:p-8 flex flex-col justify-between bg-surface-card border-2 border-gold-500/40 hover:border-gold-500 shadow-gold-glow transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-gold-500/20 text-gold-300 border border-gold-500/40">
                Viewer Pass
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                General Audience
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Only Viewer Pass</h3>
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                  $4.99
                </span>
                <span className="text-xs text-zinc-400 font-semibold">per month</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300 font-semibold">
                <span>Approx.</span>
                <span className="text-gold-400 font-bold font-mono">Rs. 1,550 LKR</span>
                <span className="text-zinc-400 font-light text-[10px]">/ month</span>
              </div>
            </div>

            <ul className="space-y-2.5 my-6 py-4 border-y border-zinc-800/80">
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Unlimited short movie streaming</strong></span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Zero token deduction</strong> on any short film</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Ultra HD 4K cinema playback stream</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Festival community jury voting power</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Cancel anytime with 1-click</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSubscribe('monthly')}
            disabled={isSubActive && (currentTier === 'monthly' || currentTier === 'viewer_monthly') || loadingPkg === 'monthly'}
            className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isSubActive && (currentTier === 'monthly' || currentTier === 'viewer_monthly')
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                : 'gold-btn shadow-gold-glow hover:scale-105 active:scale-95'
            }`}
          >
            {loadingPkg === 'monthly' ? (
              'Activating...'
            ) : isSubActive && (currentTier === 'monthly' || currentTier === 'viewer_monthly') ? (
              'Current Active Pass'
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" /> Claim Viewer Pass — $4.99/mo
              </>
            )}
          </button>
        </div>

        {/* 3. Submitter Pass - $2.99 / month (For Approved Filmmakers) */}
        <div className="relative rounded-3xl p-6 md:p-8 flex flex-col justify-between bg-surface-card border-2 border-gold-400 shadow-gold-glow-lg transition-all">
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gold-gradient text-black text-[10px] font-black uppercase tracking-wider shadow-gold-glow flex items-center gap-1">
            <Clapperboard className="w-3 h-3" /> Filmmaker Rate
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-gold-gradient text-black shadow-gold-glow">
                Submitter Pass
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase">
                Save 40%
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Submitter Pass</h3>
              <div className="flex items-baseline gap-2.5">
                <span className="text-base text-zinc-500 line-through font-mono">
                  $4.99
                </span>
                <span
                  style={{ color: '#FFFFFF' }}
                  className="text-4xl sm:text-5xl font-black text-white font-mono"
                >
                  $2.99
                </span>
                <span className="text-xs text-zinc-400 font-semibold">per month</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gold-500/20 border border-gold-500/50 text-xs text-gold-300 font-bold">
                <span>Approx.</span>
                <span className="text-gold-400 font-mono">Rs. 930 LKR</span>
                <span className="text-zinc-400 font-normal text-[10px]">/ month</span>
              </div>
            </div>

            {/* Explanatory Rule Box */}
            <div className="my-3 p-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-[11px] text-gold-300 leading-snug">
              <strong>Filmmaker Rule:</strong> If you have submitted your short film for T+ film festival and got approved, you can gain access to view pass at just <strong>$2.99 monthly</strong> to stream unlimited movies and vote.
            </div>

            <ul className="space-y-2.5 my-4 py-3 border-y border-gold-500/30">
              <li className="flex items-center gap-2.5 text-xs text-zinc-200 font-medium">
                <div className="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Lowest festival VIP rate ($2.99/mo)</strong></span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-200 font-medium">
                <div className="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Stream unlimited short films</strong> without tokens</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-200 font-medium">
                <div className="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Festival community rating & voting rights</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-zinc-200 font-medium">
                <div className="w-4 h-4 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Official Film Submitter profile badge</span>
              </li>
            </ul>
          </div>

          <div>
            {user ? (
              isApprovedFilmmaker ? (
                <button
                  onClick={() => handleSubscribe('submitter_monthly')}
                  disabled={isSubActive && currentTier === 'submitter_monthly' || loadingPkg === 'submitter_monthly'}
                  className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isSubActive && currentTier === 'submitter_monthly'
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                      : 'gold-btn shadow-gold-glow hover:scale-105 active:scale-95'
                  }`}
                >
                  {loadingPkg === 'submitter_monthly' ? (
                    'Activating Submitter Pass...'
                  ) : isSubActive && currentTier === 'submitter_monthly' ? (
                    'Current Active Pass'
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" /> Claim Submitter Pass — $2.99/mo
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-2 text-center">
                  <Link
                    href="/upload"
                    className="w-full py-3 px-4 rounded-2xl bg-zinc-900 border border-gold-500/40 hover:border-gold-400 text-gold-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Clapperboard className="w-4 h-4 text-gold-400" /> Submit Film to Unlock $2.99 Rate
                  </Link>
                  <span className="text-[10px] text-zinc-500 block">
                    Approval required to activate the $2.99 submitter rate.
                  </span>
                </div>
              )
            ) : (
              <Link
                href="/login?redirect=/#packages"
                className="w-full py-4 rounded-2xl bg-zinc-900 border border-gold-500/40 hover:border-gold-400 text-gold-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Lock className="w-4 h-4 text-gold-400" /> Sign In as Submitter — $2.99/mo
              </Link>
            )}
          </div>
        </div>

      </div>

    </section>
  );
}
