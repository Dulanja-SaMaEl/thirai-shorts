"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Coins, Film, X, CheckCircle2, AlertCircle, Sparkles, PlayCircle, ArrowRight } from 'lucide-react';
import api from '../lib/api';

export default function TokenUnlockModal({ movie, userTokens, onConfirmUnlock, onClose }) {
  if (!movie) return null;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const hasTokens = userTokens >= 1;

  const handleUnlockClick = async () => {
    if (!hasTokens) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post(`/movies/${movie.id}/unlock`);
      if (res.data.success) {
        onConfirmUnlock(res.data.tokens_balance);
      } else {
        setErrorMsg(res.data.error || 'Failed to unlock movie.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to unlock movie. Please check your token balance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-surface-card border border-gold-500/40 rounded-3xl p-6 md:p-8 shadow-gold-glow-lg glass-panel space-y-6 text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 border border-zinc-700 hover:border-gold-500 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gold-gradient p-0.5 shadow-gold-glow mx-auto">
          <div className="w-full h-full bg-black rounded-3xl flex items-center justify-center">
            <Coins className="w-8 h-8 text-gold-400" />
          </div>
        </div>

        {/* Movie Info */}
        <div className="space-y-2">
          <span className="text-[10px] font-black text-gold-400 uppercase tracking-widest">
            Token-Gated Viewing Pass
          </span>
          <h2 className="text-xl font-extrabold text-white">
            {hasTokens ? 'Unlock Cinema Stream' : 'Out of Viewing Tokens'}
          </h2>
          <p className="text-xs text-zinc-300">
            {hasTokens ? (
              <>
                Use <strong className="text-gold-400">1 Token</strong> to unlock <strong className="text-white">"{movie.title}"</strong> for permanent, unlimited viewing.
              </>
            ) : (
              <>
                You have used your free viewing tokens. You have <strong className="text-rose-400">0 tokens remaining</strong>.
              </>
            )}
          </p>
        </div>

        {/* Token Balance Card */}
        <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 flex items-center justify-between">
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold text-zinc-400">Your Current Balance</span>
            <span className="text-lg font-black text-white font-mono flex items-center gap-1.5 mt-0.5">
              <Coins className="w-4 h-4 text-gold-400" /> {userTokens} {userTokens === 1 ? 'Token' : 'Tokens'}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-zinc-400">Cost</span>
            <span className="text-lg font-black text-gold-400 font-mono">1 Token</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons & Out-of-tokens Package Upgrade Teaser */}
        <div className="space-y-3">
          {hasTokens ? (
            <button
              onClick={handleUnlockClick}
              disabled={loading}
              className="w-full gold-btn py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
            >
              {loading ? (
                'Unlocking Short Movie...'
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" /> Confirm & Unlock Film
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              {/* VIP Packages Quick Option */}
              <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Get Unlimited VIP Access
                  </span>
                  <span className="text-[10px] text-gold-400">1 USD ≈ 310 LKR</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-black/60 border border-zinc-800">
                    <span className="block text-[10px] text-zinc-400">Monthly VIP</span>
                    <span className="block font-black text-white font-mono">$4.99</span>
                    <span className="block text-[10px] text-gold-400 font-semibold font-mono">~Rs. 1,550 LKR</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/60 border border-gold-500/40">
                    <span className="block text-[10px] text-gold-300 font-bold">Annual VIP</span>
                    <span className="block font-black text-white font-mono">$39.99</span>
                    <span className="block text-[10px] text-gold-400 font-semibold font-mono">~Rs. 12,400 LKR</span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard"
                onClick={onClose}
                className="w-full gold-btn py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
              >
                Upgrade to VIP in Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Cancel & Return
          </button>
        </div>
      </div>
    </div>
  );
}
