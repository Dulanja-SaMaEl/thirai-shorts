"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import {
  Film, Shield, Award, Upload, PlayCircle, LogIn, LogOut,
  User, Coins, LayoutDashboard, Sparkles, Trophy, HelpCircle,
  Menu, X, ChevronRight, Compass
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#07080B]/85 backdrop-blur-xl border-b border-white/[0.07] transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-18 sm:h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group relative py-1">
            <img
              src="/images/logo-wordmark.png"
              alt="Thirai+"
              className="h-8 sm:h-9 w-auto object-contain transition-all duration-300 group-hover:brightness-110 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                isActive('/')
                  ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 shadow-[0_0_15px_rgba(229,169,60,0.15)]'
                  : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <PlayCircle className={`w-3.5 h-3.5 ${isActive('/') ? 'text-gold-400' : 'text-zinc-400'}`} />
              <span>{t('nav.officialSelections', 'Official Selections')}</span>
            </Link>

            <Link
              href="/nominations"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                isActive('/nominations') || isActive('/awards')
                  ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 shadow-[0_0_15px_rgba(229,169,60,0.15)]'
                  : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Trophy className={`w-3.5 h-3.5 ${isActive('/nominations') || isActive('/awards') ? 'text-gold-400' : 'text-zinc-400'}`} />
              <span>{t('nav.nominations', 'Nominations')}</span>
            </Link>

            <a
              href="/#packages"
              className="px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-all duration-200 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>{t('nav.vipPasses', 'VIP Passes')}</span>
            </a>

            <Link
              href="/judges"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                isActive('/judges') || isActive('/jury')
                  ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 shadow-[0_0_15px_rgba(229,169,60,0.15)]'
                  : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${isActive('/judges') || isActive('/jury') ? 'text-gold-400' : 'text-zinc-400'}`} />
              <span>{t('nav.jury', 'Jury')}</span>
            </Link>

            <Link
              href="/faq"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                isActive('/faq')
                  ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 shadow-[0_0_15px_rgba(229,169,60,0.15)]'
                  : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <HelpCircle className={`w-3.5 h-3.5 ${isActive('/faq') ? 'text-gold-400' : 'text-zinc-400'}`} />
              <span>{t('nav.faq', 'FAQ')}</span>
            </Link>

            {/* Role-Gated Navigation Links */}
            {user && user.role === 'viewer' && (
              <Link
                href="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                  isActive('/dashboard')
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 shadow-[0_0_15px_rgba(229,169,60,0.15)]'
                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-gold-400" />
                <span>{t('nav.dashboard', 'Dashboard')}</span>
              </Link>
            )}

            {user && (user.role === 'judge' || user.email?.includes('judge')) && (
              <Link
                href="/judge"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                  isActive('/judge')
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 shadow-[0_0_15px_rgba(229,169,60,0.15)]'
                    : 'text-gold-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-gold-400" />
                <span>{t('nav.judgePanel', 'Judge Panel')}</span>
              </Link>
            )}

            {user && (user.role === 'admin' || user.email?.includes('admin')) && (
              <Link
                href="/admin"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                  isActive('/admin')
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 shadow-[0_0_15px_rgba(229,169,60,0.15)]'
                    : 'text-gold-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-gold-400" />
                <span>{t('nav.adminPortal', 'Admin Portal')}</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right: Controls, Auth & CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* 3-Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Token Wallet Badge */}
              <Link
                href="/dashboard"
                title="View your token wallet in Dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 text-gold-300 text-xs font-bold transition-all shadow-[0_0_12px_rgba(229,169,60,0.15)]"
              >
                <Coins className="w-3.5 h-3.5 text-gold-400" />
                <span className="font-mono">{user.tokens_balance ?? 2}</span>
                <span className="hidden sm:inline">{user.tokens_balance === 1 ? t('nav.token', 'Token') : t('nav.tokens', 'Tokens')}</span>
              </Link>

              {/* User Profile Info Pill */}
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-card border border-white/[0.08] hover:border-gold-500/40 transition-all duration-200"
              >
                <img
                  src={user.profile_pic_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.full_name}
                  className="w-6 h-6 rounded-full object-cover border border-gold-400/80"
                />
                <div className="text-left">
                  <span className="block text-xs font-bold text-white line-clamp-1 max-w-[110px]">{user.full_name}</span>
                  <span className="block text-[9px] text-gold-400 uppercase font-bold tracking-wider">{user.role}</span>
                </div>
              </Link>

              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-xl bg-surface-card border border-white/[0.08] hover:border-rose-500/50 text-zinc-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">{t('nav.logout', 'Logout')}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/register"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-bold hover:bg-gold-500/20 transition-all shadow-[0_0_12px_rgba(229,169,60,0.12)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>{t('nav.freeTokens', '2 Free Tokens')}</span>
              </Link>

              <Link
                href="/login"
                className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-surface-card border border-white/[0.08] hover:border-gold-500/40 text-zinc-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-gold-400" />
                <span>{t('nav.signIn', 'Sign In')}</span>
              </Link>
            </div>
          )}

          {/* Submit Film CTA Button */}
          <Link
            href="/upload"
            className="gold-btn px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs tracking-wider uppercase flex items-center gap-1.5 shrink-0"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t('nav.submit', 'Submit Film')}</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="xl:hidden p-2 rounded-xl bg-surface-card border border-white/[0.08] text-zinc-300 hover:text-white transition-colors ml-1"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-white/[0.08] bg-[#090B10]/98 backdrop-blur-2xl px-5 py-6 space-y-5 animate-fade-in shadow-2xl">
          
          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Select Language</span>
            <LanguageSwitcher />
          </div>

          {/* Navigation Links List */}
          <nav className="space-y-1.5">
            <Link
              href="/"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/') ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30' : 'text-zinc-300 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PlayCircle className="w-4 h-4 text-gold-400" />
                <span>{t('nav.officialSelections', 'Official Selections ⭐')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>

            <Link
              href="/nominations"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/nominations') || isActive('/awards') ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30' : 'text-zinc-300 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-gold-400" />
                <span>{t('nav.nominations', 'Nominations')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>

            <a
              href="/#packages"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>{t('nav.vipPasses', 'VIP Passes')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </a>

            <Link
              href="/judges"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/judges') || isActive('/jury') ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30' : 'text-zinc-300 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-gold-400" />
                <span>{t('nav.jury', 'Jury Board')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>

            <Link
              href="/faq"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive('/faq') ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30' : 'text-zinc-300 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-gold-400" />
                <span>{t('nav.faq', 'Festival FAQ')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>

            {/* Role Links */}
            {user && (
              <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                <Link
                  href="/dashboard"
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/dashboard') ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30' : 'text-zinc-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-gold-400" />
                    <span>Dashboard & Wallet</span>
                  </div>
                  <span className="font-mono text-gold-400 text-xs font-bold">{user.tokens_balance ?? 2} Tokens</span>
                </Link>

                {(user.role === 'judge' || user.email?.includes('judge')) && (
                  <Link
                    href="/judge"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-gold-300 bg-gold-500/10 border border-gold-500/30"
                  >
                    <div className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-gold-400" />
                      <span>Jury Scoring Console</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gold-400" />
                  </Link>
                )}

                {(user.role === 'admin' || user.email?.includes('admin')) && (
                  <Link
                    href="/admin"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-gold-300 bg-gold-500/10 border border-gold-500/30"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-gold-400" />
                      <span>Festival Admin Portal</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gold-400" />
                  </Link>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Auth Actions */}
          {!user && (
            <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3">
              <Link
                href="/login"
                className="flex-1 py-2.5 rounded-xl bg-surface-card border border-white/[0.1] text-white text-xs font-bold text-center"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex-1 py-2.5 rounded-xl bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-bold text-center flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Register (2 Free)
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

