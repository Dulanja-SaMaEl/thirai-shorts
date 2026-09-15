"use client";

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { Film, Award, Trophy, Shield, HelpCircle, Sparkles, ExternalLink, Globe } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-white/[0.08] bg-[#050608] py-16 px-4 sm:px-8 lg:px-12 text-xs text-zinc-400 mt-20">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Col 1 & 2: Brand, Identity & Mission */}
          <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-8">
            <Link href="/" className="inline-block group">
              <img
                src="/images/logo-wordmark.png"
                alt="Thirai+"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-md font-normal">
              Thirai+ is the premier South Asian and international independent short film festival & streaming platform. Empowering visionary filmmakers through blind jury scoring, 4K R2 cloud screening, and global audience discovery.
            </p>

            <div className="pt-2 flex items-center gap-2.5 text-zinc-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gold-500/10 border border-gold-500/20 text-gold-400 font-mono text-[11px] font-medium">
                Season 2026-2027
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-zinc-400 font-mono text-[11px]">
                <Globe className="w-3 h-3 text-zinc-400" /> Global Screenings
              </span>
            </div>
          </div>

          {/* Col 3: Discover & Screen */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Discover & Stream
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <span>Official Selections</span>
                </Link>
              </li>
              <li>
                <Link href="/nominations" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <span>Festival Nominations</span>
                </Link>
              </li>
              <li>
                <Link href="/awards" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <span>Annual 22 Laurels</span>
                </Link>
              </li>
              <li>
                <a href="/#packages" className="hover:text-gold-400 transition-colors flex items-center gap-1.5">
                  <span>VIP Passes & Access</span>
                </a>
              </li>
              <li>
                <Link href="/upload" className="text-gold-400 hover:text-gold-300 font-bold transition-colors flex items-center gap-1">
                  <span>Submit Short Film →</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Jury & Industry */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Jury & Evaluation
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/judges" className="hover:text-gold-400 transition-colors">
                  {t('footer.meetTheJury', 'Meet the Grand Jury')}
                </Link>
              </li>
              <li>
                <Link href="/jury-guidelines" className="hover:text-gold-400 transition-colors">
                  {t('footer.juryGuidelines', 'Jury Scoring Rubric')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold-400 transition-colors">
                  {t('footer.faq', 'Festival Help & FAQ')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gold-400 transition-colors">
                  {t('footer.termsOfSubmission', 'Terms of Submission')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gold-400 transition-colors">
                  {t('footer.privacyPolicy', 'Privacy & Data Policy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Filmmaker Portal */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Creator Space
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/dashboard" className="hover:text-gold-400 transition-colors">
                  Director Analytics Console
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-gold-400 transition-colors">
                  Audience Token Wallet
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-gold-400 transition-colors">
                  Sign In to Account
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-gold-400 transition-colors">
                  Register (2 Free Tokens)
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Standards */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            <span>{t('footer.copyright', '© 2026-2027 THIRAI+ Independent Short Film Festival. All Rights Reserved.')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <span>High-Bitrate Cinema Cloud Infrastructure</span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span>English • Sinhala • Tamil</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

