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
    <div className="relative overflow-hidden rounded-lg bg-[#141824] border border-gold-500/25 p-3.5 my-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        {/* Left icon & text */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {isVip ? 'VIP Pass Active — Unlimited Festival Streaming' : `Festival Balance: ${tokenCount} ${tokenCount === 1 ? 'Free Token' : 'Free Tokens'} Remaining`}
              </span>
              {!isVip && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gold-500/10 text-gold-400 border border-gold-500/20">
                  Complimentary
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {isVip
                ? 'Your VIP pass grants unlimited streaming access across all official festival selections.'
                : 'Each complimentary token unlocks 1 official festival short film in full resolution.'}
            </p>
          </div>
        </div>

        {/* Action button & dismiss */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {!isVip && (
            <a
              href="#packages"
              className="gold-btn py-1.5 px-3 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-black hover:opacity-95"
            >
              All-Access Passes
            </a>
          )}
          
          <button
            onClick={handleDismiss}
            title="Dismiss banner"
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
