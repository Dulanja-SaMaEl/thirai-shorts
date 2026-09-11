"use client";

import { useState } from 'react';
import {
  HelpCircle,
  Video,
  Trophy,
  Upload,
  Calendar,
  CreditCard,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Film
} from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqItems = [
    {
      category: "Brand Partnerships & Video Content",
      icon: Video,
      question: "How are brand partner, promotional, and sponsor videos added to Thirai+?",
      answer: "Videos will be added by BrandPartner. All promotional, brand showcase, and sponsored cinema segments are uploaded and managed directly by our verified BrandPartner network through their dedicated distribution pipeline.",
      highlight: "Videos will be added by BrandPartner."
    },
    {
      category: "Festival Nominations & Awards",
      icon: Trophy,
      question: "When are official nominations unveiled?",
      answer: "Official festival nominations will be unveiled after January 1st, 2027. Ahead of January 1st, our Grand Jury evaluations and verified community audience rating rounds remain active. The full official shortlist is revealed on New Year's Day.",
      highlight: "Nominations will be visible and unveiled after January 1st."
    },
    {
      category: "Festival Nominations & Awards",
      icon: Trophy,
      question: "How many films are nominated per award category?",
      answer: "Each of the 22 festival award categories showcases exactly 3 nominated films shortlisted from thousands of global submissions. Category winners are crowned during the Grand Premiere Gala.",
      highlight: "Each category showcases 3 nominated films."
    },
    {
      category: "Film Submissions",
      icon: Upload,
      question: "How do filmmakers submit short films, and where is the submit button?",
      answer: "Filmmakers can submit their films by clicking the golden 'SUBMIT' button located on the top right side of the navigation bar. You will be prompted to provide film details, cast & crew metadata, and upload your high-definition video master file.",
      highlight: "Submissions close November 30, 2026."
    },
    {
      category: "Festival Schedule & Dates",
      icon: Calendar,
      question: "What are the key dates for the Thirai+ Short Film Festival 2026/2027?",
      answer: "Important festival milestones include: Submissions Deadline on November 30, 2026; Official Nominations Unveil on January 1, 2027; and the Global Festival Premiere & Grand Gala on January 16, 2027.",
      highlight: "Premiere: January 16, 2027"
    },
    {
      category: "Audience & Submitter Passes",
      icon: CreditCard,
      question: "What passes are available for viewers and filmmakers?",
      answer: "The Viewer Pass is $4.99 monthly for unlimited streaming of all festival short films and voting rights. If you have submitted your short film for the T+ Film Festival and got approved, you gain access to the Submitter Pass at just $2.99 monthly to stream unlimited movies and vote.",
      highlight: "Viewer Pass: $4.99/mo • Submitter Pass: $2.99/mo (Approved Filmmakers)"
    },
    {
      category: "Trailers & Free Streaming",
      icon: Film,
      question: "Can anyone watch movie trailers without costing tokens?",
      answer: "Yes! Trailers can be watched by anyone completely free without costing any viewing tokens or requiring a subscription. Directors can optionally add a trailer when submitting their film.",
      highlight: "Anyone can watch trailers for movies without costing any tokens."
    },
    {
      category: "Jury & Rating System",
      icon: ShieldCheck,
      question: "How does the hybrid judging & rating process work?",
      answer: "Thirai+ combines Grand Jury evaluation (70% weightage) with community audience ratings (30% weightage) verified via cryptographic blockchain tokens to ensure unbiased, transparent cinematic recognition.",
      highlight: "70% Grand Jury + 30% Verified Audience Votes"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-10">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-gold-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cinema Home
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Festival Help Center
        </span>
      </div>

      {/* Page Header */}
      <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black border border-gold-500/40 shadow-gold-glow text-center space-y-4 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-14 h-14 rounded-2xl bg-gold-gradient p-0.5 shadow-gold-glow mx-auto flex items-center justify-center">
          <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
            <HelpCircle className="w-7 h-7 text-gold-400" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Frequently Asked <span className="gold-text-gradient">Questions</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Find comprehensive answers regarding brand partnerships, nomination unveil dates, short film submissions, and festival passes.
        </p>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-4">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          const Icon = item.icon;

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'bg-zinc-950/90 border-gold-500/50 shadow-gold-glow'
                  : 'bg-surface-card/70 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                    isOpen ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400/80 block mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {item.question}
                    </h3>
                  </div>
                </div>

                <div className={`p-1.5 rounded-lg border transition-transform duration-300 shrink-0 ${
                  isOpen ? 'rotate-180 bg-gold-500/10 border-gold-500/40 text-gold-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 sm:px-6 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-850 space-y-3">
                  <p className="pt-3">{item.answer}</p>

                  {item.highlight && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                      <span>{item.highlight}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Brand Partner Notice Callout */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-zinc-950 via-surface-card to-zinc-950 border border-gold-500/30 text-center space-y-2">
        <h4 className="text-xs uppercase font-extrabold tracking-wider text-gold-400">
          Brand Partnerships & Media Relations
        </h4>
        <p className="text-xs text-zinc-400 max-w-lg mx-auto">
          Official partner spotlight segments and sponsored trailers: <strong>Videos will be added by BrandPartner</strong>. For commercial inquiries, contact our festival relations desk.
        </p>
      </div>

    </div>
  );
}
