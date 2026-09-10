"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clapperboard, Sparkles, Check, Crown, X, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function SubmitterPerksModal() {
  const { user, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [submitterData, setSubmitterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Only check if user is logged in and not already on an active VIP plan
    if (user && user.subscription_status !== 'active') {
      checkSubmitterStatus();
    }
  }, [user?.email, user?.subscription_status]);

  const checkSubmitterStatus = async () => {
    try {
      const res = await api.get('/movies/my/is-submitter');
      if (res.data?.success && res.data?.is_submitter) {
        setSubmitterData(res.data);
        
        // Show popup once per session on login/visit
        const hasDismissed = sessionStorage.getItem(`thirai_submitter_pop_${user.id}`);
        if (!hasDismissed) {
          setIsOpen(true);
        }
      }
    } catch (e) {
      // Non-blocking check
    }
  };

  const handleClose = () => {
    if (user) {
      sessionStorage.setItem(`thirai_submitter_pop_${user.id}`, 'true');
    }
    setIsOpen(false);
  };

  const handleSubscribe = async (tier) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post('/packages/subscribe', { package_id: tier });
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Filmmaker VIP Pass activated!');
        await refreshUser();
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setErrorMsg(res.data.error || 'Failed to activate pass.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-surface-card border-2 border-gold-500/70 rounded-3xl p-6 sm:p-8 shadow-gold-glow-lg glass-panel space-y-6 text-white overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Banner with Director Icon */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-black uppercase tracking-wider">
              <Clapperboard className="w-3.5 h-3.5 text-gold-400" /> Official Film Submitter Privilege
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome Filmmaker! 🎬
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
              {submitterData?.film_title ? (
                <>
                  Thank you for submitting <strong className="text-gold-400">"{submitterData.film_title}"</strong>. As a recognized festival creator, you unlock our lowest exclusive VIP rate!
                </>
              ) : (
                'Because you submitted a short film to Thirai+, you unlock our exclusive Filmmaker VIP Streaming pass at our deepest discount!'
              )}
            </p>
          </div>

          {/* Pricing Options Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Monthly Option: $2.99 */}
            <div className="p-5 rounded-2xl bg-black/60 border border-zinc-800 hover:border-gold-500/50 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Monthly Filmmaker Pass
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-zinc-500 line-through">$4.99</span>
                  <span className="text-3xl font-black text-white font-mono">$2.99</span>
                  <span className="text-[11px] text-zinc-400">/ mo</span>
                </div>
                <p className="text-[10px] text-gold-400 font-semibold">
                  Approx. Rs. 930 LKR / month
                </p>
              </div>

              <ul className="text-[11px] text-zinc-300 space-y-1.5 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Unlimited festival streaming</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Zero token deductions</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Community jury voting</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('submitter_monthly')}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
              >
                {loading ? 'Activating...' : 'Select Monthly ($2.99)'}
              </button>
            </div>

            {/* Yearly Option: $29.99 (Best Value) */}
            <div className="relative p-5 rounded-2xl bg-gradient-to-b from-gold-950/40 to-black border-2 border-gold-500 shadow-gold-glow flex flex-col justify-between space-y-4">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gold-gradient text-black text-[9px] font-black uppercase tracking-wider">
                Best Value • Save 50%
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-gold-300">
                  Annual Filmmaker Pass
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-zinc-500 line-through">$59.99</span>
                  <span className="text-3xl font-black text-white font-mono">$29.99</span>
                  <span className="text-[11px] text-zinc-400">/ yr</span>
                </div>
                <p className="text-[10px] text-gold-400 font-semibold">
                  Approx. Rs. 9,300 LKR / year
                </p>
              </div>

              <ul className="text-[11px] text-zinc-200 space-y-1.5 pt-2 border-t border-gold-500/20">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-gold-400 shrink-0" />
                  <span>Full 12 months unlimited access</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-gold-400 shrink-0" />
                  <span>Director dossiers & press kits</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-gold-400 shrink-0" />
                  <span>Official Submitter VIP badge</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('submitter_yearly')}
                disabled={loading}
                className="w-full gold-btn py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-gold-glow"
              >
                {loading ? 'Activating...' : 'Select Annual ($29.99)'}
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold">
              ✓ {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-center">
              {errorMsg}
            </div>
          )}

          {/* Footer note & Dismiss */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1 text-gold-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 1-Click activation, cancel anytime
            </span>
            <button
              onClick={handleClose}
              className="text-zinc-400 hover:text-zinc-200 underline"
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
