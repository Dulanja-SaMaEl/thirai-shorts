"use client";

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-gold-500/20 bg-black/95 py-8 px-6 text-center text-xs text-zinc-500 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/images/logo-wordmark.png" alt="Thirai+" className="h-6 w-auto object-contain" />
          <span>{t('footer.copyright', '© 2026 Thirai+ Short Film Festival. All Rights Reserved.')}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400">
          <Link href="/judges" className="hover:text-gold-400 transition-colors">
            {t('footer.meetTheJury', 'Meet the Jury')}
          </Link>
          <Link href="/jury-guidelines" className="hover:text-gold-400 transition-colors">
            {t('footer.juryGuidelines', 'Jury Guidelines')}
          </Link>
          <Link href="/faq" className="hover:text-gold-400 transition-colors">
            {t('footer.faq', 'FAQ')}
          </Link>
          <Link href="/privacy" className="hover:text-gold-400 transition-colors">
            {t('footer.privacyPolicy', 'Privacy Policy')}
          </Link>
          <Link href="/terms" className="hover:text-gold-400 transition-colors">
            {t('footer.termsOfSubmission', 'Terms of Submission')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
