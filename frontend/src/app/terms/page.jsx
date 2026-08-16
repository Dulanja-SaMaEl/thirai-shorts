"use client";

import { FileText, CheckCircle2, AlertTriangle, DollarSign, Film } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfSubmissionPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Page Header */}
      <div className="bg-surface-card border border-gold-500/30 rounded-3xl p-8 text-center space-y-3 glass-panel shadow-gold-glow">
        <div className="w-14 h-14 rounded-2xl bg-gold-gradient p-0.5 shadow-gold-glow mx-auto flex items-center justify-center">
          <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
            <FileText className="w-7 h-7 text-gold-400" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Terms of Submission & Festival Rules</h1>
        <p className="text-xs text-zinc-400 max-w-xl mx-auto">
          Official entry terms, eligibility requirements, copyright indemnification, and submission guidelines for Thirai+.
        </p>
        <span className="inline-block text-[11px] font-mono text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30">
          Official Festival Bye-Laws 2026
        </span>
      </div>

      {/* Rules Sections */}
      <div className="space-y-6 text-xs text-zinc-300 leading-relaxed">
        
        <section className="bg-surface-card border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-gold-400" /> 1. Eligibility & Film Format Requirements
          </h2>
          <p>
            All submitted short films must not exceed 40 minutes in runtime (including opening and end credits). Submissions are open globally to both independent directors and production studios.
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
            <li>Accepted video formats: MP4, MOV, or WEBM (up to 4K UHD resolution).</li>
            <li>Films in languages other than English must include hardcoded English subtitles.</li>
          </ul>
        </section>

        <section className="bg-surface-card border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold-400" /> 2. Submission Fees & Refund Policy
          </h2>
          <p>
            An official festival entry fee of <strong>Rs. 2,500</strong> is required per film submission to cover jury review honorariums and cloud distribution infrastructure. Submission fees are non-refundable once the film enters jury evaluation.
          </p>
        </section>

        <section className="bg-surface-card border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gold-400" /> 3. Copyright Warranties & Music Clearances
          </h2>
          <p>
            By submitting, the filmmaker warrants that they hold all necessary rights, licenses, and clearances for all audio track usage, visual effects, trademarks, and actor appearances included in the film.
          </p>
        </section>

        <section className="bg-surface-card border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-gold-400" /> 4. Judging & Winner Selection
          </h2>
          <p>
            Official Jury members evaluate entries independently based on our 1-10 numerical rubric. Winning selections are featured prominently on the Thirai+ main homepage showcase and awarded official digital laurels.
          </p>
        </section>

      </div>

      <div className="text-center pt-4">
        <Link href="/submit" className="gold-btn py-3.5 px-8 rounded-xl text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-gold-glow">
          <Film className="w-4 h-4" /> Submit Your Short Film Now
        </Link>
      </div>
    </div>
  );
}
