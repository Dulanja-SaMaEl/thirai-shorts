"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award, Star, Clapperboard, Camera, Music, Scissors, Globe,
  Sparkles, ShieldCheck, ChevronRight, X, ExternalLink, Film,
  UserCheck, ArrowRight, BookOpen, Trophy, Quote
} from 'lucide-react';
import api from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';
import { DEFAULT_JUDGES, JURY_DIVISIONS } from './judgesData';

export default function JudgesPage() {
  const { currentLanguage, t } = useLanguage();
  const [judgesList, setJudgesList] = useState(DEFAULT_JUDGES);
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [activeModalJudge, setActiveModalJudge] = useState(null);

  // Load custom judges from localStorage and sync with backend API
  useEffect(() => {
    // 1. Instant cache load from localStorage
    try {
      const cached = localStorage.getItem('thirai_custom_judges');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setJudgesList(parsed);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh judges from API
    fetchJudges();

    // 3. Listen for cross-tab or admin storage updates
    const handleStorageChange = (e) => {
      if (e.key === 'thirai_custom_judges' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setJudgesList(parsed);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchJudges = async () => {
    try {
      const res = await api.get('/judges');
      if (res.data?.success && Array.isArray(res.data.judges) && res.data.judges.length > 0) {
        setJudgesList(res.data.judges);
        try {
          localStorage.setItem('thirai_custom_judges', JSON.stringify(res.data.judges));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Using default judges fallback:', err);
    }
  };

  // Dynamic Tallying Metrics
  const totalJurorsCount = judgesList.length;
  const uniqueNationsCount = new Set(judgesList.map(j => j.country).filter(Boolean)).size || 1;

  // Dynamically tallied divisions with counts
  const divisions = JURY_DIVISIONS.map(div => {
    const count = div.id === 'all'
      ? judgesList.length
      : judgesList.filter(j => j.division === div.id).length;
    const label = t(`jury.${div.labelKey}`, div.defaultLabel);
    return {
      id: div.id,
      label: `${label} (${count})`
    };
  });

  const filteredJudges = selectedDivision === 'all'
    ? judgesList
    : judgesList.filter(j => j.division === selectedDivision);

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden py-14 sm:py-20 border-b border-white/[0.06] bg-[#090b10]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-5">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-mono tracking-wider">
            <Award className="w-3.5 h-3.5 text-gold-400" />
            {t('jury.heroBadge', 'OFFICIAL FESTIVAL JURY BOARD • 2026-2027')}
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            {t('jury.heroTitle', 'Meet Our')}{' '}
            <span className="text-gold-400 font-serif">{t('jury.heroTitleHighlight', 'Grand Jury')}</span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
            {t('jury.heroDesc', 'Distinguished filmmakers, National Award winners, and Academy laureates united to discover, evaluate, and honor the visionary creators of contemporary short cinema.')}
          </p>

          {/* Dynamically Tallied Festival Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4">
            <div className="bg-[#0e1118] border border-white/[0.08] rounded-lg p-3.5 text-center">
              <span className="block text-xl sm:text-2xl font-bold text-gold-400 font-mono">
                {totalJurorsCount}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                {t('jury.grandJurors', 'Grand Jurors')}
              </span>
            </div>
            <div className="bg-[#0e1118] border border-white/[0.08] rounded-lg p-3.5 text-center">
              <span className="block text-xl sm:text-2xl font-bold text-white font-mono">
                {uniqueNationsCount}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                {t('jury.nationsRepresented', 'Nations Represented')}
              </span>
            </div>
            <div className="bg-[#0e1118] border border-white/[0.08] rounded-lg p-3.5 text-center">
              <span className="block text-xl sm:text-2xl font-bold text-gold-400 font-mono">22</span>
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                {t('jury.awardCategories', 'Award Categories')}
              </span>
            </div>
            <div className="bg-[#0e1118] border border-white/[0.08] rounded-lg p-3.5 text-center">
              <span className="block text-xl sm:text-2xl font-bold text-emerald-400 font-mono">100%</span>
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                {t('jury.rubricScoring', 'Blind Rubric Scoring')}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* CATEGORY FILTER TABS (Dynamically Tallied) */}
      {/* ========================================================================= */}
      <section className="py-4 px-4 border-b border-white/[0.06] bg-[#07090e]/90 sticky top-16 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-center flex-wrap gap-1.5">
          {divisions.map((div) => (
            <button
              key={div.id}
              onClick={() => setSelectedDivision(div.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedDivision === div.id
                  ? 'bg-gold-500 text-black font-semibold'
                  : 'bg-[#12151f] text-zinc-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {div.label}
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* JURY ROSTER / TEAM GRID */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-14 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredJudges.map((judge) => {
            const isSinhalaOrTamil = currentLanguage === 'si' || currentLanguage === 'ta';
            const showNativeProminent = isSinhalaOrTamil && judge.nativeName && judge.nativeName !== judge.name;

            return (
              <div
                key={judge.id}
                className="group bg-[#0e1118] border border-white/[0.08] hover:border-white/[0.18] rounded-lg overflow-hidden transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Photo Frame (supports local base64 or remote URL) */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
                    <img
                      src={judge.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'}
                      alt={judge.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    {/* Country Flag Pill */}
                    {judge.country && (
                      <div className="absolute top-2.5 left-2.5 bg-black/75 border border-white/[0.1] rounded px-2 py-0.5 text-[10px] font-medium text-white flex items-center gap-1">
                        <span>{judge.countryFlag || '🌐'}</span>
                        <span>{judge.country}</span>
                      </div>
                    )}

                    {/* Division Badge */}
                    {judge.divisionLabel && (
                      <div className="absolute top-2.5 right-2.5 bg-gold-500/15 border border-gold-500/25 rounded px-2 py-0.5 text-[9px] font-mono text-gold-400 font-semibold">
                        {judge.divisionLabel.split(' ')[0]}
                      </div>
                    )}

                    {/* Name Overlay with Native Script & Position */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                      {showNativeProminent ? (
                        <>
                          <h3 className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors leading-tight">
                            {judge.nativeName}
                          </h3>
                          <span className="text-[10px] text-zinc-300 font-medium block">
                            {judge.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <h3 className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors leading-tight">
                            {judge.name}
                          </h3>
                          {judge.nativeName && judge.nativeName !== judge.name && (
                            <span className="text-[10px] text-gold-400 font-medium block">
                              {judge.nativeName}
                            </span>
                          )}
                        </>
                      )}
                      <span className="text-[11px] text-gold-400 font-normal block mt-0.5 line-clamp-1">
                        {judge.role}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 space-y-2.5 text-left">
                    
                    {/* Quote Snippet */}
                    {judge.quote && (
                      <div className="p-2 rounded-md bg-[#080a0f] border border-white/[0.06] text-[10px] text-zinc-400 italic flex gap-1.5">
                        <Quote className="w-3 h-3 text-gold-400 shrink-0 mt-0.5" />
                        <p className="line-clamp-2">"{judge.quote}"</p>
                      </div>
                    )}

                    {/* Key Accolade */}
                    {judge.achievements && judge.achievements.length > 0 && (
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">
                          Distinctions
                        </span>
                        <p className="text-[10px] text-zinc-300 font-normal line-clamp-2">
                          • {judge.achievements[0]}
                        </p>
                      </div>
                    )}

                    {/* Specialization Tags */}
                    {judge.specializations && judge.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {judge.specializations.map((spec, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[9px] text-zinc-400 font-mono"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>
                </div>

                {/* View Bio Button */}
                <div className="p-3.5 pt-0">
                  <button
                    onClick={() => setActiveModalJudge(judge)}
                    className="w-full py-2 px-2.5 rounded-md bg-[#141824] hover:bg-gold-500 hover:text-black border border-white/[0.08] hover:border-gold-400 text-xs font-semibold text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> {t('jury.viewProfile', 'View Juror Profile')}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* JUDGING RUBRIC & EVALUATION STANDARDS */}
      {/* ========================================================================= */}
      <section className="py-12 bg-[#07090e] border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 text-center">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-mono">
              <Award className="w-3.5 h-3.5" /> JURY SCORING PILLARS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How the Grand Jury Evaluates Submissions</h2>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto font-normal">
              Our judges uphold the highest festival standards through a double-blind, 1-to-10 numerical rubric evaluating four core creative pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            <div className="p-4 rounded-lg bg-[#0e1118] border border-white/[0.08] space-y-1.5">
              <div className="w-8 h-8 rounded-md bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                <Film className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">1. Screenplay & Arc</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                Story originality, character depth, economy of dialogue, and narrative impact within the 40-minute limit.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#0e1118] border border-white/[0.08] space-y-1.5">
              <div className="w-8 h-8 rounded-md bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                <Camera className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">2. Visual Directing</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                Intentional framing, lighting architecture, color palette control, and visual storytelling without dialogue crutches.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#0e1118] border border-white/[0.08] space-y-1.5">
              <div className="w-8 h-8 rounded-md bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                <Music className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">3. Audiography & Score</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                Foley immersion, dialogue clarity, environmental spatial mixing, and emotive musical orchestration.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#0e1118] border border-white/[0.08] space-y-1.5">
              <div className="w-8 h-8 rounded-md bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                <Scissors className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">4. Editing & Pacing</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                Rhythm of scene transitions, temporal momentum, avoidance of filler, and structural cohesion.
              </p>
            </div>
          </div>

          <div className="pt-1">
            <Link
              href="/jury-guidelines"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" /> Read Complete Official Jury Guidelines & Code of Ethics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SUBMISSION CALLOUT BANNER */}
      {/* ========================================================================= */}
      <section className="py-12 px-4 border-t border-white/[0.06] bg-[#090b10]">
        <div className="max-w-3xl mx-auto rounded-xl bg-[#0e1118] border border-white/[0.08] p-6 sm:p-8 text-center space-y-4">
          <div className="w-10 h-10 rounded-md bg-gold-500/10 border border-gold-500/20 mx-auto flex items-center justify-center text-gold-400">
            <Trophy className="w-5 h-5" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Have Your Film Screened & Evaluated by World-Class Jurors
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-normal">
              Submissions for the 2026-2027 season close on <strong className="text-zinc-200">November 30th, 2026</strong>. Compete across 22 official awards with cash prizes and global distribution opportunities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/upload"
              className="gold-btn py-2.5 px-6 rounded-md text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 text-black hover:opacity-95"
            >
              <Clapperboard className="w-4 h-4" /> Submit Short Film ($4.99)
            </Link>
            <a
              href="/#packages"
              className="py-2.5 px-6 rounded-md bg-[#141824] border border-white/[0.08] hover:border-white/[0.16] text-xs font-semibold text-zinc-300 hover:text-white uppercase tracking-wider transition-colors"
            >
              VIP Passes ($4.99/mo)
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DETAILED JUROR DOSSIER MODAL */}
      {/* ========================================================================= */}
      {activeModalJudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0e1118] border border-white/[0.1] rounded-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#12151f]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {activeModalJudge.name}
                  </h3>
                  {activeModalJudge.nativeName && activeModalJudge.nativeName !== activeModalJudge.name && (
                    <span className="text-xs text-gold-400 font-medium block">
                      {activeModalJudge.nativeName}
                    </span>
                  )}
                  <span className="text-xs text-zinc-400 font-normal">
                    {activeModalJudge.role} • {activeModalJudge.country} {activeModalJudge.countryFlag}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveModalJudge(null)}
                className="p-1.5 rounded-md bg-[#1b2030] text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-5 overflow-y-auto space-y-5 text-left">
              
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <img
                  src={activeModalJudge.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'}
                  alt={activeModalJudge.name}
                  className="w-28 h-36 sm:w-36 sm:h-44 rounded-md object-cover border border-white/[0.08] shrink-0"
                />
                
                <div className="space-y-2.5 flex-grow">
                  <div className="p-3 rounded-md bg-[#080a0f] border border-white/[0.06] text-xs text-zinc-300 italic flex gap-2">
                    <Quote className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                    <p>"{activeModalJudge.quote}"</p>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-gold-400 mb-1.5">
                      {t('jury.specializations', 'Core Specializations')}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeModalJudge.specializations?.map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-750 text-xs font-mono text-zinc-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400">
                  Biography & Background
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {activeModalJudge.bio}
                </p>
              </div>

              {/* Key Achievements */}
              {activeModalJudge.achievements && activeModalJudge.achievements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400">
                    {t('jury.keyAchievements', 'Key Career Honors & Achievements')}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {activeModalJudge.achievements.map((ach, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400 shrink-0" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Judging Criteria */}
              {activeModalJudge.criteria && (
                <div className="p-3.5 rounded-lg bg-gold-500/10 border border-gold-500/20 space-y-1">
                  <h4 className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-gold-400" /> {t('jury.judgingCriteria', 'Evaluation & Screening Criteria')}
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                    {activeModalJudge.criteria}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-white/[0.08] bg-[#12151f] flex justify-end">
              <button
                onClick={() => setActiveModalJudge(null)}
                className="px-4 py-2 rounded-md bg-[#1b2030] hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
              >
                {t('jury.closeDossier', 'Close Juror Dossier')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
