"use client";

import { useState, useEffect } from 'react';
import {
  Sparkles, Check, Crown, Zap, AlertCircle, CheckCircle2,
  Flame, Tag, Gift, Clock, Clapperboard, Film, Lock, Unlock, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function PackagesSection({ onSubscribed }) {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
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
        setErrorMsg(res.data.error || 'Failed to activate pass.');
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
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('passes.title', 'Festival Passes & Access')}</h2>
          <p className="text-xs text-zinc-400 mt-1">
            {t('passes.subtitle', 'Unlock unlimited short film streaming, 4K playback, and community jury voting privileges.')}
          </p>
        </div>

        {/* Currency Conversion Note */}
        <div className="text-[11px] text-zinc-400">
          <span>1 USD ≈ 310 LKR</span>
        </div>
      </div>

      {/* Early Bird Launch Offer Banner */}
      <div className="rounded-xl bg-[#0D1017] border border-white/[0.08] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">Early Bird Festival Offer</span>
          <h3 className="text-lg sm:text-xl font-bold text-white">Save 50% on the Annual Cinema Pass</h3>
          <p className="text-xs text-zinc-400 max-w-xl">
            Full-year access to all festival short films, director statements, and competition voting. Special promotional rate available until December 31st.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-zinc-500 line-through font-mono">$79.99</span>
            <span className="block text-2xl font-bold text-white font-mono">$39.99<span className="text-xs text-zinc-400 font-normal">/yr</span></span>
          </div>
          <button
            onClick={() => handleSubscribe('yearly')}
            className="gold-btn px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider"
          >
            Claim Pass
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main 3-Column Pass Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* 1. Free Audience Pass */}
        <div className="rounded-xl p-6 flex flex-col justify-between bg-[#0D1017] border border-white/[0.08] transition-colors">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                Included Free
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">{t('passes.freePassTitle', 'Free Audience Pass')}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white font-mono">$0</span>
                <span className="text-xs text-zinc-400">{t('passes.freeForever', 'Free Forever')}</span>
              </div>
              <p className="text-xs text-zinc-400">
                {t('passes.freePassDesc', 'Registration gift with account')}
              </p>
            </div>

            <ul className="space-y-2 my-5 py-4 border-y border-white/[0.06]">
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>2 Free Viewing Tokens</strong> on registration</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Movie Trailers:</strong> Watch trailers for any film free</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Unlock any 2 short films of your choice</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Community public voting rights</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-md bg-white/[0.04] text-center text-xs text-zinc-400">
            {user ? 'Active with your account' : 'Included automatically on sign up'}
          </div>
        </div>

        {/* 2. Only Viewer Pass - $4.99 / month */}
        <div className="relative rounded-3xl p-6 md:p-8 flex flex-col justify-between bg-surface-card border-2 border-gold-500/40 hover:border-gold-500 shadow-gold-glow transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold bg-gold-500/20 text-gold-300 border border-gold-500/40">
                {t('passes.viewerPassBadge', 'Viewer Pass')}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase">
                Monthly Pass
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">{t('passes.viewerPassTitle', 'Only Viewer Pass')}</h3>
              <div className="flex items-baseline gap-2.5">
                <span className="text-base text-zinc-500 line-through font-mono">
                  $9.99
                </span>
                <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                  $4.99
                </span>
                <span className="text-xs text-zinc-400">{t('passes.perMonth', '/ month')}</span>
              </div>

              <div className="text-xs text-zinc-400">
                <span>Approx. <strong className="text-zinc-300 font-mono">Rs. 1,550 LKR</strong> / month</span>
              </div>
            </div>

            <ul className="space-y-2 my-5 py-4 border-y border-white/[0.06]">
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span><strong>Unlimited short film streaming</strong></span>
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Zero token deduction on any film</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Ultra HD 4K playback stream</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Community jury voting rights</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>{t('passes.cancelAnytime', 'Cancel anytime')}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSubscribe('monthly')}
            disabled={isSubActive && (currentTier === 'monthly' || currentTier === 'viewer_monthly') || loadingPkg === 'monthly'}
            className={`w-full py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
              isSubActive && (currentTier === 'monthly' || currentTier === 'viewer_monthly')
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.1]'
            }`}
          >
            {loadingPkg === 'monthly' ? (
              'Activating...'
            ) : isSubActive && (currentTier === 'monthly' || currentTier === 'viewer_monthly') ? (
              t('passes.currentActivePass', 'Current Active Pass')
            ) : (
              t('passes.claimViewerPass', 'Get Viewer Pass — $4.99/mo')
            )}
          </button>
        </div>

        {/* 3. Annual VIP Cinema Pass - $39.99 / year */}
        <div className="rounded-xl p-6 flex flex-col justify-between bg-[#0D1017] border-2 border-gold-500/50 relative">
          <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded bg-gold-500 text-black text-[10px] font-bold uppercase tracking-wider">
            Best Value
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-gold-400">
                Annual Pass
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Until Dec 31</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">{t('passes.annualPassTitle', 'Annual Cinema Pass')}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-zinc-500 line-through font-mono">
                  $79.99
                </span>
                <span className="text-3xl font-bold text-white font-mono">
                  $39.99
                </span>
                <span className="text-xs text-zinc-400">{t('passes.perYear', '/ year')}</span>
              </div>

              <div className="text-xs text-zinc-400">
                <span>Approx. <strong className="text-zinc-300 font-mono">Rs. 12,400 LKR</strong> / year</span>
              </div>
            </div>

            <ul className="space-y-2 my-5 py-4 border-y border-white/[0.06]">
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span><strong>12 months of unlimited movie streaming</strong></span>
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Access to all official Award Showcases</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Director statements & complete press kits</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Grand Jury Choice community voting power</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Official Festival Digital Certificate</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSubscribe('yearly')}
            disabled={isSubActive && (currentTier === 'yearly' || currentTier === 'viewer_yearly') || loadingPkg === 'yearly'}
            className={`w-full py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
              isSubActive && (currentTier === 'yearly' || currentTier === 'viewer_yearly')
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'gold-btn'
            }`}
          >
            {loadingPkg === 'yearly' ? (
              'Activating...'
            ) : isSubActive && (currentTier === 'yearly' || currentTier === 'viewer_yearly') ? (
              t('passes.currentActivePass', 'Current Active Pass')
            ) : (
              t('passes.claimYearPass', 'Get Annual Pass — $39.99/yr')
            )}
          </button>
        </div>

      </div>

      {/* 4. Film Submitter Special Privilege Section ($2.99 / month) */}
      <div className="rounded-xl p-6 bg-[#0D1017] border border-white/[0.08]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400 block">
              {t('passes.approvedFilmmakerBadge', 'Approved Filmmaker Pass')}
            </span>

            <h3 className="text-xl font-bold text-white">
              {t('passes.submitterPassTitle', 'Submitter Rate')}: <span className="font-mono text-xl font-bold text-gold-400">$2.99</span> <span className="text-xs text-zinc-400 font-normal">/ month</span>
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {t('passes.submitterRuleNotice', 'Filmmakers with an approved short film in competition qualify for full platform access at $2.99 monthly.')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 pt-1">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Unlimited streaming (zero token cost)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Community rating & voting privileges</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Director analytics dashboard access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Save 40% vs. standard monthly pass</span>
              </div>
            </div>
          </div>

          {/* Submitter Action Controls */}
          <div className="bg-[#07080B] border border-white/[0.08] rounded-lg p-5 shrink-0 w-full lg:w-72 space-y-2.5 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
              Filmmaker Status
            </span>

            {user ? (
              isApprovedFilmmaker ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 py-1.5 px-3 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Approved Film Verified</span>
                  </div>
                  <button
                    onClick={() => handleSubscribe('submitter_monthly')}
                    disabled={isSubActive && currentTier === 'submitter_monthly' || loadingPkg === 'submitter_monthly'}
                    className={`w-full py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
                      isSubActive && currentTier === 'submitter_monthly'
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'gold-btn'
                    }`}
                  >
                    {loadingPkg === 'submitter_monthly' ? (
                      'Activating...'
                    ) : isSubActive && currentTier === 'submitter_monthly' ? (
                      t('passes.currentActivePass', 'Current Active Pass')
                    ) : (
                      'Claim Submitter Pass ($2.99/mo)'
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs text-zinc-400 block">Requires Approved Film Submission</span>
                  <Link
                    href="/upload"
                    className="w-full py-2 px-3 rounded-md bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Submit Film to Qualify
                  </Link>
                </div>
              )
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">
                  Approved filmmakers receive access at <strong>$2.99/mo</strong>.
                </p>
                <Link
                  href="/login?redirect=/#packages"
                  className="w-full py-2 px-3 rounded-md bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  Sign In as Filmmaker
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
