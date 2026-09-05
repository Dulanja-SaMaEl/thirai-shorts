"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Shield, Award, Lock, Mail, KeyRound, Film, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? searchParams.get('redirect') : null;

  const { login } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await login(emailOrUsername, password);
      if (res.success) {
        const userRole = res.user?.role;
        const userEmail = (res.user?.email || emailOrUsername).toLowerCase();

        // Common Login Auto-Routing based on user role and email
        if (userRole === 'admin' || userEmail.includes('admin')) {
          router.push('/admin');
        } else if (userRole === 'judge' || userEmail.includes('judge')) {
          router.push('/judge');
        } else {
          // Standard Viewer / Audience
          if (redirectPath && redirectPath !== '/admin' && redirectPath !== '/judge') {
            router.push(redirectPath);
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        setErrorMsg(res.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid credentials. Please check your email/username and password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'admin') {
      setEmailOrUsername('admin@thiraiplus.com');
      setPassword('Admin@123456');
    } else if (role === 'judge') {
      setEmailOrUsername('judge@thiraiplus.com');
      setPassword('Judge@123456');
    } else {
      setEmailOrUsername('viewer@thiraiplus.com');
      setPassword('Viewer@123456');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md bg-surface-card border border-gold-500/40 rounded-3xl p-8 shadow-gold-glow-lg glass-panel space-y-6">
        
        {/* Thirai+ Wordmark Logo Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center">
            <img
              src="/images/logo-icon.png"
              alt="Thirai+"
              className="w-24 h-24 object-contain mx-auto drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]"
            />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Thirai+ Portal Login</h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Common sign in for audience viewers, jury panel judges, and festival administrators.
          </p>
        </div>

        {/* Quick Demo Credentials Autofill Helper */}
        <div className="p-3.5 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300 space-y-2">
          <div className="flex items-center justify-between font-semibold text-white">
            <span className="flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Demo Quick Access
            </span>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Auto-route by role</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('viewer')}
              className="py-1.5 px-2 bg-black/60 border border-gold-500/40 rounded-lg text-[11px] hover:bg-gold-500/20 text-gold-300 font-bold text-center transition-colors"
            >
              🍿 Viewer
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('judge')}
              className="py-1.5 px-2 bg-black/60 border border-gold-500/40 rounded-lg text-[11px] hover:bg-gold-500/20 text-gold-300 font-bold text-center transition-colors"
            >
              🎬 Judge
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="py-1.5 px-2 bg-black/60 border border-gold-500/40 rounded-lg text-[11px] hover:bg-gold-500/20 text-gold-300 font-bold text-center transition-colors"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Unified Common Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="your.email@example.com or username"
                className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
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

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-btn py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow mt-2"
          >
            {loading ? 'Verifying Credentials...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-3 border-t border-zinc-800/80 space-y-2">
          <p className="text-xs text-zinc-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-gold-400 hover:underline font-bold">
              Register & get 2 free tokens
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-bold text-gold-400">Loading Portal Authentication...</div>}>
      <LoginForm />
    </Suspense>
  );
}
