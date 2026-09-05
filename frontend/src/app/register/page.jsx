"use client";

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Film, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(fullName, email, password);
      if (res.success) {
        // Direct new user to their dashboard with their 2 free tokens ready
        router.push('/dashboard?welcome=true');
      } else {
        setErrorMsg(res.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-surface-card border border-gold-500/40 rounded-3xl p-8 shadow-gold-glow-lg glass-panel space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            <img
              src="/images/logo-icon.png"
              alt="Thirai+"
              className="w-20 h-20 object-contain mx-auto drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]"
            />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Viewer Account</h2>
          <p className="text-xs text-zinc-400">
            Join the festival audience and stream official short film selections.
          </p>
        </div>

        {/* 2 FREE TOKENS GIFT BANNER */}
        <div className="p-4 rounded-2xl bg-gold-gradient text-black shadow-gold-glow flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider">🎉 Welcome Gift: 2 Free Tokens</h4>
            <p className="text-[11px] font-semibold text-black/85 leading-tight mt-0.5">
              Every new registration receives 2 tokens to unlock and view 2 short movies for free!
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maya Chen"
                className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Password <span className="text-zinc-500">(min 6 characters)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-btn py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow mt-2"
          >
            {loading ? 'Creating Account & Allocating Tokens...' : 'Register & Claim 2 Free Tokens'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Existing account link */}
        <div className="text-center pt-3 border-t border-zinc-800/80 space-y-2">
          <p className="text-xs text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-400 hover:underline font-bold">
              Log In here
            </Link>
          </p>
          <div>
            <Link href="/" className="text-[11px] text-zinc-500 hover:text-gold-400">
              ← Return to Public Film Gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-bold text-gold-400">Loading Registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
