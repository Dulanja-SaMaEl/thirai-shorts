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
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                isActive('/')
                  ? 'text-white border-b-2 border-gold-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t('nav.officialSelections', 'Official Selections')}
            </Link>

            <Link
              href="/nominations"
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                isActive('/nominations') || isActive('/awards')
                  ? 'text-white border-b-2 border-gold-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t('nav.nominations', 'Nominations')}
            </Link>

            <a
              href="/#packages"
              className="px-3 py-1.5 text-xs font-semibold tracking-wide text-zinc-400 hover:text-white transition-colors"
            >
              {t('nav.vipPasses', 'VIP Passes')}
            </a>

            <Link
              href="/judges"
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                isActive('/judges') || isActive('/jury')
                  ? 'text-white border-b-2 border-gold-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t('nav.jury', 'Jury')}
            </Link>

            <Link
              href="/faq"
              className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                isActive('/faq')
                  ? 'text-white border-b-2 border-gold-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t('nav.faq', 'FAQ')}
            </Link>

            {/* Role-Gated Navigation Links */}
            {user && user.role === 'viewer' && (
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                  isActive('/dashboard')
                    ? 'text-white border-b-2 border-gold-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t('nav.dashboard', 'Dashboard')}
              </Link>
            )}

            {user && (user.role === 'judge' || user.email?.includes('judge')) && (
              <Link
                href="/judge"
                className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                  isActive('/judge')
                    ? 'text-gold-400 border-b-2 border-gold-400'
                    : 'text-gold-400/80 hover:text-gold-300'
                }`}
              >
                {t('nav.judgePanel', 'Judge Panel')}
              </Link>
            )}

            {user && (user.role === 'admin' || user.email?.includes('admin')) && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                  isActive('/admin')
                    ? 'text-gold-400 border-b-2 border-gold-400'
                    : 'text-gold-400/80 hover:text-gold-300'
                }`}
              >
                {t('nav.adminPortal', 'Admin Portal')}
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-card border border-white/[0.08] hover:border-gold-500/40 text-gold-400 text-xs font-medium transition-colors"
              >
                <Coins className="w-3.5 h-3.5" />
                <span className="font-mono">{user.tokens_balance ?? 2}</span>
                <span className="hidden sm:inline">{user.tokens_balance === 1 ? t('nav.token', 'Token') : t('nav.tokens', 'Tokens')}</span>
              </Link>

              {/* User Profile Info Pill */}
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-card border border-white/[0.08] hover:border-white/[0.16] transition-colors"
              >
                <img
                  src={user.profile_pic_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.full_name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-white line-clamp-1 max-w-[110px]">{user.full_name}</span>
              </Link>

              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-lg bg-surface-card border border-white/[0.08] hover:border-white/[0.16] text-zinc-400 hover:text-white text-xs transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
              >
                {t('nav.signIn', 'Sign In')}
              </Link>
            </div>
          )}

          {/* Submit Film CTA Button */}
          <Link
            href="/upload"
            className="gold-btn px-3.5 py-2 rounded-lg text-xs tracking-wider uppercase font-bold flex items-center gap-1.5 shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('nav.submit', 'Submit Film')}</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="xl:hidden p-2 rounded-lg bg-surface-card border border-white/[0.08] text-zinc-300 hover:text-white transition-colors ml-1"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-white/[0.08] bg-[#090B10] px-5 py-5 space-y-4">
          
          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-xs font-semibold text-zinc-400">Language</span>
            <LanguageSwitcher />
          </div>

          {/* Navigation Links List */}
          <nav className="space-y-1">
            <Link
              href="/"
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/') ? 'text-gold-400 bg-white/[0.04]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>{t('nav.officialSelections', 'Official Selections')}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </Link>

            <Link
              href="/nominations"
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/nominations') || isActive('/awards') ? 'text-gold-400 bg-white/[0.04]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>{t('nav.nominations', 'Nominations')}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </Link>

            <a
              href="/#packages"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <span>{t('nav.vipPasses', 'VIP Passes')}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </a>

            <Link
              href="/judges"
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/judges') || isActive('/jury') ? 'text-gold-400 bg-white/[0.04]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>{t('nav.jury', 'Jury')}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </Link>

            <Link
              href="/faq"
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/faq') ? 'text-gold-400 bg-white/[0.04]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>{t('nav.faq', 'FAQ')}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            </Link>

            {/* Role Links */}
            {user && (
              <div className="pt-2 border-t border-white/[0.06] space-y-1">
                <Link
                  href="/dashboard"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/dashboard') ? 'text-gold-400 bg-white/[0.04]' : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>Dashboard & Wallet</span>
                  <span className="font-mono text-gold-400 text-xs">{user.tokens_balance ?? 2} Tokens</span>
                </Link>

                {(user.role === 'judge' || user.email?.includes('judge')) && (
                  <Link
                    href="/judge"
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-gold-400 hover:bg-white/[0.04]"
                  >
                    <span>Judge Panel</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gold-400" />
                  </Link>
                )}

                {(user.role === 'admin' || user.email?.includes('admin')) && (
                  <Link
                    href="/admin"
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-gold-400 hover:bg-white/[0.04]"
                  >
                    <span>Admin Portal</span>
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
                className="flex-1 py-2.5 rounded-lg bg-surface-card border border-white/[0.1] text-white text-xs font-semibold text-center"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex-1 py-2.5 rounded-lg bg-gold-500 text-black text-xs font-bold text-center"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

