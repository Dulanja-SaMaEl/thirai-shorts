"use client";

import { useState, useEffect } from 'react';
import { Coins, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function TokenBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('thirai_token_banner_dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  if (!user || user.role !== 'viewer' || dismissed) {
    return null;
  }

  const tokenCount = user.tokens_balance ?? 2;
  const isVip = user.subscription_status === 'active';

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('thirai_token_banner_dismissed', 'true');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gold-950/80 via-zinc-900/90 to-black border border-gold-500/40 p-4 shadow-gold-glow animate-fade-in my-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Left icon & text */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/50 flex items-center justify-center text-gold-400 shrink-0">
            <Coins className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white">
                {isVip ? '👑 VIP Pass Active — Unlimited Streaming' : `🎟️ You have ${tokenCount} ${tokenCount === 1 ? 'Free Token' : 'Free Tokens'} Remaining`}
              </span>
              {!isVip && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  Complimentary Gift
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {isVip
                ? 'Your VIP membership allows unlimited streaming with zero token deductions across all festival selections.'
                : 'Each token unlocks 1 full-length festival short film with high-definition cinema playback.'}
            </p>
          </div>
        </div>

        {/* Action button & dismiss */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {!isVip && (
            <a
              href="#packages"
              className="gold-btn py-1.5 px-3.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-gold-glow"
            >
              <Sparkles className="w-3.5 h-3.5" /> Get Unlimited (50% OFF)
            </a>
          )}
          
          <button
            onClick={handleDismiss}
            title="Dismiss banner"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
