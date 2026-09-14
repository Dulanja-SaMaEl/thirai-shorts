"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Search,
  X,
  Upload,
  CreditCard,
  Calendar,
  ShieldCheck,
  Trophy,
  Film,
  Sparkles,
  Lock,
  ChevronDown,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Clapperboard,
  ArrowRight,
  Zap,
  Tag
} from 'lucide-react';
import { FAQ_CATEGORIES, FAQ_ITEMS } from './faqData';

// Map string icon names to Lucide components
const ICON_MAP = {
  HelpCircle,
  Upload,
  CreditCard,
  Calendar,
  ShieldCheck,
  Trophy,
  Film,
  Sparkles,
  Lock
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState(new Set(['submission-fee', 'viewer-pass-details']));
  const [copiedId, setCopiedId] = useState(null);

  // Deep-link anchor detection on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      const matched = FAQ_ITEMS.find(item => item.id === hashId);
      if (matched) {
        setOpenIds(new Set([hashId]));
        if (matched.category !== 'all') {
          setActiveCategory(matched.category);
        }
        setTimeout(() => {
          const el = document.getElementById(hashId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, []);

  // Filter items based on active category and search query
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return FAQ_ITEMS.filter(item => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      // Search filter
      if (!query) return true;

      const inQuestion = item.question.toLowerCase().includes(query);
      const inAnswer = (item.answerText || '').toLowerCase().includes(query);
      const inCategory = item.categoryLabel.toLowerCase().includes(query);
      const inTags = item.tags && item.tags.some(t => t.toLowerCase().includes(query));

      return inQuestion || inAnswer || inCategory || inTags;
    });
  }, [activeCategory, searchQuery]);

  // Toggle single item accordion
  const toggleItem = (id) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand all / Collapse all
  const handleExpandAll = () => {
    setOpenIds(new Set(filteredItems.map(i => i.id)));
  };

  const handleCollapseAll = () => {
    setOpenIds(new Set());
  };

  // Copy direct anchor link to clipboard
  const handleCopyLink = (e, id) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
      });
    }
  };

  return (
    <main className="min-h-screen bg-black text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cinema Home
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Official Help & FAQ Center
            </span>
          </div>
        </div>

        {/* Hero Header Card */}
        <header className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black border border-gold-500/40 shadow-gold-glow-lg text-center space-y-5 overflow-hidden">
          <div className="absolute -top-20 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-gold-gradient p-0.5 shadow-gold-glow mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-gold-400" />
            </div>
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Frequently Asked <span className="gold-text-gradient">Questions</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Find instant, clear answers on short film submissions ($4.99 fee, 40 min max), festival passes ($4.99 viewer & $2.99 submitter pass), free trailers, hybrid jury judging, and premiere dates.
            </p>
          </div>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto">
            <div className="p-3 rounded-2xl bg-black/60 border border-zinc-800 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Submission Fee</span>
              <strong className="text-sm sm:text-base font-black text-gold-300 font-mono">$4.99 USD</strong>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-zinc-800 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Max Runtime</span>
              <strong className="text-sm sm:text-base font-black text-gold-300 font-mono">40 Minutes</strong>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-zinc-800 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Viewer Pass</span>
              <strong className="text-sm sm:text-base font-black text-gold-300 font-mono">$4.99 / mo</strong>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-zinc-800 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Movie Trailers</span>
              <strong className="text-sm sm:text-base font-black text-emerald-400 font-mono">100% Free</strong>
            </div>
          </div>

          {/* Search Input Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-zinc-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keywords (e.g. 'submission fee', 'trailer', 'runtime', 'pass', 'sinhala', 'jury')..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-black/80 border border-zinc-700 hover:border-gold-500/50 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-xs sm:text-sm text-white placeholder:text-zinc-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  className="absolute right-3.5 p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Category Navigation Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-400">
              Filter by Category:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExpandAll}
                className="text-[11px] font-bold text-zinc-400 hover:text-gold-400 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-900"
              >
                Expand All
              </button>
              <span className="text-zinc-700">•</span>
              <button
                onClick={handleCollapseAll}
                className="text-[11px] font-bold text-zinc-400 hover:text-gold-400 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-900"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {FAQ_CATEGORIES.map((cat) => {
              const Icon = ICON_MAP[cat.icon] || HelpCircle;
              const isSelected = activeCategory === cat.id;
              const count = cat.id === 'all'
                ? FAQ_ITEMS.length
                : FAQ_ITEMS.filter(i => i.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-gold-500/20 border-2 border-gold-400 text-gold-300 shadow-gold-glow'
                      : 'bg-surface-card border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-gold-400' : 'text-zinc-400'}`} />
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-gold-500/30 text-gold-200' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter Notice if Searching */}
        {searchQuery && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400">
            <span>
              Found <strong className="text-gold-300">{filteredItems.length}</strong> matching questions for "{searchQuery}"
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-gold-400 hover:underline"
            >
              Reset Search
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 px-4 rounded-3xl bg-surface-card border border-zinc-800 space-y-4">
            <HelpCircle className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Matching Questions Found</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              We couldn't find any questions matching "{searchQuery}". Try searching with different terms or reset your filters.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
            >
              Show All Questions
            </button>
          </div>
        )}

        {/* FAQ Accordion List */}
        <section aria-label="FAQ Questions List" className="space-y-4">
          {filteredItems.map((item, idx) => {
            const isOpen = openIds.has(item.id);

            return (
              <article
                key={item.id}
                id={item.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden scroll-mt-24 ${
                  isOpen
                    ? 'bg-zinc-950/95 border-gold-500/50 shadow-gold-glow'
                    : 'bg-surface-card/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-surface-card'
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleItem(item.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleItem(item.id); } }}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                  className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold-400/90">
                          <Tag className="w-3 h-3 text-gold-500" /> {item.categoryLabel}
                        </span>
                      </div>

                      <h2 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {item.question}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Direct Copy Link Button */}
                    <button
                      onClick={(e) => handleCopyLink(e, item.id)}
                      title="Copy link to this question"
                      className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-gold-300 transition-colors"
                      aria-label="Copy direct link"
                    >
                      {copiedId === item.id ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-1">
                          <Check className="w-3.5 h-3.5" /> Copied
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Expand/Collapse Chevron */}
                    <div className={`p-1.5 rounded-lg border transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-gold-500/10 border-gold-500/40 text-gold-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Expanded Answer Content */}
                {isOpen && (
                  <div
                    id={`faq-answer-${item.id}`}
                    className="px-5 pb-6 sm:px-6 pt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-850/80 space-y-4"
                  >
                    <p className="pt-2 text-zinc-200">
                      {item.answerText}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      {/* Highlight Takeaway Pill */}
                      {item.highlight && (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                          <span>{item.highlight}</span>
                        </div>
                      )}

                      {/* Optional Action Link */}
                      {item.link && (
                        <Link
                          href={item.link.href}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-white hover:underline transition-colors"
                        >
                          <span>{item.link.text}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {/* Brand Partner Dedicated Notice Callout */}
        <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-zinc-950 via-surface-card to-zinc-950 border border-gold-500/30 text-center space-y-3 shadow-gold-glow">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Brand Partnerships & Official Media
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Official Partner Spotlight & Sponsored Segments
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            All brand showcases, official festival partner reels, and sponsored cinema segments: <strong className="text-gold-300">Videos will be added by BrandPartner</strong> via their verified distribution pipeline.
          </p>
        </section>

        {/* Interactive Quick Action CTAs */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Card 1: Submit a Film */}
          <div className="rounded-3xl p-6 bg-surface-card border border-gold-500/30 flex flex-col justify-between space-y-4 hover:border-gold-500/60 transition-all shadow-gold-glow">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-base font-extrabold text-white">Ready to Submit?</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Submit your short film before November 30th, 2026. $4.99 entry fee, up to 40-minute runtime. English, Sinhala & Tamil accepted.
              </p>
            </div>
            <Link
              href="/upload"
              className="gold-btn py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow"
            >
              <Clapperboard className="w-4 h-4" /> Submit Short Film
            </Link>
          </div>

          {/* Card 2: Festival VIP Passes */}
          <div className="rounded-3xl p-6 bg-surface-card border border-gold-500/30 flex flex-col justify-between space-y-4 hover:border-gold-500/60 transition-all shadow-gold-glow">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-extrabold text-white">Get Festival Passes</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Viewer Pass at $4.99/mo or Submitter Pass at $2.99/mo for approved directors. Year Pass only $39.99 until Dec 31st! Free trailers for everyone.
              </p>
            </div>
            <a
              href="/#packages"
              className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-gold-500/20 border border-gold-500/40 text-gold-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <CreditCard className="w-4 h-4" /> Explore VIP Passes
            </a>
          </div>

          {/* Card 3: Meet the Jury */}
          <div className="rounded-3xl p-6 bg-surface-card border border-gold-500/30 flex flex-col justify-between space-y-4 hover:border-gold-500/60 transition-all shadow-gold-glow">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-extrabold text-white">Meet the Grand Jury</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Discover the jury panel chaired by Steven Spielberg, Prasanna Vithanage, Vetri Maaran, and industry technicians.
              </p>
            </div>
            <Link
              href="/judges"
              className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Trophy className="w-4 h-4 text-gold-400" /> View Jury Profiles
            </Link>
          </div>

        </section>

      </div>

    </main>
  );
}
