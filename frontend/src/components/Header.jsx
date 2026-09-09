"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Film, Shield, Award, Upload, PlayCircle, LogIn, LogOut, User, Coins, LayoutDashboard, Sparkles, Trophy } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gold-500/20 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/images/logo-wordmark.png"
            alt="Thirai+"
            className="h-9 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/"
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              isActive('/') ? 'text-gold-400 border-b-2 border-gold-400 pb-1' : 'text-zinc-300 hover:text-gold-300'
            }`}
          >
            <PlayCircle className="w-4 h-4" /> Gallery
          </Link>

          <Link
            href="/awards"
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              isActive('/awards') ? 'text-gold-400 border-b-2 border-gold-400 pb-1' : 'text-zinc-300 hover:text-gold-300'
            }`}
          >
            <Trophy className="w-4 h-4 text-gold-400" /> Awards
          </Link>

          <a
            href="/#packages"
            className="flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-gold-300 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-gold-400" /> VIP Passes
          </a>

          <Link
            href="/upload"
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              isActive('/upload') ? 'text-gold-400 border-b-2 border-gold-400 pb-1' : 'text-zinc-300 hover:text-gold-300'
            }`}
          >
            <Upload className="w-4 h-4" /> Submit Film
          </Link>

          {/* Role-Gated Navigation Links: Shown ONLY to authenticated judges/admins/viewers */}
          {user && user.role === 'viewer' && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                isActive('/dashboard') ? 'text-gold-400 border-b-2 border-gold-400 pb-1' : 'text-zinc-300 hover:text-gold-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          )}

          {user && (user.role === 'judge' || user.email?.includes('judge')) && (
            <Link
              href="/judge"
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                isActive('/judge') ? 'text-gold-400 border-b-2 border-gold-400 pb-1' : 'text-gold-300 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-gold-400" /> Judge Panel
            </Link>
          )}

          {user && (user.role === 'admin' || user.email?.includes('admin')) && (
            <Link
              href="/admin"
              className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                isActive('/admin') ? 'text-gold-400 border-b-2 border-gold-400 pb-1' : 'text-gold-300 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-gold-400" /> Admin Portal
            </Link>
          )}
        </nav>

        {/* User Auth Controls & Action Button */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Token Balance Pill */}
              <Link
                href="/dashboard"
                title="View your token wallet in Dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-bold transition-all shadow-gold-glow"
              >
                <Coins className="w-3.5 h-3.5 text-gold-400" />
                <span>{user.tokens_balance ?? 2} {user.tokens_balance === 1 ? 'Token' : 'Tokens'}</span>
              </Link>

              {/* User Profile Info */}
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-card border border-gold-500/30 hover:border-gold-400 transition-colors"
              >
                <img
                  src={user.profile_pic_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.full_name}
                  className="w-6 h-6 rounded-full object-cover border border-gold-400"
                />
                <div className="text-left">
                  <span className="block text-xs font-bold text-white line-clamp-1">{user.full_name}</span>
                  <span className="block text-[9px] text-gold-400 uppercase font-semibold">{user.role}</span>
                </div>
              </Link>

              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-rose-500/50 text-zinc-300 hover:text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/register"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-500/10 border border-gold-500/40 text-gold-300 text-xs font-bold hover:bg-gold-500/20 transition-all shadow-gold-glow"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-400" /> 2 Free Tokens
              </Link>

              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-gold-400 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-gold-400" /> Sign In
              </Link>
            </div>
          )}

          <Link
            href="/upload"
            className="gold-btn px-4 py-2 rounded-xl text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-gold-glow"
          >
            <Upload className="w-4 h-4" /> Submit
          </Link>
        </div>
      </div>
    </header>
  );
}
