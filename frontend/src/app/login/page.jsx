"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Shield, Award, Lock, Mail, KeyRound, Film, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const { login } = useAuth();

  const [roleMode, setRoleMode] = useState(redirectPath.includes('judge') ? 'judge' : 'admin');
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
        if (res.user.role === 'admin') {
          router.push('/admin');
        } else if (res.user.role === 'judge') {
          router.push('/judge');
        } else {
          router.push('/');
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
    } else {
      setEmailOrUsername('judge@thiraiplus.com');
      setPassword('Judge@123456');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md bg-surface-card border border-gold-500/40 rounded-3xl p-8 shadow-gold-glow-lg glass-panel space-y-6">
        
        {/* Thirai+ Wordmark Logo Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-gradient p-0.5 shadow-gold-glow flex items-center justify-center">
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                <Film className="w-6 h-6 text-gold-400" />
              </div>
            </div>
            <span className="text-3xl font-extrabold tracking-wider font-mono text-white">
              THIRAI<span className="gold-text-gradient">+</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Portal Authentication</h2>
          <p className="text-xs text-zinc-400">
            Secure login portal for Executive Admins & Jury Panel Members.
          </p>
        </div>

        {/* Role Mode Selector */}
        <div className="grid grid-cols-2 gap-2 bg-black border border-zinc-800 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setRoleMode('admin')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              roleMode === 'admin'
                ? 'bg-gold-gradient text-black shadow-gold-glow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" /> Admin Portal
          </button>

          <button
            type="button"
            onClick={() => setRoleMode('judge')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              roleMode === 'judge'
                ? 'bg-gold-gradient text-black shadow-gold-glow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" /> Judge Portal
          </button>
        </div>

        {/* Quick Demo Credentials Autofill Helper */}
        <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300">
          <div className="flex items-center justify-between mb-1.5 font-semibold text-white">
            <span>⚡ Demo Credentials Setup</span>
            <span className="text-[10px] text-zinc-400 uppercase">Click to fill</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="flex-1 py-1.5 px-2 bg-black/60 border border-gold-500/40 rounded-lg text-[11px] hover:bg-gold-500/20 text-gold-300 font-mono text-center"
            >
              👑 Fill Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('judge')}
              className="flex-1 py-1.5 px-2 bg-black/60 border border-gold-500/40 rounded-lg text-[11px] hover:bg-gold-500/20 text-gold-300 font-mono text-center"
            >
              🎬 Fill Judge
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
            {loading ? 'Authenticating...' : `Log In to ${roleMode === 'admin' ? 'Admin' : 'Judge'} Portal`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-800">
          <Link href="/" className="text-xs text-zinc-400 hover:text-gold-400">
            ← Return to Public Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
