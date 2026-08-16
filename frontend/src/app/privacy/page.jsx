"use client";

import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Page Header */}
      <div className="bg-surface-card border border-gold-500/30 rounded-3xl p-8 text-center space-y-3 glass-panel shadow-gold-glow">
        <div className="w-14 h-14 rounded-2xl bg-gold-gradient p-0.5 shadow-gold-glow mx-auto flex items-center justify-center">
          <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
            <Shield className="w-7 h-7 text-gold-400" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Privacy Policy & Data Security</h1>
        <p className="text-xs text-zinc-400 max-w-xl mx-auto">
          Thirai+ is committed to protecting director intellectual property, personal submitter details, and anti-spam community voting integrity.
        </p>
        <span className="inline-block text-[11px] font-mono text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30">
          Last Updated: August 2026
        </span>
      </div>

      {/* Policy Sections */}
      <div className="space-y-6 text-xs text-zinc-300 leading-relaxed">
        
        <section className="bg-surface-card border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-gold-400" /> 1. Information Collection & Director Assets
          </h2>
          <p>
            When submitting short films to Thirai+, we collect essential details including your full name, email address, phone number, film metadata, poster artwork, and video media uploaded directly to our secure Cloudflare R2 object storage.
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
            <li>Payment details are handled exclusively via Stripe PCI-DSS compliant checkout.</li>
            <li>Raw video files are accessible only for festival moderation, official judging, and public gallery streaming.</li>
          </ul>
        </section>

        <section className="bg-surface-card border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-gold-400" /> 2. Community Voting Anti-Spam Protection
          </h2>
          <p>
            To maintain strict voting fairness during public rating windows, we utilize an OTP (One-Time Password) email verification framework. We automatically block temporary/disposable email domain providers to eliminate automated bot voting.
          </p>
        </section>

        <section className="bg-surface-card border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-400" /> 3. Intellectual Property Rights
          </h2>
          <p>
            Filmmakers retain 100% full ownership of their copyrighted films. By submitting to Thirai+, you grant the platform a non-exclusive license to stream your short film in the festival gallery and display promotional stills.
          </p>
        </section>

        <section className="bg-surface-card border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-gold-400" /> 4. Data Retention & Erasure
          </h2>
          <p>
            Filmmakers may request complete deletion of their video streams and personal records at any time by contacting our festival administration team.
          </p>
        </section>

      </div>

      <div className="text-center pt-4">
        <Link href="/" className="gold-btn py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2">
          ← Return to Public Gallery
        </Link>
      </div>
    </div>
  );
}
