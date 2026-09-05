"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Shield, Award, Lock, Mail, KeyRound, Film, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? (searchParams.get('redirect') || '/admin') : '/admin';

  const { login } = useAuth();

  const [roleMode, setRoleMode] = useState(
    redirectPath.includes('judge') ? 'judge' : (redirectPath.includes('admin') ? 'admin' : 'viewer')
  );
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
        if (redirectPath && redirectPath !== '/admin' && redirectPath !== '/judge') {
          router.push(redirectPath);
        } else if (res.user.role === 'admin') {
          router.push('/admin');
        } else if (res.user.role === 'judge') {
          router.push('/judge');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid credentials or connection error.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (targetRole) => {
    setRoleMode(targetRole);
    if (targetRole === 'admin') {
      setEmailOrUsername('admin@thiraiplus.com');
      setPassword('Admin@123456');
    } else if (targetRole === 'judge') {
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
          <h2 className="text-xl font-bold text-white tracking-tight">Thirai+ Portal Login</h2>
          <p className="text-xs text-zinc-400">
            Sign in to access your cinema tokens, judging queue, or festival administration.
          </p>
        </div>

        {/* Role Mode Selector */}
        <div className="grid grid-cols-3 gap-1.5 bg-black border border-zinc-800 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setRoleMode('viewer');
              setEmailOrUsername('');
              setPassword('');
            }}
            className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
              roleMode === 'viewer'
                ? 'bg-gold-gradient text-black shadow-gold-glow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> Audience
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleMode('judge');
              setEmailOrUsername('');
              setPassword('');
            }}
            className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
              roleMode === 'judge'
                ? 'bg-gold-gradient text-black shadow-gold-glow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Jury Judge
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleMode('admin');
              setEmailOrUsername('');
              setPassword('');
            }}
            className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
              roleMode === 'admin'
                ? 'bg-gold-gradient text-black shadow-gold-glow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin
          </button>
        </div>

        {/* Quick Demo Credentials Autofill Helper */}
        <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300">
          <div className="flex items-center justify-between mb-1.5 font-semibold text-white">
            <span>⚡ Demo Accounts</span>
            <span className="text-[10px] text-zinc-400 uppercase">Click to fill</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoCredentials('viewer')}
              className="py-1.5 px-2 bg-black/60 border border-gold-500/40 rounded-lg text-[10px] hover:bg-gold-500/20 text-gold-300 font-mono text-center font-bold"
            >
              🍿 Viewer
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('judge')}
              className="py-1.5 px-2 bg-black/60 border border-gold-500/40 rounded-lg text-[10px] hover:bg-gold-500/20 text-gold-300 font-mono text-center font-bold"
            >
              🎬 Judge
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="py-1.5 px-2 bg-black/60 border border-gold-500/40 rounded-lg text-[10px] hover:bg-gold-500/20 text-gold-300 font-mono text-center font-bold"
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

        {/* Login Form */}
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
                placeholder={roleMode === 'admin' ? 'admin@thiraiplus.com' : 'judge@thiraiplus.com'}
                className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-gold-500"
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
                className="w-full bg-black/80 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-btn py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow mt-2"
          >
            {loading ? 'Authenticating...' : `Log In to ${roleMode === 'admin' ? 'Admin Portal' : (roleMode === 'judge' ? 'Judge Panel' : 'Audience Portal')}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-3 border-t border-zinc-800 space-y-2">
          <p className="text-xs text-zinc-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-gold-400 hover:underline font-bold">
              Register & get 2 free tokens
            </Link>
          </p>
          <div>
            <Link href="/" className="text-[11px] text-zinc-500 hover:text-gold-400">
              ← Return to Public Gallery
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
