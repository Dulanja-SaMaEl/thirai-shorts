import './globals.css';
import ClientProviders from '../components/ClientProviders';

import Link from 'next/link';

export const metadata = {
  title: 'Thirai+ | Premier Short Movie Submission & Judging Platform',
  description: 'Submit your cinematic short films to Thirai+, judged by industry leaders with community rating events and direct R2 cloud storage integration.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col justify-between bg-black text-slate-100 antialiased selection:bg-gold-500 selection:text-black">
        <ClientProviders>
          {children}
        </ClientProviders>

        <footer className="border-t border-gold-500/20 bg-black/90 py-8 px-6 text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo-wordmark.png" alt="Thirai+" className="h-6 w-auto object-contain" />
              <span>© 2026 Thirai+ Short Film Festival. All Rights Reserved.</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400">
              <Link href="/privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gold-400 transition-colors">Terms of Submission</Link>
              <Link href="/jury-guidelines" className="hover:text-gold-400 transition-colors">Jury Guidelines</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
